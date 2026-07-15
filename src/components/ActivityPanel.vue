<script setup lang="ts">
import { Braces, ListRestart, TerminalSquare } from '@lucide/vue';
import type { ActivityEntry, ApiCallRecord } from '../types';

defineProps<{
  apiCalls: ApiCallRecord[];
  activity: ActivityEntry[];
  mode: 'api' | 'activity';
}>();

defineEmits<{
  clear: [];
}>();

function formatTime(time: number) {
  return new Date(time * 1000).toLocaleTimeString('zh-CN', { hour12: false });
}
</script>

<template>
  <section class="activity-panel">
    <div class="activity-toolbar">
      <div class="activity-title">
        <Braces v-if="mode === 'api'" :size="18" />
        <TerminalSquare v-else :size="18" />
        <span>{{ mode === 'api' ? 'API 调用' : '活动日志' }}</span>
        <b>{{ mode === 'api' ? apiCalls.length : activity.length }}</b>
      </div>
      <button class="icon-button" type="button" title="清空记录" @click="$emit('clear')"><ListRestart :size="17" /></button>
    </div>
    <div v-if="mode === 'api'" class="record-list">
      <article v-for="call in apiCalls" :key="call.id" class="api-record">
        <div class="record-main">
          <span class="method">POST</span>
          <strong>/api/{{ call.endpoint }}</strong>
          <time>{{ formatTime(call.time) }}</time>
        </div>
        <pre>{{ JSON.stringify(call.params, null, 2) }}</pre>
      </article>
      <div v-if="apiCalls.length === 0" class="empty-state"><Braces :size="26" /><span>暂无 API 调用</span></div>
    </div>
    <div v-else class="record-list log-list">
      <div v-for="entry in activity" :key="entry.id" class="log-entry">
        <time>{{ formatTime(entry.time) }}</time>
        <span class="log-level" :class="entry.level">{{ entry.level }}</span>
        <p>{{ entry.message }}</p>
      </div>
      <div v-if="activity.length === 0" class="empty-state"><TerminalSquare :size="26" /><span>暂无活动日志</span></div>
    </div>
  </section>
</template>
