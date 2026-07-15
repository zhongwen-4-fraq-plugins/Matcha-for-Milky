import { invoke } from '@tauri-apps/api/core';
import type { MessageEventDraft, ServerConfig, ServerSnapshot } from '../types';

let previewSnapshot: ServerSnapshot = {
  running: false,
  host: '127.0.0.1',
  port: 30001,
  selfId: 10001,
  accessTokenEnabled: false,
  clientCount: 0,
  emittedEvents: 0,
  apiCalls: [],
  activity: [
    {
      id: 1,
      level: 'info',
      message: '测试工作台已就绪',
      time: Math.floor(Date.now() / 1000),
    },
  ],
};

function isDesktop() {
  return '__TAURI_INTERNALS__' in window;
}

export async function getServerSnapshot() {
  if (isDesktop()) {
    return invoke<ServerSnapshot>('server_snapshot');
  }
  return structuredClone(previewSnapshot);
}

export async function startServer(config: ServerConfig) {
  if (isDesktop()) {
    return invoke<ServerSnapshot>('start_server', { config });
  }
  previewSnapshot = {
    ...previewSnapshot,
    running: true,
    host: config.host,
    port: config.port,
    selfId: config.selfId,
    accessTokenEnabled: config.accessToken.length > 0,
    activity: [
      {
        id: Date.now(),
        level: 'success',
        message: `Milky 模拟服务已监听 ${config.host}:${config.port}`,
        time: Math.floor(Date.now() / 1000),
      },
      ...previewSnapshot.activity,
    ],
  };
  return getServerSnapshot();
}

export async function stopServer() {
  if (isDesktop()) {
    return invoke<ServerSnapshot>('stop_server');
  }
  previewSnapshot.running = false;
  previewSnapshot.clientCount = 0;
  previewSnapshot.activity.unshift({
    id: Date.now(),
    level: 'warning',
    message: 'Milky 模拟服务已停止',
    time: Math.floor(Date.now() / 1000),
  });
  return getServerSnapshot();
}

export async function emitMessageEvent(draft: MessageEventDraft) {
  if (isDesktop()) {
    return invoke<ServerSnapshot>('emit_message_event', { draft });
  }
  previewSnapshot.emittedEvents += 1;
  previewSnapshot.activity.unshift({
    id: Date.now(),
    level: 'success',
    message: `已注入 ${draft.scene} 消息：${draft.text}`,
    time: Math.floor(Date.now() / 1000),
  });
  return getServerSnapshot();
}

export async function clearHistory() {
  if (isDesktop()) {
    return invoke<ServerSnapshot>('clear_history');
  }
  previewSnapshot.apiCalls = [];
  previewSnapshot.activity = [];
  return getServerSnapshot();
}
