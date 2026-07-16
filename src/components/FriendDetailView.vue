<script setup lang="ts">
import { MessageCircleMore, UserRound } from '@lucide/vue';
import type { TestFriend } from '../types';

defineProps<{
  friend: TestFriend | undefined;
}>();

defineEmits<{
  test: [userId: number];
}>();
</script>

<template>
  <section v-if="friend" class="friend-detail">
    <div class="friend-identity">
      <span><UserRound :size="34" /></span>
      <div><h2>{{ friend.remark || friend.nickname }}</h2><p>{{ friend.nickname }} · {{ friend.qid || '未设置 QID' }}</p></div>
      <button type="button" @click="$emit('test', friend.userId)"><MessageCircleMore :size="18" />开始消息测试</button>
    </div>
    <dl class="friend-details">
      <div><dt>QQ</dt><dd>{{ friend.userId }}</dd></div>
      <div><dt>昵称</dt><dd>{{ friend.nickname }}</dd></div>
      <div><dt>好友分组</dt><dd>{{ friend.category }}</dd></div>
      <div><dt>状态</dt><dd class="friend-status" :class="friend.status">{{ friend.status === 'online' ? '在线' : friend.status === 'away' ? '离开' : '离线' }}</dd></div>
      <div><dt>最后活动</dt><dd>{{ friend.lastActive }}</dd></div>
    </dl>
  </section>
  <section v-else class="empty-state"><UserRound :size="30" /><span>暂无好友</span></section>
</template>
