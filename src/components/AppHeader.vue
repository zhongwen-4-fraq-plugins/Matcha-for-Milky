<script setup lang="ts">
import { CircleStop, Play, RotateCw } from '@lucide/vue';

defineProps<{
  running: boolean;
  busy: boolean;
}>();

defineEmits<{
  start: [];
  stop: [];
  refresh: [];
}>();
</script>

<template>
  <header class="app-header">
    <div>
      <p class="eyebrow">MILKY 1.2 TEST HARNESS</p>
      <h1>插件测试工作台</h1>
    </div>
    <div class="header-actions">
      <button class="icon-button" type="button" title="刷新状态" :disabled="busy" @click="$emit('refresh')">
        <RotateCw :size="17" :class="{ spinning: busy }" />
      </button>
      <button v-if="running" class="button danger" type="button" :disabled="busy" @click="$emit('stop')">
        <CircleStop :size="17" />
        停止服务
      </button>
      <button v-else class="button primary" type="button" :disabled="busy" @click="$emit('start')">
        <Play :size="17" />
        启动服务
      </button>
    </div>
  </header>
</template>
