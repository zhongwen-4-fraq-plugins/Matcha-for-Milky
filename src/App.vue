<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import AboutView from './components/AboutView.vue';
import AddContactDialog from './components/AddContactDialog.vue';
import ActivityPanel from './components/ActivityPanel.vue';
import AppRail from './components/AppRail.vue';
import ChatTimeline from './components/ChatTimeline.vue';
import EventComposer from './components/EventComposer.vue';
import FriendDetailView from './components/FriendDetailView.vue';
import GroupDetailView from './components/GroupDetailView.vue';
import MainHeader from './components/MainHeader.vue';
import OverviewStrip from './components/OverviewStrip.vue';
import PluginManagerView from './components/PluginManagerView.vue';
import ScenarioList from './components/ScenarioList.vue';
import ServerConfigPanel from './components/ServerConfigPanel.vue';
import { clearHistory, emitMessageEvent, getServerSnapshot, startServer, stopServer } from './services/backend';
import type { ChatMessage, MessageEventDraft, ServerConfig, ServerSnapshot, TestFriend, TestGroup } from './types';

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
const activeView = ref<'workbench' | 'plugins' | 'groups' | 'friends' | 'api' | 'activity' | 'settings' | 'about'>('workbench');
const groups = ref<TestGroup[]>([
  { groupId: 123456, groupName: 'Fraq 测试群', memberCount: 128, maxMemberCount: 500, role: 'owner', remark: '插件联调', lastActive: '07:46' },
  { groupId: 654321, groupName: 'Milky 协议交流群', memberCount: 386, maxMemberCount: 500, role: 'admin', remark: '协议事件测试', lastActive: '07:31' },
  { groupId: 100001, groupName: '机器人沙盒', memberCount: 24, maxMemberCount: 200, role: 'member', remark: '隔离测试环境', lastActive: '昨天' },
]);
const selectedGroupId = ref(123456);
const friends = ref<TestFriend[]>([
  { userId: 10002, nickname: 'Alice', remark: '测试用户', category: '插件测试', qid: 'AliceTest', status: 'online', lastActive: '07:52' },
  { userId: 10003, nickname: 'Bob', remark: '图像插件作者', category: '开发者', qid: 'BobDev', status: 'away', lastActive: '07:38' },
  { userId: 10004, nickname: 'Carol', remark: '', category: '默认分组', qid: '', status: 'offline', lastActive: '昨天' },
]);
const selectedFriendId = ref(10002);
const addMode = ref<'group' | 'friend'>();
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

function testGroup(groupId: number) {
  draft.scene = 'group';
  draft.peerId = groupId;
  activeView.value = 'workbench';
}

function testFriend(userId: number) {
  draft.scene = 'friend';
  draft.peerId = userId;
  activeView.value = 'workbench';
}

function addGroup(groupId: number, groupName: string) {
  if (!groups.value.some((group) => group.groupId === groupId)) {
    groups.value.push({ groupId, groupName, memberCount: 1, maxMemberCount: 200, role: 'member', remark: '', lastActive: '刚刚' });
  }
  selectedGroupId.value = groupId;
  activeView.value = 'groups';
  addMode.value = undefined;
}

function addFriend(userId: number, nickname: string, remark: string) {
  if (!friends.value.some((friend) => friend.userId === userId)) {
    friends.value.push({ userId, nickname, remark, category: '默认分组', qid: '', status: 'offline', lastActive: '刚刚' });
  }
  selectedFriendId.value = userId;
  activeView.value = 'friends';
  addMode.value = undefined;
}

const selectedGroup = computed(() => groups.value.find((group) => group.groupId === selectedGroupId.value));
const selectedFriend = computed(() => friends.value.find((friend) => friend.userId === selectedFriendId.value));

const title = computed(() => {
  if (activeView.value === 'settings') return 'Milky 模拟服务';
  if (activeView.value === 'plugins') return '插件管理';
  if (activeView.value === 'groups') return selectedGroup.value?.groupName || '群列表';
  if (activeView.value === 'friends') return selectedFriend.value?.remark || selectedFriend.value?.nickname || '好友列表';
  if (activeView.value === 'api') return 'API 调用记录';
  if (activeView.value === 'activity') return '活动日志';
  if (activeView.value === 'about') return '关于';
  return draft.scene === 'group' ? '群聊测试' : draft.scene === 'friend' ? '好友测试' : '临时会话';
});

const subtitle = computed(() => {
  if (activeView.value === 'settings') return `http://${config.host}:${config.port}`;
  if (activeView.value === 'plugins') return 'Fraq plugin targets';
  if (activeView.value === 'groups') return selectedGroup.value ? `group · ${selectedGroup.value.groupId}` : '0 个群';
  if (activeView.value === 'friends') return selectedFriend.value ? `friend · ${selectedFriend.value.userId}` : '0 个好友';
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
      :groups="groups"
      :selected-group-id="selectedGroupId"
      :friends="friends"
      :selected-friend-id="selectedFriendId"
      @select-view="activeView = $event"
      @select-scene="selectScene"
      @select-group="selectedGroupId = $event"
      @select-friend="selectedFriendId = $event"
      @add="addMode = $event"
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
      <GroupDetailView v-else-if="activeView === 'groups'" :group="selectedGroup" @test="testGroup" />
      <FriendDetailView v-else-if="activeView === 'friends'" :friend="selectedFriend" @test="testFriend" />
      <AboutView v-else-if="activeView === 'about'" />
      <ActivityPanel
        v-else
        :mode="activeView"
        :api-calls="snapshot.apiCalls"
        :activity="snapshot.activity"
        @clear="run(clearHistory)"
      />
    </main>
    <AddContactDialog
      v-if="addMode"
      :mode="addMode"
      @close="addMode = undefined"
      @add-group="addGroup"
      @add-friend="addFriend"
    />
  </div>
</template>
