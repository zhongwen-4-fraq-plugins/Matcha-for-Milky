<script setup lang="ts">
import { Send, UserRound } from '@lucide/vue';
import type { MessageEventDraft } from '../types';

defineProps<{
  disabled: boolean;
}>();

const emit = defineEmits<{
  send: [draft: MessageEventDraft];
}>();

const model = defineModel<MessageEventDraft>({ required: true });

function submit() {
  if (model.value.text.trim()) {
    emit('send', { ...model.value, text: model.value.text.trim() });
  }
}
</script>

<template>
  <section class="event-composer">
    <div class="composer-fields">
      <label class="field">
        <span>{{ model.scene === 'group' ? '群号' : '会话 QQ' }}</span>
        <input v-model.number="model.peerId" type="number" min="1" />
      </label>
      <label class="field">
        <span><UserRound :size="15" />发送者 QQ</span>
        <input v-model.number="model.senderId" type="number" min="1" />
      </label>
    </div>
    <div class="composer-input">
      <textarea v-model="model.text" rows="3" placeholder="输入测试消息" @keydown.ctrl.enter.prevent="submit" />
      <button type="button" :disabled="disabled || !model.text.trim()" @click="submit">
        <Send :size="17" />发送
      </button>
    </div>
    <span class="composer-event">message_receive · {{ model.scene }}</span>
  </section>
</template>
