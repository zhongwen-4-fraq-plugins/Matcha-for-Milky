use std::{convert::Infallible, time::Duration};

use async_stream::stream;
use axum::{
    Json, Router,
    body::Bytes,
    extract::{FromRequestParts, Path, Query, Request, State, WebSocketUpgrade, ws::Message},
    http::{HeaderMap, StatusCode, header::CONTENT_TYPE},
    response::{IntoResponse, Response, Sse, sse::Event},
    routing::{get, post},
};
use futures_util::{SinkExt, StreamExt};
use serde::Deserialize;
use serde_json::{Value, json};
use tokio::{net::TcpListener, sync::oneshot};

use crate::{
    models::{ActivityLevel, ServerConfig, ServerSnapshot},
    state::{AppState, RunningServer, unix_time},
};

#[derive(Clone)]
struct MilkyServerState {
    app: AppState,
    self_id: u64,
    access_token: String,
}

#[derive(Default, Deserialize)]
struct EventQuery {
    access_token: Option<String>,
}

pub async fn start(app: &AppState, config: ServerConfig) -> Result<ServerSnapshot, String> {
    if app.is_running().await {
        return Err("Milky 模拟服务已经在运行".into());
    }
    if config.host.trim().is_empty() {
        return Err("监听地址不能为空".into());
    }

    let address = format!("{}:{}", config.host, config.port);
    let listener = TcpListener::bind(&address)
        .await
        .map_err(|error| format!("无法监听 {address}: {error}"))?;
    let state = MilkyServerState {
        app: app.clone(),
        self_id: config.self_id,
        access_token: config.access_token.clone(),
    };
    let router = Router::new()
        .route("/api/{endpoint}", post(handle_api))
        .route("/event", get(handle_event))
        .with_state(state);
    let (shutdown, receiver) = oneshot::channel();
    let task = tokio::spawn(async move {
        let _ = axum::serve(listener, router)
            .with_graceful_shutdown(async move {
                let _ = receiver.await;
            })
            .await;
    });

    app.set_server(config, RunningServer { shutdown, task })
        .await;
    app.add_activity(
        ActivityLevel::Success,
        format!("Milky 模拟服务已监听 {address}"),
    )
    .await;
    Ok(app.snapshot().await)
}

pub async fn stop(app: &AppState) -> Result<ServerSnapshot, String> {
    let Some(server) = app.take_server().await else {
        return Err("Milky 模拟服务尚未启动".into());
    };
    let _ = server.shutdown.send(());
    let mut task = server.task;
    if tokio::time::timeout(Duration::from_secs(1), &mut task)
        .await
        .is_err()
    {
        task.abort();
        let _ = task.await;
    }
    app.add_activity(ActivityLevel::Warning, "Milky 模拟服务已停止")
        .await;
    Ok(app.snapshot().await)
}

async fn handle_api(
    State(state): State<MilkyServerState>,
    Path(endpoint): Path<String>,
    headers: HeaderMap,
    body: Bytes,
) -> Response {
    if !authorized(&state.access_token, &headers, None) {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    if !headers
        .get(CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .is_some_and(|value| value.starts_with("application/json"))
    {
        return StatusCode::UNSUPPORTED_MEDIA_TYPE.into_response();
    }
    let params = match serde_json::from_slice::<Value>(&body) {
        Ok(Value::Object(params)) => Value::Object(params),
        Ok(_) => {
            return milky_failure(-400, "请求参数必须是 JSON 对象");
        }
        Err(error) => {
            return milky_failure(-400, &format!("无法解析请求参数: {error}"));
        }
    };

    state
        .app
        .record_api_call(endpoint.clone(), params.clone())
        .await;
    state
        .app
        .add_activity(
            ActivityLevel::Info,
            format!("收到 API 调用 /api/{endpoint}"),
        )
        .await;

    let data = match endpoint.as_str() {
        "get_login_info" => json!({
            "uin": state.self_id,
            "nickname": "Fraq Test Bot"
        }),
        "get_impl_info" => json!({
            "impl_name": "fraq-debug",
            "impl_version": env!("CARGO_PKG_VERSION"),
            "qq_protocol_version": "mock",
            "qq_protocol_type": "windows",
            "milky_version": "1.2"
        }),
        "send_private_message" | "send_group_message" => json!({
            "message_seq": state.app.next_message_seq().await,
            "time": unix_time()
        }),
        _ => json!({}),
    };

    Json(json!({
        "status": "ok",
        "retcode": 0,
        "data": data
    }))
    .into_response()
}

async fn handle_event(State(state): State<MilkyServerState>, request: Request) -> Response {
    let query = Query::<EventQuery>::try_from_uri(request.uri())
        .map(|query| query.0)
        .unwrap_or_default();
    if !authorized(
        &state.access_token,
        request.headers(),
        query.access_token.as_deref(),
    ) {
        return StatusCode::UNAUTHORIZED.into_response();
    }

    if request
        .headers()
        .get("upgrade")
        .and_then(|value| value.to_str().ok())
        .is_some_and(|value| value.eq_ignore_ascii_case("websocket"))
    {
        let (mut parts, _) = request.into_parts();
        let websocket = match WebSocketUpgrade::from_request_parts(&mut parts, &state).await {
            Ok(websocket) => websocket,
            Err(error) => return error.into_response(),
        };
        let app = state.app.clone();
        return websocket
            .on_upgrade(move |socket| async move {
                let _client = app.connect_client();
                app.add_activity(ActivityLevel::Success, "WebSocket 事件客户端已连接")
                    .await;
                let (mut sender, mut receiver) = socket.split();
                let mut events = app.subscribe();
                loop {
                    tokio::select! {
                        event = events.recv() => match event {
                            Ok(payload) => {
                                if sender.send(Message::Text(payload.into())).await.is_err() {
                                    break;
                                }
                            }
                            Err(_) => break,
                        },
                        incoming = receiver.next() => match incoming {
                            Some(Ok(Message::Close(_))) | None | Some(Err(_)) => break,
                            _ => {}
                        }
                    }
                }
                app.add_activity(ActivityLevel::Warning, "WebSocket 事件客户端已断开")
                    .await;
            })
            .into_response();
    }

    let app = state.app.clone();
    let mut receiver = app.subscribe();
    let events = stream! {
        let _client = app.connect_client();
        app.add_activity(ActivityLevel::Success, "SSE 事件客户端已连接").await;
        loop {
            match receiver.recv().await {
                Ok(payload) => yield Ok::<Event, Infallible>(Event::default().event("milky_event").data(payload)),
                Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => continue,
                Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
            }
        }
    };
    Sse::new(events)
        .keep_alive(axum::response::sse::KeepAlive::new().interval(Duration::from_secs(15)))
        .into_response()
}

fn authorized(access_token: &str, headers: &HeaderMap, query_token: Option<&str>) -> bool {
    if access_token.is_empty() {
        return true;
    }
    headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .is_some_and(|value| value == format!("Bearer {access_token}"))
        || query_token.is_some_and(|value| value == access_token)
}

fn milky_failure(retcode: i32, message: &str) -> Response {
    Json(json!({
        "status": "failed",
        "retcode": retcode,
        "message": message
    }))
    .into_response()
}
