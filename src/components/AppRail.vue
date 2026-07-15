<script setup lang="ts">
import { Braces, Menu, MessageCircleMore, ServerCog, TerminalSquare } from '@lucide/vue';

defineProps<{
  activeView: 'workbench' | 'api' | 'activity' | 'settings';
}>();

defineEmits<{
  select: [view: 'workbench' | 'api' | 'activity' | 'settings'];
}>();
</script>

<template>
  <aside class="app-rail">
    <div class="rail-logo">F</div>
    <nav aria-label="主导航">
      <button type="button" title="消息测试" :class="{ active: activeView === 'workbench' }" @click="$emit('select', 'workbench')">
        <MessageCircleMore :size="23" />
      </button>
      <button type="button" title="模拟服务" :class="{ active: activeView === 'settings' }" @click="$emit('select', 'settings')">
        <ServerCog :size="22" />
      </button>
      <button type="button" title="API 调用" :class="{ active: activeView === 'api' }" @click="$emit('select', 'api')">
        <Braces :size="22" />
      </button>
      <button type="button" title="活动日志" :class="{ active: activeView === 'activity' }" @click="$emit('select', 'activity')">
        <TerminalSquare :size="22" />
      </button>
    </nav>
    <button class="rail-menu" type="button" title="服务配置" @click="$emit('select', 'settings')"><Menu :size="21" /></button>
  </aside>
</template>
