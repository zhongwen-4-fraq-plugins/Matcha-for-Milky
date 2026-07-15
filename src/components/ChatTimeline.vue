<script setup lang="ts">
import { computed } from 'vue';
import { Bot, MessageCircleMore, UserRound } from '@lucide/vue';
import type { ApiCallRecord, ChatMessage } from '../types';

const props = defineProps<{
  messages: ChatMessage[];
  apiCalls: ApiCallRecord[];
}>();

function apiText(call: ApiCallRecord) {
  if (!call.params || typeof call.params !== 'object' || !('message' in call.params)) {
    return call.endpoint;
  }
  const message = (call.params as { message?: unknown }).message;
  if (!Array.isArray(message)) {
    return call.endpoint;
  }
  const text = message
    .filter((segment): segment is { type: string; data: { text?: string } } => typeof segment === 'object' && segment !== null)
    .map((segment) => (segment.type === 'text' ? segment.data?.text : `[${segment.type}]`))
    .filter(Boolean)
    .join('');
  return text || call.endpoint;
}

const entries = computed(() =>
  [
    ...props.messages.map((message) => ({
      id: `message-${message.id}`,
      side: 'outgoing' as const,
      label: message.scene,
      text: message.text,
      time: message.time,
    })),
    ...props.apiCalls.map((call) => ({
      id: `api-${call.id}`,
      side: 'incoming' as const,
      label: call.endpoint,
      text: apiText(call),
      time: call.time,
    })),
  ].sort((left, right) => left.time - right.time),
);

function formatTime(time: number) {
  return new Date(time * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
</script>

<template>
  <section class="chat-timeline">
    <div v-if="entries.length === 0" class="chat-empty">
      <MessageCircleMore :size="48" />
      <span>等待测试消息</span>
    </div>
    <article v-for="entry in entries" :key="entry.id" class="chat-entry" :class="entry.side">
      <span class="chat-avatar">
        <Bot v-if="entry.side === 'incoming'" :size="20" />
        <UserRound v-else :size="20" />
      </span>
      <div class="chat-content">
        <div class="chat-meta"><span>{{ entry.label }}</span><time>{{ formatTime(entry.time) }}</time></div>
        <p>{{ entry.text }}</p>
      </div>
    </article>
  </section>
</template>
