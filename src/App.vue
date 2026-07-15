<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import AboutView from './components/AboutView.vue';
import ActivityPanel from './components/ActivityPanel.vue';
import AppRail from './components/AppRail.vue';
import ChatTimeline from './components/ChatTimeline.vue';
import EventComposer from './components/EventComposer.vue';
import MainHeader from './components/MainHeader.vue';
import OverviewStrip from './components/OverviewStrip.vue';
import PluginManagerView from './components/PluginManagerView.vue';
import ScenarioList from './components/ScenarioList.vue';
import ServerConfigPanel from './components/ServerConfigPanel.vue';
import { clearHistory, emitMessageEvent, getServerSnapshot, startServer, stopServer } from './services/backend';
import type { ChatMessage, MessageEventDraft, ServerConfig, ServerSnapshot } from './types';

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
const activeView = ref<'workbench' | 'plugins' | 'api' | 'activity' | 'settings' | 'about'>('workbench');
let draft = reactive<MessageEventDraft>({
  scene: 'group',
  peerId: 123456,
  senderId: 10002,
  text: 'echo Hello Fraq',
});
const messages = ref<ChatMessage[]>([]);
const busy = ref(false);
const errorMessage = ref('');
let refreshTimer: number | undefined;

async function run(action: () => Promise<ServerSnapshot>) {
  busy.value = true;
  errorMessage.value = '';
  try {
    snapshot.value = await action();
    return true;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error);
    return false;
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

async function sendEvent(message: MessageEventDraft) {
  if (await run(() => emitMessageEvent(message))) {
    messages.value.push({ ...message, id: Date.now(), time: Math.floor(Date.now() / 1000) });
  }
}

function selectScene(scene: MessageEventDraft['scene']) {
  draft.scene = scene;
  draft.peerId = scene === 'group' ? 123456 : 10002;
  activeView.value = 'workbench';
}

const title = computed(() => {
  if (activeView.value === 'settings') return 'Milky 模拟服务';
  if (activeView.value === 'plugins') return '插件管理';
  if (activeView.value === 'api') return 'API 调用记录';
  if (activeView.value === 'activity') return '活动日志';
  if (activeView.value === 'about') return '关于';
  return draft.scene === 'group' ? '群聊测试' : draft.scene === 'friend' ? '好友测试' : '临时会话';
});

const subtitle = computed(() => {
  if (activeView.value === 'settings') return `http://${config.host}:${config.port}`;
  if (activeView.value === 'plugins') return 'Fraq plugin targets';
  if (activeView.value === 'api') return `${snapshot.value.apiCalls.length} 条请求`;
  if (activeView.value === 'activity') return `${snapshot.value.activity.length} 条记录`;
  if (activeView.value === 'about') return 'Fraq Debug v0.1.0';
  return `${draft.scene} · ${draft.peerId}`;
});

onMounted(() => {
  void refresh();
  refreshTimer = window.setInterval(refresh, 1000);
});

onUnmounted(() => window.clearInterval(refreshTimer));
</script>

<template>
  <div class="app-shell">
    <AppRail :active-view="activeView" @select="activeView = $event" />
    <ScenarioList
      :snapshot="snapshot"
      :active-view="activeView"
      :selected-scene="draft.scene"
      @select-view="activeView = $event"
      @select-scene="selectScene"
    />

    <main class="main-pane">
      <MainHeader
        :title="title"
        :subtitle="subtitle"
        :running="snapshot.running"
        :busy="busy"
        @start="run(() => startServer(config))"
        @stop="run(stopServer)"
        @refresh="refresh"
        @settings="activeView = 'settings'"
      />
      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <template v-if="activeView === 'workbench'">
        <ChatTimeline :messages="messages" :api-calls="snapshot.apiCalls" />
        <EventComposer v-model="draft" :disabled="!snapshot.running || busy" @send="sendEvent" />
      </template>
      <section v-else-if="activeView === 'settings'" class="settings-view">
        <ServerConfigPanel v-model="config" :disabled="snapshot.running || busy" />
        <OverviewStrip :snapshot="snapshot" />
      </section>
      <PluginManagerView v-else-if="activeView === 'plugins'" />
      <AboutView v-else-if="activeView === 'about'" />
      <ActivityPanel
        v-else
        :mode="activeView"
        :api-calls="snapshot.apiCalls"
        :activity="snapshot.activity"
        @clear="run(clearHistory)"
      />
    </main>
  </div>
</template>
