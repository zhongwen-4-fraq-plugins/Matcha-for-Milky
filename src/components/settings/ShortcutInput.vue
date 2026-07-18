<script setup lang="ts">
import { Keyboard } from 'lucide-vue-next'

import { getShortcutFromEvent, getShortcutLabel } from '~/utils/shortcut'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [shortcut: string]
}>()

const model = defineModel<string>({ required: true })

let recording = $ref(false)

function startRecording(): void {
  recording = true
}

function stopRecording(): void {
  recording = false
}

function recordShortcut(event: KeyboardEvent): void {
  if (!recording) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  if (event.key === 'Escape') {
    stopRecording()
    return
  }

  const shortcut = getShortcutFromEvent(event)
  if (shortcut) {
    emit('change', shortcut)
    stopRecording()
  }
}
</script>

<template>
  <Button
    type="button"
    variant="outline"
    class="h-9 min-w-36 justify-start gap-2 font-normal"
    :class="{ 'border-primary ring-1 ring-primary': recording }"
    :disabled="disabled"
    aria-label="设置快捷键"
    @click="startRecording"
    @blur="stopRecording"
    @keydown="recordShortcut"
  >
    <Keyboard class="size-4 text-muted-foreground" />
    <span>{{ recording ? '请按下快捷键' : getShortcutLabel(model) }}</span>
  </Button>
</template>
