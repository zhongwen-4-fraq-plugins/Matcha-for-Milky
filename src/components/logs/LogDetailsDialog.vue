<script setup lang="ts">
import { Copy } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { formatLogEntry } from '~/utils/logs'

import type { LogEntry } from '~/stores/logs'

const { entry } = $defineProps<{
  entry: LogEntry
}>()

let open = $(defineModel('open', { default: false }))

async function copyLog() {
  await navigator.clipboard.writeText(formatLogEntry(entry))
  toast.success('', { description: '日志已复制' })
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="grid-rows-[auto_minmax(0,1fr)_auto] max-h-[85dvh] sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>日志详情</DialogTitle>
        <DialogDescription>可以选择并复制完整日志内容</DialogDescription>
      </DialogHeader>
      <textarea
        :value="formatLogEntry(entry)"
        class="min-h-64 w-full select-text resize-y overflow-auto whitespace-pre-wrap break-words border rounded-md bg-muted/30 p-3 text-xs font-mono outline-none focus:ring-2 focus:ring-ring"
        readonly
        spellcheck="false"
      />
      <DialogFooter>
        <Button type="button" class="h-8 gap-2" @click="copyLog">
          <Copy class="size-4" />
          复制日志
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
