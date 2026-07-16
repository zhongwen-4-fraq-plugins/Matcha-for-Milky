use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
};

use serde_json::Value;
use tokio::{
    sync::{broadcast, oneshot, Mutex},
    task::JoinHandle,
};

pub struct RunningServer {
    pub shutdown: oneshot::Sender<()>,
    pub task: JoinHandle<()>,
}

#[derive(Clone)]
pub struct MilkyState {
    server: Arc<Mutex<Option<RunningServer>>>,
    events: broadcast::Sender<String>,
    pending_actions: Arc<Mutex<HashMap<u64, oneshot::Sender<Value>>>>,
    next_request_id: Arc<AtomicU64>,
}

impl MilkyState {
    pub fn new() -> Self {
        Self {
            server: Arc::new(Mutex::new(None)),
            events: broadcast::channel(128).0,
            pending_actions: Arc::new(Mutex::new(HashMap::new())),
            next_request_id: Arc::new(AtomicU64::new(1)),
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
