<script setup lang="ts">
import { reactive } from 'vue';
import { UserRound, UsersRound, X } from '@lucide/vue';

const props = defineProps<{
  mode: 'group' | 'friend';
}>();

const emit = defineEmits<{
  close: [];
  addGroup: [groupId: number, groupName: string];
  addFriend: [userId: number, nickname: string, remark: string];
}>();

const form = reactive({
  id: 200001,
  name: '',
  remark: '',
});

function submit() {
  if (form.id < 1 || !form.name.trim()) return;
  if (props.mode === 'group') {
    emit('addGroup', form.id, form.name.trim());
  } else {
    emit('addFriend', form.id, form.name.trim(), form.remark.trim());
  }
}
</script>

<template>
  <div class="contact-dialog-backdrop" @click.self="$emit('close')">
    <section class="contact-dialog" role="dialog" aria-modal="true" :aria-label="mode === 'group' ? '添加群聊' : '添加账号'">
      <header>
        <span>
          <UsersRound v-if="mode === 'group'" :size="20" />
          <UserRound v-else :size="20" />
        </span>
        <h2>{{ mode === 'group' ? '添加群聊' : '添加账号' }}</h2>
        <button type="button" title="关闭" @click="$emit('close')"><X :size="18" /></button>
      </header>
      <div class="contact-dialog-fields">
        <label class="field">
          <span>{{ mode === 'group' ? '群号' : 'QQ' }}</span>
          <input v-model.number="form.id" type="number" min="1" />
        </label>
        <label class="field">
          <span>{{ mode === 'group' ? '群名称' : '昵称' }}</span>
          <input v-model.trim="form.name" autofocus />
        </label>
        <label v-if="mode === 'friend'" class="field">
          <span>备注</span>
          <input v-model.trim="form.remark" placeholder="可选" />
        </label>
      </div>
      <footer>
        <button type="button" class="cancel" @click="$emit('close')">取消</button>
        <button type="button" class="confirm" :disabled="form.id < 1 || !form.name.trim()" @click="submit">添加</button>
      </footer>
    </section>
  </div>
</template>
