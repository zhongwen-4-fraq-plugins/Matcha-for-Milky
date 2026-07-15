<script setup lang="ts">
import { MessageCircleMore, ShieldCheck, UsersRound } from '@lucide/vue';
import type { TestGroup } from '../types';

defineProps<{
  group: TestGroup | undefined;
}>();

defineEmits<{
  test: [groupId: number];
}>();
</script>

<template>
  <section v-if="group" class="group-detail">
    <div class="group-identity">
      <span><UsersRound :size="34" /></span>
      <div><h2>{{ group.groupName }}</h2><p>{{ group.remark || '未设置群备注' }}</p></div>
      <button type="button" @click="$emit('test', group.groupId)"><MessageCircleMore :size="18" />开始消息测试</button>
    </div>
    <dl class="group-details">
      <div><dt>群号</dt><dd>{{ group.groupId }}</dd></div>
      <div><dt>成员</dt><dd>{{ group.memberCount }} / {{ group.maxMemberCount }}</dd></div>
      <div>
        <dt>机器人权限</dt>
        <dd class="group-role"><ShieldCheck :size="16" />{{ group.role === 'owner' ? '群主' : group.role === 'admin' ? '管理员' : '成员' }}</dd>
      </div>
      <div><dt>最后活动</dt><dd>{{ group.lastActive }}</dd></div>
    </dl>
  </section>
  <section v-else class="empty-state"><UsersRound :size="30" /><span>暂无群聊</span></section>
</template>
