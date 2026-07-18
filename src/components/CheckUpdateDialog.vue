<script setup lang="ts">
import { relaunch } from '@tauri-apps/plugin-process'
import { ArrowRight, Download, LoaderCircle, Sparkles } from 'lucide-vue-next'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import VueMarkdown from 'vue-markdown-render'
import { toast } from 'vue-sonner'

import type { DownloadEvent, Update } from '@tauri-apps/plugin-updater'

const { updateInfo } = $defineProps<{
  updateInfo: Update
}>()

let open = $(defineModel('open', { default: false }))
let installing = $ref(false)
let downloadedBytes = $ref(0)
let contentLength = $ref<number>()

const progress = $computed(() => contentLength
  ? Math.min(100, Math.round(downloadedBytes / contentLength * 100))
  : undefined)

function changeOpen(value: boolean) {
  if (!installing) {
    open = value
  }
}

function updateProgress(event: DownloadEvent) {
  if (event.event === 'Started') {
    downloadedBytes = 0
    contentLength = event.data.contentLength
  } else if (event.event === 'Progress') {
    downloadedBytes += event.data.chunkLength
  } else if (contentLength) {
    downloadedBytes = contentLength
  }
}

async function installUpdate() {
  installing = true
  downloadedBytes = 0
  contentLength = undefined
  try {
    await updateInfo.downloadAndInstall(updateProgress)
    await relaunch()
  } catch (error) {
    installing = false
    toast.error('更新失败', { description: '请检查网络后重试' })
    void logger.error(`更新安装失败: ${String(error)}`)
  }
}

onUnmounted(() => void updateInfo.close())
</script>

<template>
  <Dialog :open="open" @update:open="changeOpen">
    <DialogContent class="grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90dvh] overflow-hidden p-0 sm:max-w-[520px]">
      <DialogHeader class="px-6 pt-6">
        <div class="mb-2 flex items-center gap-3">
          <div class="size-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles class="size-5" />
          </div>
          <div>
            <DialogTitle>发现新版本</DialogTitle>
            <DialogDescription class="mt-1">
              更新后重启应用即可使用新功能
            </DialogDescription>
          </div>
        </div>
        <div class="flex items-center justify-center gap-3 border rounded-lg bg-muted/40 px-4 py-3 text-sm">
          <span class="text-muted-foreground">v{{ updateInfo.currentVersion }}</span>
          <ArrowRight class="size-4 text-muted-foreground" />
          <span class="text-primary font-medium">v{{ updateInfo.version }}</span>
        </div>
      </DialogHeader>

      <div class="min-h-0 px-6">
        <p class="mb-2 text-sm font-medium">
          更新内容
        </p>
        <OverlayScrollbarsComponent v-if="updateInfo.body" class="max-h-64 border rounded-lg bg-muted/20 p-4" defer>
          <VueMarkdown class="text-sm prose prose-truegray dark:prose-invert" :source="updateInfo.body" />
        </OverlayScrollbarsComponent>
        <div v-else class="border rounded-lg bg-muted/20 p-4 text-sm text-muted-foreground">
          本次更新包含功能改进和问题修复。
        </div>

        <div v-if="installing" class="mt-4 space-y-2">
          <div class="flex justify-between text-xs text-muted-foreground">
            <span>{{ progress === undefined ? '正在下载安装包…' : '正在下载安装…' }}</span>
            <span v-if="progress !== undefined">{{ progress }}%</span>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-primary transition-[width] duration-300"
              :class="{ 'w-1/3 animate-pulse': progress === undefined }"
              :style="progress === undefined ? undefined : { width: `${progress}%` }"
            />
          </div>
        </div>
      </div>

      <DialogFooter class="border-t bg-muted/20 px-6 py-4 sm:justify-between">
        <Button variant="outline" class="h-9" :disabled="installing" @click="changeOpen(false)">
          稍后提醒
        </Button>
        <Button class="h-9 min-w-32" :disabled="installing" @click="installUpdate">
          <LoaderCircle v-if="installing" class="mr-2 size-4 animate-spin" />
          <Download v-else class="mr-2 size-4" />
          {{ installing ? '正在更新' : '立即更新' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
