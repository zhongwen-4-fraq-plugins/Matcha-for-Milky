mod commands;
mod events;
mod models;
mod server;
mod state;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::server_snapshot,
            commands::start_server,
            commands::stop_server,
            commands::emit_message_event,
            commands::clear_history,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Fraq Debug");
}
