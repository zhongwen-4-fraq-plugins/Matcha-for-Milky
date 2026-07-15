<script setup lang="ts">
import { ref } from 'vue';
import { Braces, Clock3, Plus, Search, ServerCog, TerminalSquare, UserRound, UsersRound } from '@lucide/vue';
import type { MessageEventDraft, ServerSnapshot } from '../types';

const props = defineProps<{
  snapshot: ServerSnapshot;
  activeView: 'workbench' | 'api' | 'activity' | 'settings' | 'about';
  selectedScene: MessageEventDraft['scene'];
}>();

const emit = defineEmits<{
  selectView: [view: 'api' | 'activity' | 'settings'];
  selectScene: [scene: MessageEventDraft['scene']];
}>();

const search = ref('');

function matches(text: string) {
  return text.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase());
}

function formatTime(time: number | undefined) {
  return time ? new Date(time * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--';
}
</script>

<template>
  <aside class="scenario-pane">
    <div class="scenario-search">
      <label><Search :size="17" /><input v-model="search" placeholder="搜索" /></label>
      <button type="button" title="服务配置" @click="emit('selectView', 'settings')"><Plus :size="20" /></button>
    </div>

    <div class="scenario-list">
      <button
        v-if="matches('Milky 模拟服务')"
        type="button"
        class="scenario-item pinned"
        :class="{ selected: activeView === 'settings' }"
        @click="emit('selectView', 'settings')"
      >
        <span class="scenario-avatar server"><ServerCog :size="23" /></span>
        <span class="scenario-copy">
          <span class="scenario-title">Milky 模拟服务</span>
          <span class="scenario-preview">{{ snapshot.running ? '正在监听' : '点击配置并启动' }}</span>
        </span>
        <span class="scenario-meta"><time>{{ snapshot.running ? '在线' : '离线' }}</time><i :class="{ online: snapshot.running }" /></span>
      </button>

      <div class="scenario-divider" />

      <button
        v-if="matches('群聊测试')"
        type="button"
        class="scenario-item"
        :class="{ selected: activeView === 'workbench' && selectedScene === 'group' }"
        @click="emit('selectScene', 'group')"
      >
        <span class="scenario-avatar group"><UsersRound :size="23" /></span>
        <span class="scenario-copy"><span class="scenario-title">群聊测试</span><span class="scenario-preview">message_receive · group</span></span>
        <span class="scenario-meta"><time>{{ formatTime(snapshot.activity[0]?.time) }}</time><b>{{ snapshot.emittedEvents }}</b></span>
      </button>

      <button
        v-if="matches('好友测试')"
        type="button"
        class="scenario-item"
        :class="{ selected: activeView === 'workbench' && selectedScene === 'friend' }"
        @click="emit('selectScene', 'friend')"
      >
        <span class="scenario-avatar friend"><UserRound :size="23" /></span>
        <span class="scenario-copy"><span class="scenario-title">好友测试</span><span class="scenario-preview">message_receive · friend</span></span>
        <span class="scenario-meta"><time>--:--</time></span>
      </button>

      <button
        v-if="matches('临时会话')"
        type="button"
        class="scenario-item"
        :class="{ selected: activeView === 'workbench' && selectedScene === 'temp' }"
        @click="emit('selectScene', 'temp')"
      >
        <span class="scenario-avatar temp"><Clock3 :size="23" /></span>
        <span class="scenario-copy"><span class="scenario-title">临时会话</span><span class="scenario-preview">message_receive · temp</span></span>
        <span class="scenario-meta"><time>--:--</time></span>
      </button>

      <button
        v-if="matches('API 调用记录')"
        type="button"
        class="scenario-item"
        :class="{ selected: activeView === 'api' }"
        @click="emit('selectView', 'api')"
      >
        <span class="scenario-avatar api"><Braces :size="23" /></span>
        <span class="scenario-copy"><span class="scenario-title">API 调用记录</span><span class="scenario-preview">插件发出的 Milky 请求</span></span>
        <span class="scenario-meta"><time>{{ formatTime(snapshot.apiCalls[0]?.time) }}</time><b>{{ snapshot.apiCalls.length }}</b></span>
      </button>

      <button
        v-if="matches('活动日志')"
        type="button"
        class="scenario-item"
        :class="{ selected: activeView === 'activity' }"
        @click="emit('selectView', 'activity')"
      >
        <span class="scenario-avatar activity"><TerminalSquare :size="23" /></span>
        <span class="scenario-copy"><span class="scenario-title">活动日志</span><span class="scenario-preview">连接、事件与运行状态</span></span>
        <span class="scenario-meta"><time>{{ formatTime(snapshot.activity[0]?.time) }}</time></span>
      </button>
    </div>
  </aside>
</template>
