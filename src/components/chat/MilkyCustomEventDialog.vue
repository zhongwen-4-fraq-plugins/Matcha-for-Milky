<script setup lang="ts">
/* eslint-disable camelcase */
import { Braces, ChevronRight, LoaderCircle, MessageCircleCode, Search, Send } from 'lucide-vue-next'

import { milkyEventTypes } from '~/adapter/milky/event-types'
import { buildParameterRecord } from '~/utils/parameters'

import type { MilkyEvent } from '~/adapter/milky/events/typed'
import type { ParameterEntry } from '~/types/parameter'

const adapter = useAdapterStore()
const state = useStateStore()

const search = $ref('')
let selectedName = $ref(milkyEventTypes[0].name as string)
let parameters = $ref<ParameterEntry[]>([])
let result = $ref('')
let status = $ref<'idle' | 'success' | 'failed'>('idle')
let sending = $ref(false)

const filteredEvents = $computed(() => {
  const keyword = search.trim().toLowerCase()
  if (!keyword) {
    return milkyEventTypes
  }
  return milkyEventTypes.filter(event => `${event.name} ${event.label} ${event.group}`.toLowerCase().includes(keyword))
})

const selectedEvent = $computed(() => milkyEventTypes.find(event => event.name === selectedName) ?? milkyEventTypes[0])

function selectEvent(name: string) {
  selectedName = name
  parameters = []
  result = ''
  status = 'idle'
}

async function sendEvent() {
  sending = true
  try {
    if (!state.bot) {
      throw new Error('请先选择机器人')
    }
    const event: MilkyEvent = {
      time: getTimestamp(),
      self_id: Number(state.bot.id),
      event_type: selectedEvent.name,
      data: buildParameterRecord(parameters),
    }
    result = JSON.stringify(event, undefined, 2)
    status = await adapter.bot.send(event) ? 'success' : 'failed'
  } catch (error) {
    status = 'failed'
    result = error instanceof Error ? error.message : String(error)
  } finally {
    sending = false
  }
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="secondary" class="h-9 w-full flex justify-start gap-2 text-muted-foreground">
        <span class="size-7 flex items-center justify-center rounded-md bg-blue-100">
          <MessageCircleCode class="size-5 stroke-1.5 text-blue-500" />
        </span>
        <span class="text-xs">自定义事件</span>
        <ChevronRight class="ml-auto size-5 stroke-1.5" />
      </Button>
    </DialogTrigger>

    <DialogContent class="grid-rows-[auto_minmax(0,1fr)] h-[min(42rem,85vh)] max-w-[min(54rem,92vw)] gap-0 p-0">
      <DialogHeader class="border-b px-5 py-4">
        <DialogTitle>自定义事件</DialogTitle>
        <DialogDescription class="sr-only">
          选择并发送 Milky 事件
        </DialogDescription>
      </DialogHeader>

      <div class="grid grid-cols-[minmax(12rem,0.85fr)_minmax(0,1.15fr)] min-h-0">
        <section class="min-h-0 flex flex-col border-r">
          <label class="relative border-b p-3">
            <Search class="absolute left-5 top-1/2 size-4 text-muted-foreground -translate-y-1/2" />
            <Input v-model="search" class="h-8 pl-8" placeholder="搜索事件" />
          </label>
          <div class="min-h-0 flex-1 overflow-auto">
            <button
              v-for="event in filteredEvents"
              :key="event.name"
              type="button"
              class="w-full border-b px-4 py-2.5 text-left transition-colors hover:bg-muted/60"
              :class="{ 'bg-muted': selectedName === event.name }"
              @click="selectEvent(event.name)"
            >
              <span class="block text-xs text-foreground font-medium">{{ event.label }}</span>
              <span class="block truncate text-[11px] text-muted-foreground">{{ event.name }} · {{ event.group }}</span>
            </button>
          </div>
        </section>

        <form class="min-h-0 flex flex-col" @submit.prevent="sendEvent">
          <header class="flex items-center gap-3 border-b px-4 py-3">
            <Braces class="size-5 text-blue-500" />
            <div class="min-w-0">
              <div class="truncate text-sm font-medium">
                {{ selectedEvent.label }}
              </div>
              <div class="truncate text-xs text-muted-foreground">
                {{ selectedEvent.name }}
              </div>
            </div>
          </header>

          <div class="min-h-0 flex flex-1 flex-col gap-3 p-4">
            <ParameterListInput v-model="parameters" class="flex-1" />

            <div class="flex items-center gap-3">
              <span class="mr-auto text-xs font-medium">事件内容</span>
              <span v-if="status === 'success'" class="text-xs text-emerald-600 dark:text-emerald-400">发送成功</span>
              <span v-else-if="status === 'failed'" class="text-xs text-destructive">发送失败</span>
              <Button type="submit" size="sm" class="h-8 gap-2" :disabled="sending">
                <LoaderCircle v-if="sending" class="size-4 animate-spin" />
                <Send v-else class="size-4" />
                发送
              </Button>
            </div>
            <pre
              class="max-h-44 min-h-28 overflow-auto whitespace-pre-wrap break-words border rounded-md bg-muted/30 p-3 text-xs"
              :class="status === 'failed' ? 'text-destructive' : 'text-foreground/85'"
            >{{ result }}</pre>
          </div>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
