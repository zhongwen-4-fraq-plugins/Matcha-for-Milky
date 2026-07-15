<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { FlaskConical, TestTubeDiagonal } from '@lucide/vue';
import ActivityPanel from './components/ActivityPanel.vue';
import AppHeader from './components/AppHeader.vue';
import EventComposer from './components/EventComposer.vue';
import OverviewStrip from './components/OverviewStrip.vue';
import ServerConfigPanel from './components/ServerConfigPanel.vue';
import { clearHistory, emitMessageEvent, getServerSnapshot, startServer, stopServer } from './services/backend';
import type { MessageEventDraft, ServerConfig, ServerSnapshot } from './types';

let config = reactive<ServerConfig>({
  host: '127.0.0.1',
  port: 30001,
  selfId: 10001,
  accessToken: '',
});
const snapshot = ref<ServerSnapshot>({
  running: false,
  host: config.host,
  port: config.port,
  selfId: config.selfId,
  accessTokenEnabled: false,
  clientCount: 0,
  emittedEvents: 0,
  apiCalls: [],
  activity: [],
});
const busy = ref(false);
const errorMessage = ref('');
let refreshTimer: number | undefined;

async function run(action: () => Promise<ServerSnapshot>) {
  busy.value = true;
  errorMessage.value = '';
  try {
    snapshot.value = await action();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error);
  } finally {
    busy.value = false;
  }
}

async function refresh() {
  try {
    snapshot.value = await getServerSnapshot();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error);
  }
}

function sendEvent(draft: MessageEventDraft) {
  void run(() => emitMessageEvent(draft));
}

onMounted(() => {
  void refresh();
  refreshTimer = window.setInterval(refresh, 1000);
});

onUnmounted(() => window.clearInterval(refreshTimer));
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand-mark"><FlaskConical :size="22" /><span>Fraq Debug</span></div>
      <nav aria-label="主导航">
        <button class="nav-item active" type="button"><TestTubeDiagonal :size="18" />工作台</button>
      </nav>
      <div class="sidebar-status">
        <span :class="snapshot.running ? 'status-dot online' : 'status-dot'" />
        <div><strong>{{ snapshot.running ? '服务运行中' : '服务未启动' }}</strong><small>Milky 1.2.2</small></div>
      </div>
    </aside>

    <main class="workspace">
      <AppHeader
        :running="snapshot.running"
        :busy="busy"
        @start="run(() => startServer(config))"
        @stop="run(stopServer)"
        @refresh="refresh"
      />
      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>
      <div class="workspace-content">
        <ServerConfigPanel v-model="config" :disabled="snapshot.running || busy" />
        <OverviewStrip :snapshot="snapshot" />
        <div class="work-grid">
          <EventComposer :disabled="!snapshot.running || busy" @send="sendEvent" />
          <ActivityPanel :api-calls="snapshot.apiCalls" :activity="snapshot.activity" @clear="run(clearHistory)" />
        </div>
      </div>
    </main>
  </div>
</template>
