<script setup lang="ts">
import { Menu, MessageCircleMore, Puzzle, TerminalSquare } from '@lucide/vue';

defineProps<{
  activeView: 'workbench' | 'plugins' | 'api' | 'activity' | 'settings' | 'about';
}>();

defineEmits<{
  select: [view: 'workbench' | 'plugins' | 'api' | 'activity' | 'settings' | 'about'];
}>();
</script>

<template>
  <aside class="app-rail">
    <div class="rail-logo">F</div>
    <nav aria-label="主导航">
      <button type="button" title="消息测试" :class="{ active: activeView === 'workbench' }" @click="$emit('select', 'workbench')">
        <MessageCircleMore :size="23" />
      </button>
      <button type="button" title="插件管理" :class="{ active: activeView === 'plugins' }" @click="$emit('select', 'plugins')">
        <Puzzle :size="22" />
      </button>
      <button type="button" title="活动日志" :class="{ active: activeView === 'activity' }" @click="$emit('select', 'activity')">
        <TerminalSquare :size="22" />
      </button>
    </nav>
    <button class="rail-menu" type="button" title="关于" :class="{ active: activeView === 'about' }" @click="$emit('select', 'about')">
      <Menu :size="21" />
    </button>
  </aside>
</template>
