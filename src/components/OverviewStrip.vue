<script setup lang="ts">
import { Activity, Cable, Radio, ScrollText } from '@lucide/vue';
import type { ServerSnapshot } from '../types';

defineProps<{
  snapshot: ServerSnapshot;
}>();
</script>

<template>
  <section class="overview-strip" aria-label="运行概览">
    <div class="metric">
      <Activity :size="18" />
      <div><span>服务状态</span><strong :class="snapshot.running ? 'healthy' : ''">{{ snapshot.running ? '运行中' : '已停止' }}</strong></div>
    </div>
    <div class="metric">
      <Cable :size="18" />
      <div><span>事件连接</span><strong>{{ snapshot.clientCount }}</strong></div>
    </div>
    <div class="metric">
      <Radio :size="18" />
      <div><span>已发事件</span><strong>{{ snapshot.emittedEvents }}</strong></div>
    </div>
    <div class="metric">
      <ScrollText :size="18" />
      <div><span>API 调用</span><strong>{{ snapshot.apiCalls.length }}</strong></div>
    </div>
  </section>
</template>
