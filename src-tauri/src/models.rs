use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub self_id: u64,
    pub access_token: String,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            host: "127.0.0.1".into(),
            port: 30001,
            self_id: 10001,
            access_token: String::new(),
        }
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiCallRecord {
    pub id: u64,
    pub endpoint: String,
    pub params: Value,
    pub time: u64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityEntry {
    pub id: u64,
    pub level: ActivityLevel,
    pub message: String,
    pub time: u64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ActivityLevel {
    Info,
    Success,
    Warning,
    Error,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServerSnapshot {
    pub running: bool,
    pub host: String,
    pub port: u16,
    pub self_id: u64,
    pub access_token_enabled: bool,
    pub client_count: usize,
    pub emitted_events: u64,
    pub api_calls: Vec<ApiCallRecord>,
    pub activity: Vec<ActivityEntry>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageEventDraft {
    pub scene: MessageScene,
    pub peer_id: u64,
    pub sender_id: u64,
    pub text: String,
}

#[derive(Clone, Copy, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MessageScene {
    Friend,
    Group,
    Temp,
}

impl MessageScene {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Friend => "friend",
            Self::Group => "group",
            Self::Temp => "temp",
        }
    }
}
