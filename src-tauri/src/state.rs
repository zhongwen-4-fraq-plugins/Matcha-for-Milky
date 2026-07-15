use std::{
    sync::{
        Arc,
        atomic::{AtomicU64, AtomicUsize, Ordering},
    },
    time::{SystemTime, UNIX_EPOCH},
};

use serde_json::Value;
use tokio::{
    sync::{Mutex, broadcast, oneshot},
    task::JoinHandle,
};

use crate::models::{ActivityEntry, ActivityLevel, ApiCallRecord, ServerConfig, ServerSnapshot};

pub struct RunningServer {
    pub shutdown: oneshot::Sender<()>,
    pub task: JoinHandle<()>,
}

struct RuntimeState {
    config: ServerConfig,
    server: Option<RunningServer>,
    api_calls: Vec<ApiCallRecord>,
    activity: Vec<ActivityEntry>,
    next_id: u64,
    next_message_seq: u64,
}

#[derive(Clone)]
pub struct AppState {
    inner: Arc<Mutex<RuntimeState>>,
    events: broadcast::Sender<String>,
    client_count: Arc<AtomicUsize>,
    emitted_events: Arc<AtomicU64>,
}

pub struct ClientGuard {
    client_count: Arc<AtomicUsize>,
}

impl Drop for ClientGuard {
    fn drop(&mut self) {
        self.client_count.fetch_sub(1, Ordering::Relaxed);
    }
}

impl AppState {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(RuntimeState {
                config: ServerConfig::default(),
                server: None,
                api_calls: Vec::new(),
                activity: vec![ActivityEntry {
                    id: 1,
                    level: ActivityLevel::Info,
                    message: "测试工作台已就绪".into(),
                    time: unix_time(),
                }],
                next_id: 2,
                next_message_seq: 1,
            })),
            events: broadcast::channel(128).0,
            client_count: Arc::new(AtomicUsize::new(0)),
            emitted_events: Arc::new(AtomicU64::new(0)),
        }
    }

    pub async fn is_running(&self) -> bool {
        self.inner.lock().await.server.is_some()
    }

    pub async fn set_server(&self, config: ServerConfig, server: RunningServer) {
        let mut inner = self.inner.lock().await;
        inner.config = config;
        inner.server = Some(server);
    }

    pub async fn take_server(&self) -> Option<RunningServer> {
        self.inner.lock().await.server.take()
    }

    pub async fn snapshot(&self) -> ServerSnapshot {
        let inner = self.inner.lock().await;
        ServerSnapshot {
            running: inner.server.is_some(),
            host: inner.config.host.clone(),
            port: inner.config.port,
            self_id: inner.config.self_id,
            access_token_enabled: !inner.config.access_token.is_empty(),
            client_count: self.client_count.load(Ordering::Relaxed),
            emitted_events: self.emitted_events.load(Ordering::Relaxed),
            api_calls: inner.api_calls.clone(),
            activity: inner.activity.clone(),
        }
    }

    pub async fn record_api_call(&self, endpoint: String, params: Value) {
        let mut inner = self.inner.lock().await;
        let id = inner.next_id;
        inner.next_id += 1;
        inner.api_calls.insert(
            0,
            ApiCallRecord {
                id,
                endpoint,
                params,
                time: unix_time(),
            },
        );
        if inner.api_calls.len() > 200 {
            inner.api_calls.pop();
        }
    }

    pub async fn add_activity(&self, level: ActivityLevel, message: impl Into<String>) {
        let mut inner = self.inner.lock().await;
        let id = inner.next_id;
        inner.next_id += 1;
        inner.activity.insert(
            0,
            ActivityEntry {
                id,
                level,
                message: message.into(),
                time: unix_time(),
            },
        );
        if inner.activity.len() > 200 {
            inner.activity.pop();
        }
    }

    pub async fn next_message_seq(&self) -> u64 {
        let mut inner = self.inner.lock().await;
        let value = inner.next_message_seq;
        inner.next_message_seq += 1;
        value
    }

    pub fn subscribe(&self) -> broadcast::Receiver<String> {
        self.events.subscribe()
    }

    pub fn emit(&self, event: Value) -> Result<(), String> {
        let payload = serde_json::to_string(&event).map_err(|error| error.to_string())?;
        let _ = self.events.send(payload);
        self.emitted_events.fetch_add(1, Ordering::Relaxed);
        Ok(())
    }

    pub fn connect_client(&self) -> ClientGuard {
        self.client_count.fetch_add(1, Ordering::Relaxed);
        ClientGuard {
            client_count: Arc::clone(&self.client_count),
        }
    }

    pub async fn clear_history(&self) {
        let mut inner = self.inner.lock().await;
        inner.api_calls.clear();
        inner.activity.clear();
    }
}

pub fn unix_time() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
