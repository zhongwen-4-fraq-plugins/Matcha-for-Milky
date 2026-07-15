<script setup lang="ts">
import { ref } from 'vue';
import { Braces, ListRestart, TerminalSquare } from '@lucide/vue';
import type { ActivityEntry, ApiCallRecord } from '../types';

defineProps<{
  apiCalls: ApiCallRecord[];
  activity: ActivityEntry[];
}>();

defineEmits<{
  clear: [];
}>();

const tab = ref<'api' | 'activity'>('api');

function formatTime(time: number) {
  return new Date(time * 1000).toLocaleTimeString('zh-CN', { hour12: false });
}
</script>

<template>
  <section class="panel activity-panel">
    <div class="activity-toolbar">
      <div class="tabs">
        <button type="button" :class="{ active: tab === 'api' }" @click="tab = 'api'">
          <Braces :size="16" />API 调用 <span>{{ apiCalls.length }}</span>
        </button>
        <button type="button" :class="{ active: tab === 'activity' }" @click="tab = 'activity'">
          <TerminalSquare :size="16" />活动日志 <span>{{ activity.length }}</span>
        </button>
      </div>
      <button class="icon-button" type="button" title="清空记录" @click="$emit('clear')">
        <ListRestart :size="17" />
      </button>
    </div>
    <div v-if="tab === 'api'" class="record-list">
      <article v-for="call in apiCalls" :key="call.id" class="api-record">
        <div class="record-main">
          <span class="method">POST</span>
          <strong>/api/{{ call.endpoint }}</strong>
          <time>{{ formatTime(call.time) }}</time>
        </div>
        <pre>{{ JSON.stringify(call.params, null, 2) }}</pre>
      </article>
      <div v-if="apiCalls.length === 0" class="empty-state">
        <Braces :size="22" />
        <span>暂无 API 调用</span>
      </div>
    </div>
    <div v-else class="record-list log-list">
      <div v-for="entry in activity" :key="entry.id" class="log-entry">
        <time>{{ formatTime(entry.time) }}</time>
        <span class="log-level" :class="entry.level">{{ entry.level }}</span>
        <p>{{ entry.message }}</p>
      </div>
      <div v-if="activity.length === 0" class="empty-state">
        <TerminalSquare :size="22" />
        <span>暂无活动日志</span>
      </div>
    </div>
  </section>
</template>
