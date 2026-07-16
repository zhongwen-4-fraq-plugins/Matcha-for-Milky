mod server;
mod state;

use serde_json::Value;
use tauri::State;

pub use state::MilkyState;

#[tauri::command]
pub async fn start_milky_server(
    app_handle: tauri::AppHandle,
    state: State<'_, MilkyState>,
    host: String,
    port: u16,
    access_token: String,
    timeout: u64,
) -> Result<(), String> {
    server::start(
        &state,
        app_handle,
        server::ServerConfig {
            host,
            port,
            access_token,
            timeout,
        },
    )
    .await
}

#[tauri::command]
pub async fn stop_milky_server(state: State<'_, MilkyState>) -> Result<(), String> {
    server::stop(&state).await
}

#[tauri::command]
pub fn emit_milky_event(state: State<'_, MilkyState>, event: Value) -> Result<(), String> {
    state.emit_event(event)
}

#[tauri::command]
pub async fn resolve_milky_action(
    state: State<'_, MilkyState>,
    request_id: u64,
    response: Value,
) -> Result<(), String> {
    state.resolve_action(request_id, response).await
}
