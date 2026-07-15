export interface ServerConfig {
  host: string;
  port: number;
  selfId: number;
  accessToken: string;
}

export interface ApiCallRecord {
  id: number;
  endpoint: string;
  params: unknown;
  time: number;
}

export interface ActivityEntry {
  id: number;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  time: number;
}

export interface ServerSnapshot {
  running: boolean;
  host: string;
  port: number;
  selfId: number;
  accessTokenEnabled: boolean;
  clientCount: number;
  emittedEvents: number;
  apiCalls: ApiCallRecord[];
  activity: ActivityEntry[];
}

export interface MessageEventDraft {
  scene: 'friend' | 'group' | 'temp';
  peerId: number;
  senderId: number;
  text: string;
}
