<route lang="yaml">
meta:
  isSettings: true
  title: 快捷键
  description: 配置应用内快捷操作
  position: 1
</route>

<script setup lang="ts">
import { toast } from 'vue-sonner'

import { useShortcutSettingsStore } from '~/stores/shortcut-settings'

const shortcuts = useShortcutSettingsStore()

function updateShortcut(
  action: 'focusMessageInput' | 'previousUser' | 'nextUser',
  shortcut: string,
): void {
  const configured = [shortcuts.focusMessageInput, shortcuts.previousUser, shortcuts.nextUser]
  const current = shortcuts[action]
  if (configured.some(value => value === shortcut && value !== current)) {
    toast.error('该快捷键已被其他操作使用')
    return
  }
  shortcuts[action] = shortcut
}
</script>

<template>
  <div>
    <div class="max-w-140 flex items-center justify-between border-b pb-5">
      <div class="space-y-0.5">
        <p class="text-sm font-medium">
          启用快捷键
        </p>
        <p class="text-sm text-muted-foreground">
          控制所有应用内快捷操作
        </p>
      </div>
      <Switch v-model:checked="shortcuts.enabled" />
    </div>

    <div class="max-w-140 pt-5 space-y-5" :class="{ 'opacity-60': !shortcuts.enabled }">
      <div class="flex items-center justify-between gap-6">
        <div class="space-y-0.5">
          <p class="text-sm font-medium">
            聚焦消息输入框
          </p>
          <p class="text-sm text-muted-foreground">
            跳转到当前会话的消息输入框
          </p>
        </div>
        <div class="flex items-center gap-3">
          <ShortcutInput
            v-model="shortcuts.focusMessageInput"
            :disabled="!shortcuts.enabled || !shortcuts.focusMessageInputEnabled"
            @change="updateShortcut('focusMessageInput', $event)"
          />
          <Switch v-model:checked="shortcuts.focusMessageInputEnabled" :disabled="!shortcuts.enabled" />
        </div>
      </div>

      <div class="flex items-center justify-between gap-6">
        <div class="space-y-0.5">
          <p class="text-sm font-medium">
            上一个用户
          </p>
          <p class="text-sm text-muted-foreground">
            切换到上一个可用用户角色
          </p>
        </div>
        <div class="flex items-center gap-3">
          <ShortcutInput
            v-model="shortcuts.previousUser"
            :disabled="!shortcuts.enabled || !shortcuts.previousUserEnabled"
            @change="updateShortcut('previousUser', $event)"
          />
          <Switch v-model:checked="shortcuts.previousUserEnabled" :disabled="!shortcuts.enabled" />
        </div>
      </div>

      <div class="flex items-center justify-between gap-6">
        <div class="space-y-0.5">
          <p class="text-sm font-medium">
            下一个用户
          </p>
          <p class="text-sm text-muted-foreground">
            切换到下一个可用用户角色
          </p>
        </div>
        <div class="flex items-center gap-3">
          <ShortcutInput
            v-model="shortcuts.nextUser"
            :disabled="!shortcuts.enabled || !shortcuts.nextUserEnabled"
            @change="updateShortcut('nextUser', $event)"
          />
          <Switch v-model:checked="shortcuts.nextUserEnabled" :disabled="!shortcuts.enabled" />
        </div>
      </div>
    </div>
  </div>
</template>
