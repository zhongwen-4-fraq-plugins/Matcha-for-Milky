<script setup lang="ts">
import { reactive } from 'vue';
import { Send, UserRound } from '@lucide/vue';
import type { MessageEventDraft } from '../types';

defineProps<{
  disabled: boolean;
}>();

const emit = defineEmits<{
  send: [draft: MessageEventDraft];
}>();

const draft = reactive<MessageEventDraft>({
  scene: 'group',
  peerId: 123456,
  senderId: 10002,
  text: 'echo Hello Fraq',
});

function submit() {
  if (draft.text.trim()) {
    emit('send', { ...draft, text: draft.text.trim() });
  }
}
</script>

<template>
  <section class="panel event-composer">
    <div class="panel-heading compact">
      <div>
        <p class="section-kicker">EVENT</p>
        <h2>消息事件</h2>
      </div>
      <div class="segmented" aria-label="消息场景">
        <button type="button" :class="{ active: draft.scene === 'friend' }" @click="draft.scene = 'friend'">好友</button>
        <button type="button" :class="{ active: draft.scene === 'group' }" @click="draft.scene = 'group'">群聊</button>
        <button type="button" :class="{ active: draft.scene === 'temp' }" @click="draft.scene = 'temp'">临时</button>
      </div>
    </div>
    <div class="event-fields">
      <label class="field">
        <span>{{ draft.scene === 'group' ? '群号' : '会话 QQ' }}</span>
        <input v-model.number="draft.peerId" type="number" min="1" />
      </label>
      <label class="field">
        <span><UserRound :size="15" />发送者 QQ</span>
        <input v-model.number="draft.senderId" type="number" min="1" />
      </label>
    </div>
    <label class="field message-field">
      <span>文本内容</span>
      <textarea v-model="draft.text" rows="5" @keydown.ctrl.enter.prevent="submit" />
    </label>
    <div class="composer-footer">
      <span>message_receive</span>
      <button class="button primary" type="button" :disabled="disabled || !draft.text.trim()" @click="submit">
        <Send :size="17" />
        注入事件
      </button>
    </div>
  </section>
</template>
