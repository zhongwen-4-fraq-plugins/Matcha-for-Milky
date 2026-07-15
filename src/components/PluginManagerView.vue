<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Puzzle, Trash2 } from '@lucide/vue';

const pluginPath = ref('');
const plugins = ref<Array<{ id: number; name: string; path: string; enabled: boolean }>>([]);

function addPlugin() {
  const path = pluginPath.value.trim();
  if (!path) return;
  const parts = path.replaceAll('\\', '/').split('/').filter(Boolean);
  plugins.value.push({
    id: Date.now(),
    name: parts.at(-1) || 'Fraq Plugin',
    path,
    enabled: true,
  });
  pluginPath.value = '';
}
</script>

<template>
  <section class="plugin-manager">
    <div class="plugin-add-bar">
      <label>
        <Puzzle :size="18" />
        <input v-model="pluginPath" placeholder="插件目录或入口文件" @keydown.enter.prevent="addPlugin" />
      </label>
      <button type="button" :disabled="!pluginPath.trim()" @click="addPlugin"><Plus :size="17" />添加</button>
    </div>

    <div class="plugin-list-header"><span>测试插件</span><b>{{ plugins.length }}</b></div>
    <div v-if="plugins.length === 0" class="empty-state"><Puzzle :size="28" /><span>暂无测试插件</span></div>
    <div v-else class="plugin-list">
      <article v-for="plugin in plugins" :key="plugin.id" class="plugin-row">
        <span class="plugin-icon"><Puzzle :size="21" /></span>
        <div><strong>{{ plugin.name }}</strong><span>{{ plugin.path }}</span></div>
        <label class="plugin-toggle"><input v-model="plugin.enabled" type="checkbox" /><span /></label>
        <button type="button" title="移除插件" @click="plugins = plugins.filter((item) => item.id !== plugin.id)"><Trash2 :size="17" /></button>
      </article>
    </div>
  </section>
</template>
