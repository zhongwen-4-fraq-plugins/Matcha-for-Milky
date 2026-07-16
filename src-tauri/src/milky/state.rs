use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Mutex as StdMutex,
    },
};

use serde_json::Value;
use tauri::Emitter;
use tokio::{
    sync::{broadcast, oneshot, Mutex},
    task::JoinHandle,
};

pub struct RunningServer {
    pub shutdown: oneshot::Sender<()>,
    pub task: JoinHandle<()>,
}

pub struct ClientGuard {
    app_handle: tauri::AppHandle,
    client_count: Arc<StdMutex<usize>>,
}

impl Drop for ClientGuard {
    fn drop(&mut self) {
        let mut client_count = self
            .client_count
            .lock()
            .unwrap_or_else(|error| error.into_inner());
        *client_count = client_count.saturating_sub(1);
        let _ = self.app_handle.emit("milky-client-count", *client_count);
    }
}

#[derive(Clone)]
pub struct MilkyState {
    server: Arc<Mutex<Option<RunningServer>>>,
    events: broadcast::Sender<String>,
    pending_actions: Arc<Mutex<HashMap<u64, oneshot::Sender<Value>>>>,
    next_request_id: Arc<AtomicU64>,
    client_count: Arc<StdMutex<usize>>,
}

impl MilkyState {
    pub fn new() -> Self {
        Self {
            server: Arc::new(Mutex::new(None)),
            events: broadcast::channel(128).0,
            pending_actions: Arc::new(Mutex::new(HashMap::new())),
            next_request_id: Arc::new(AtomicU64::new(1)),
            client_count: Arc::new(StdMutex::new(0)),
        }
    }

    pub async fn set_server(&self, server: RunningServer) {
        *self.server.lock().await = Some(server);
    }

    pub async fn take_server(&self) -> Option<RunningServer> {
        self.server.lock().await.take()
    }

    pub fn subscribe(&self) -> broadcast::Receiver<String> {
        self.events.subscribe()
    }

    pub fn emit_event(&self, event: Value) -> Result<(), String> {
        let payload = serde_json::to_string(&event).map_err(|error| error.to_string())?;
        let _ = self.events.send(payload);
        Ok(())
    }

    pub fn connect_client(&self, app_handle: tauri::AppHandle) -> ClientGuard {
        let mut client_count = self
            .client_count
            .lock()
            .unwrap_or_else(|error| error.into_inner());
        *client_count += 1;
        let _ = app_handle.emit("milky-client-count", *client_count);
        drop(client_count);
        ClientGuard {
            app_handle,
            client_count: Arc::clone(&self.client_count),
        }
    }

    pub async fn create_action(&self) -> (u64, oneshot::Receiver<Value>) {
        let request_id = self.next_request_id.fetch_add(1, Ordering::Relaxed);
        let (sender, receiver) = oneshot::channel();
        self.pending_actions.lock().await.insert(request_id, sender);
        (request_id, receiver)
    }

    pub async fn cancel_action(&self, request_id: u64) {
        self.pending_actions.lock().await.remove(&request_id);
    }

    pub async fn resolve_action(&self, request_id: u64, response: Value) -> Result<(), String> {
        let sender = self
            .pending_actions
            .lock()
            .await
            .remove(&request_id)
            .ok_or_else(|| format!("Milky API request {request_id} is no longer pending"))?;
        sender
            .send(response)
            .map_err(|_| format!("Milky API request {request_id} was cancelled"))
    }
}

impl Default for MilkyState {
    fn default() -> Self {
        Self::new()
    }
}
