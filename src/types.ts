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

export interface ChatMessage extends MessageEventDraft {
  id: number;
  time: number;
}

export interface TestGroup {
  groupId: number;
  groupName: string;
  memberCount: number;
  maxMemberCount: number;
  role: 'owner' | 'admin' | 'member';
  remark: string;
  lastActive: string;
}

export interface TestFriend {
  userId: number;
  nickname: string;
  remark: string;
  category: string;
  qid: string;
  status: 'online' | 'away' | 'offline';
  lastActive: string;
}
