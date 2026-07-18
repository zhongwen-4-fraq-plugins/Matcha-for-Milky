<route lang="yaml">
meta:
  navDisplay: true
  title: 日志
  position: 1
  icon: code.svg
  activeIcon: code-active.svg
</route>

<script setup lang="ts">
import { isTauri } from '@tauri-apps/api/core'
import { save } from '@tauri-apps/plugin-dialog'
import dayjs from 'dayjs'
import { Download, Maximize2, Search, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { useLogsStore } from '~/stores/logs'
import { formatLogEntry, formatLogTime } from '~/utils/logs'

import type { LogEntry } from '~/stores/logs'

const logs = useLogsStore()

const search = $ref('')
const level = $ref<'all' | LogEntry['level']>('all')
const autoScroll = $ref(true)
const scrollArea = $ref<HTMLElement>()
const expandedEntries = $ref(new Set<number>())
let selectedEntry = $ref<LogEntry>()
let detailsOpen = $ref(false)

const filteredEntries = $computed(() => {
  const keyword = search.trim().toLowerCase()
  return logs.entries.filter((entry) => {
    const matchesLevel = level === 'all' || entry.level === level
    const matchesSearch = !keyword || entry.message.toLowerCase().includes(keyword)
    return matchesLevel && matchesSearch
  })
})

watch(
  () => logs.entries.length,
  async () => {
    if (!autoScroll) {
      return
    }
    await nextTick()
    scrollArea?.scrollTo({ top: scrollArea.scrollHeight })
  },
)

function getLevelLabel(logLevel: LogEntry['level']) {
  return logLevel.toUpperCase()
}

function toggleMessage(id: number) {
  if (expandedEntries.has(id)) {
    expandedEntries.delete(id)
    return
  }
  expandedEntries.add(id)
}

function openDetails(entry: LogEntry) {
  selectedEntry = entry
  detailsOpen = true
}

function downloadInBrowser(contents: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

async function exportLogs() {
  const contents = logs.entries.map(entry => formatLogEntry(entry)).join('\n')
  const fileName = `mfm-logs-${dayjs().format('YYYYMMDD-HHmmss')}.log`
  if (isTauri()) {
    const path = await save({
      title: '导出日志',
      defaultPath: fileName,
      filters: [{ name: '日志文件', extensions: ['log'] }],
    })
    if (!path) {
      return
    }
    await Commands.writeFile([...new TextEncoder().encode(contents)], path, true)
  } else {
    downloadInBrowser(contents, fileName)
  }
  toast.success('', { description: `已导出 ${logs.entries.length} 条日志` })
}
</script>

<template>
  <main class="min-w-0 flex flex-col bg-background">
    <header class="min-h-14 flex flex-wrap items-center gap-3 border-b px-5 py-2">
      <div class="mr-auto flex items-baseline gap-2">
        <h1 class="text-base font-semibold">
          日志
        </h1>
        <span class="text-xs text-muted-foreground">
          {{ filteredEntries.length }} / {{ logs.entries.length }}
        </span>
      </div>

      <label class="relative min-w-44 flex-1 sm:max-w-72">
        <Search class="absolute left-2.5 top-1/2 size-4 text-muted-foreground -translate-y-1/2" />
        <Input v-model="search" class="h-8 pl-8" placeholder="搜索日志" />
      </label>

      <Select v-model="level">
        <SelectTrigger class="h-8 w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            全部级别
          </SelectItem>
          <SelectItem value="trace">
            跟踪
          </SelectItem>
          <SelectItem value="debug">
            调试
          </SelectItem>
          <SelectItem value="info">
            信息
          </SelectItem>
          <SelectItem value="warn">
            警告
          </SelectItem>
          <SelectItem value="error">
            错误
          </SelectItem>
        </SelectContent>
      </Select>

      <label class="flex items-center gap-2 text-xs text-muted-foreground">
        自动滚动
        <Switch v-model:checked="autoScroll" />
      </label>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline" size="icon" class="size-8" :disabled="logs.entries.length === 0" @click="exportLogs">
              <Download class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            导出全部日志
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline" size="icon" class="size-8" :disabled="logs.entries.length === 0" @click="logs.clear">
              <Trash2 class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            清空日志
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </header>

    <div ref="scrollArea" class="min-h-0 flex-1 overflow-auto">
      <div v-if="filteredEntries.length === 0" class="h-full flex items-center justify-center text-sm text-muted-foreground">
        暂无日志
      </div>
      <ul v-else class="text-xs font-mono divide-y">
        <ContextMenu v-for="entry in filteredEntries" :key="entry.id">
          <ContextMenuTrigger as-child>
            <li
              class="grid grid-cols-[5.5rem_auto_4rem_auto_minmax(0,1fr)] gap-2 px-5 py-2 hover:bg-muted/40"
            >
              <time class="text-muted-foreground tabular-nums">
                {{ formatLogTime(entry.time) }}
              </time>
              <span class="text-muted-foreground">|</span>
              <span
                class="font-semibold"
                :class="{
                  'text-zinc-500': entry.level === 'trace',
                  'text-sky-600 dark:text-sky-400': entry.level === 'debug',
                  'text-emerald-600 dark:text-emerald-400': entry.level === 'info',
                  'text-amber-600 dark:text-amber-400': entry.level === 'warn',
                  'text-rose-600 dark:text-rose-400': entry.level === 'error',
                }"
              >
                {{ getLevelLabel(entry.level) }}
              </span>
              <span class="text-muted-foreground">|</span>
              <button
                type="button"
                class="min-w-0 w-full whitespace-pre-wrap break-words text-left text-foreground/85"
                :class="{ 'line-clamp-2': !expandedEntries.has(entry.id) }"
                :aria-expanded="expandedEntries.has(entry.id)"
                @click="toggleMessage(entry.id)"
              >
                {{ entry.message }}
              </button>
            </li>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem class="gap-2" @click="openDetails(entry)">
              <Maximize2 class="size-4" />
              查看完整日志
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </ul>
    </div>

    <LogDetailsDialog v-if="selectedEntry" v-model:open="detailsOpen" :entry="selectedEntry" />
  </main>
</template>
