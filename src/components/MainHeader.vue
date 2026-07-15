<script setup lang="ts">
import { CircleStop, Play, RotateCw, Settings2 } from '@lucide/vue';

defineProps<{
  title: string;
  subtitle: string;
  running: boolean;
  busy: boolean;
}>();

defineEmits<{
  start: [];
  stop: [];
  refresh: [];
  settings: [];
}>();
</script>

<template>
  <header class="main-header">
    <div class="main-heading">
      <h1>{{ title }}</h1>
      <span>{{ subtitle }}</span>
    </div>
    <div class="main-actions">
      <button type="button" title="刷新状态" :disabled="busy" @click="$emit('refresh')">
        <RotateCw :size="18" :class="{ spinning: busy }" />
      </button>
      <button type="button" title="服务配置" @click="$emit('settings')"><Settings2 :size="18" /></button>
      <button v-if="running" class="service-action stop" type="button" :disabled="busy" @click="$emit('stop')">
        <CircleStop :size="17" />停止
      </button>
      <button v-else class="service-action start" type="button" :disabled="busy" @click="$emit('start')">
        <Play :size="17" />启动
      </button>
    </div>
  </header>
</template>
