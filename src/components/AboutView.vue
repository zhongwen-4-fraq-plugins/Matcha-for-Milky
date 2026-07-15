<script setup lang="ts">
import { BadgeCheck, FlaskConical } from '@lucide/vue';
</script>

<template>
  <section class="about-view">
    <div class="about-identity">
      <div class="about-logo"><FlaskConical :size="34" /></div>
      <div>
        <div class="about-name"><h2>Fraq Debug</h2><span>v0.1.0</span></div>
        <p>面向 Fraq 插件的 Milky 测试工作台</p>
      </div>
    </div>

    <dl class="about-details">
      <div><dt>桌面框架</dt><dd>Tauri 2</dd></div>
      <div><dt>前端界面</dt><dd>Vue 3 · TypeScript</dd></div>
      <div><dt>后端服务</dt><dd>Rust · Axum</dd></div>
      <div><dt>协议版本</dt><dd>Milky 1.2.2</dd></div>
      <div><dt>目标框架</dt><dd>Fraq 0.13.3</dd></div>
      <div><dt>运行状态</dt><dd class="verified"><BadgeCheck :size="16" />开发预览</dd></div>
    </dl>

    <footer>Fraq Debug · Plugin test harness</footer>
  </section>
</template>
