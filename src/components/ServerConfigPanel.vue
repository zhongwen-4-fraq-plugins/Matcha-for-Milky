<script setup lang="ts">
import { KeyRound, Network, RadioTower, UserRound } from '@lucide/vue';
import type { ServerConfig } from '../types';

defineProps<{
  disabled: boolean;
}>();

const model = defineModel<ServerConfig>({ required: true });
</script>

<template>
  <section class="panel server-config">
    <div class="panel-heading">
      <div>
        <p class="section-kicker">SERVER</p>
        <h2>模拟服务配置</h2>
      </div>
      <div class="endpoint-preview">
        <RadioTower :size="16" />
        http://{{ model.host }}:{{ model.port }}
      </div>
    </div>
    <div class="config-grid">
      <label class="field">
        <span><Network :size="15" />监听地址</span>
        <input v-model.trim="model.host" :disabled="disabled" autocomplete="off" />
      </label>
      <label class="field">
        <span><RadioTower :size="15" />端口</span>
        <input v-model.number="model.port" :disabled="disabled" type="number" min="1" max="65535" />
      </label>
      <label class="field">
        <span><UserRound :size="15" />机器人 QQ</span>
        <input v-model.number="model.selfId" :disabled="disabled" type="number" min="1" />
      </label>
      <label class="field">
        <span><KeyRound :size="15" />Access Token</span>
        <input v-model="model.accessToken" :disabled="disabled" type="password" placeholder="未设置" />
      </label>
    </div>
  </section>
</template>
