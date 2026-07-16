use std::{convert::Infallible, time::Duration};

use async_stream::stream;
use axum::{
    body::Bytes,
    extract::{ws::Message, FromRequestParts, Path, Query, Request, State, WebSocketUpgrade},
    http::{header::CONTENT_TYPE, HeaderMap, StatusCode},
    response::{sse::Event, IntoResponse, Response, Sse},
    routing::{get, post},
    Json, Router,
};
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::Emitter;
use tokio::{net::TcpListener, sync::oneshot};

use super::state::{MilkyState, RunningServer};

pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub access_token: String,
    pub timeout: u64,
}

#[derive(Clone)]
struct ServerState {
    app_handle: tauri::AppHandle,
    milky: MilkyState,
    access_token: String,
    timeout: u64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct ActionRequest {
    request_id: u64,
    action: String,
    params: Value,
}

#[derive(Default, Deserialize)]
struct EventQuery {
    access_token: Option<String>,
}

pub async fn start(
    state: &MilkyState,
    app_handle: tauri::AppHandle,
    config: ServerConfig,
) -> Result<(), String> {
    if config.host.trim().is_empty() {
        return Err("监听地址不能为空".into());
    }

    stop(state).await?;
    let address = format!("{}:{}", config.host, config.port);
    let listener = TcpListener::bind(&address)
        .await
        .map_err(|error| format!("无法监听 {address}: {error}"))?;
    let shared = ServerState {
        app_handle,
        milky: (*state).clone(),
        access_token: config.access_token,
        timeout: config.timeout,
    };
    let router = Router::new()
        .route("/api/{endpoint}", post(handle_api))
        .route("/event", get(handle_event))
        .with_state(shared);
    let (shutdown, receiver) = oneshot::channel();
    let task = tokio::spawn(async move {
        let _ = axum::serve(listener, router)
            .with_graceful_shutdown(async move {
                let _ = receiver.await;
            })
            .await;
    });
    state.set_server(RunningServer { shutdown, task }).await;
    Ok(())
}

pub async fn stop(state: &MilkyState) -> Result<(), String> {
    let Some(server) = state.take_server().await else {
        return Ok(());
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
    Ok(())
}

async fn handle_api(
    State(state): State<ServerState>,
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
        Ok(_) => return failure(-400, "请求参数必须是 JSON 对象"),
        Err(error) => return failure(-400, &format!("无法解析请求参数: {error}")),
    };
    let (request_id, receiver) = state.milky.create_action().await;
    if let Err(error) = state.app_handle.emit(
        "milky-action",
        ActionRequest {
            request_id,
            action: endpoint,
            params,
        },
    ) {
        state.milky.cancel_action(request_id).await;
        return failure(-500, &format!("无法转发 API 请求: {error}"));
    }
    match tokio::time::timeout(Duration::from_secs(state.timeout.max(1)), receiver).await {
        Ok(Ok(response)) => Json(response).into_response(),
        Ok(Err(_)) => failure(-500, "API 请求处理已取消"),
        Err(_) => {
            state.milky.cancel_action(request_id).await;
            failure(-504, "API 请求处理超时")
        }
    }
}

async fn handle_event(State(state): State<ServerState>, request: Request) -> Response {
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
        let milky = state.milky.clone();
        return websocket
            .on_upgrade(move |socket| async move {
                let (mut sender, mut receiver) = socket.split();
                let mut events = milky.subscribe();
                loop {
                    tokio::select! {
                        event = events.recv() => match event {
                            Ok(payload) => {
                                if sender.send(Message::Text(payload.into())).await.is_err() {
                                    break;
                                }
                            }
                            Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => continue,
                            Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
                        },
                        incoming = receiver.next() => match incoming {
                            Some(Ok(Message::Close(_))) | None | Some(Err(_)) => break,
                            _ => {}
                        }
                    }
                }
            })
            .into_response();
    }
    let mut receiver = state.milky.subscribe();
    let events = stream! {
        loop {
            match receiver.recv().await {
                Ok(payload) => yield Ok::<Event, Infallible>(Event::default().data(payload)),
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

fn failure(retcode: i32, message: &str) -> Response {
    Json(json!({
        "status": "failed",
        "retcode": retcode,
        "data": null,
        "message": message,
    }))
    .into_response()
}
