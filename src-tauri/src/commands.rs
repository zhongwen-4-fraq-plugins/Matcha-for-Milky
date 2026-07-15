use tauri::State;

use crate::{
    events::build_message_event,
    models::{ActivityLevel, MessageEventDraft, ServerConfig, ServerSnapshot},
    server,
    state::AppState,
};

#[tauri::command]
pub async fn server_snapshot(state: State<'_, AppState>) -> Result<ServerSnapshot, String> {
    Ok(state.snapshot().await)
}

#[tauri::command]
pub async fn start_server(
    state: State<'_, AppState>,
    config: ServerConfig,
) -> Result<ServerSnapshot, String> {
    server::start(&state, config).await
}

#[tauri::command]
pub async fn stop_server(state: State<'_, AppState>) -> Result<ServerSnapshot, String> {
    server::stop(&state).await
}

#[tauri::command]
pub async fn emit_message_event(
    state: State<'_, AppState>,
    draft: MessageEventDraft,
) -> Result<ServerSnapshot, String> {
    if !state.is_running().await {
        return Err("请先启动 Milky 模拟服务".into());
    }
    if draft.text.trim().is_empty() {
        return Err("消息内容不能为空".into());
    }

    let scene = draft.scene.as_str();
    let event = build_message_event(
        state.snapshot().await.self_id,
        state.next_message_seq().await,
        &draft,
    );
    state.emit(event)?;
    state
        .add_activity(ActivityLevel::Success, format!("已注入 {scene} 消息事件"))
        .await;
    Ok(state.snapshot().await)
}

#[tauri::command]
pub async fn clear_history(state: State<'_, AppState>) -> Result<ServerSnapshot, String> {
    state.clear_history().await;
    Ok(state.snapshot().await)
}
