<script setup lang="ts">
import { Bot, Braces, ChevronRight, LoaderCircle, Play, Plus, Search, Trash2 } from 'lucide-vue-next'

import { milkyApis } from '~/adapter/milky/apis'

import type { ActionResponse } from '~/adapter/action'

interface ApiParameter {
  id: number
  name: string
  value: string
}

const adapter = useAdapterStore()

const search = $ref('')
let selectedName = $ref(milkyApis[0].name as string)
let parameters = $ref<ApiParameter[]>([])
let result = $ref('')
let failed = $ref(false)
let calling = $ref(false)
let nextParameterId = 1

const filteredApis = $computed(() => {
  const keyword = search.trim().toLowerCase()
  if (!keyword) {
    return milkyApis
  }
  return milkyApis.filter(api => `${api.name} ${api.label} ${api.group}`.toLowerCase().includes(keyword))
})

const selectedApi = $computed(() => milkyApis.find(api => api.name === selectedName) ?? milkyApis[0])

function selectApi(name: string) {
  selectedName = name
  parameters = []
  result = ''
  failed = false
}

function addParameter() {
  parameters.push({ id: nextParameterId++, name: '', value: '' })
}

function removeParameter(id: number) {
  parameters = parameters.filter(parameter => parameter.id !== id)
}

function getParameterValue(value: string): unknown {
  if (!value.trim()) {
    return ''
  }
  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}

async function callApi() {
  calling = true
  try {
    const params: Record<string, unknown> = {}
    for (const parameter of parameters) {
      const name = parameter.name.trim()
      if (!name) {
        continue
      }
      if (Object.hasOwn(params, name)) {
        throw new TypeError(`参数 ${name} 重复`)
      }
      params[name] = getParameterValue(parameter.value)
    }
    const response: ActionResponse = await adapter.bot.actionHandle({
      action: selectedApi.name,
      params,
    })
    failed = response.status === 'failed'
    result = JSON.stringify(response, undefined, 2)
  } catch (error) {
    failed = true
    result = error instanceof Error ? error.message : String(error)
  } finally {
    calling = false
  }
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="secondary" class="h-9 w-full flex justify-start gap-2 px-4 text-muted-foreground">
        <span class="size-7 flex items-center justify-center rounded-md bg-violet-100">
          <Bot class="size-5 stroke-1.5 text-violet-500" />
        </span>
        <span class="text-xs">快捷调用</span>
        <ChevronRight class="ml-auto size-5 stroke-1.5" />
      </Button>
    </DialogTrigger>

    <DialogContent class="grid-rows-[auto_minmax(0,1fr)] h-[min(42rem,85vh)] max-w-[min(54rem,92vw)] gap-0 p-0">
      <DialogHeader class="border-b px-5 py-4">
        <DialogTitle>快捷调用</DialogTitle>
        <DialogDescription class="sr-only">
          选择并调用 Milky API
        </DialogDescription>
      </DialogHeader>

      <div class="grid grid-cols-[minmax(12rem,0.85fr)_minmax(0,1.15fr)] min-h-0">
        <section class="min-h-0 flex flex-col border-r">
          <label class="relative border-b p-3">
            <Search class="absolute left-5 top-1/2 size-4 text-muted-foreground -translate-y-1/2" />
            <Input v-model="search" class="h-8 pl-8" placeholder="搜索 API" />
          </label>
          <div class="min-h-0 flex-1 overflow-auto">
            <button
              v-for="api in filteredApis"
              :key="api.name"
              type="button"
              class="w-full border-b px-4 py-2.5 text-left transition-colors hover:bg-muted/60"
              :class="{ 'bg-muted': selectedName === api.name }"
              @click="selectApi(api.name)"
            >
              <span class="block text-xs text-foreground font-medium">{{ api.label }}</span>
              <span class="block truncate text-[11px] text-muted-foreground">{{ api.name }} · {{ api.group }}</span>
            </button>
          </div>
        </section>

        <form class="min-h-0 flex flex-col" @submit.prevent="callApi">
          <header class="flex items-center gap-3 border-b px-4 py-3">
            <Braces class="size-5 text-violet-500" />
            <div class="min-w-0">
              <div class="truncate text-sm font-medium">
                {{ selectedApi.label }}
              </div>
              <div class="truncate text-xs text-muted-foreground">
                {{ selectedApi.name }}
              </div>
            </div>
          </header>

          <div class="min-h-0 flex flex-1 flex-col gap-3 p-4">
            <div class="min-h-36 flex flex-1 flex-col overflow-hidden border rounded-md">
              <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] border-b bg-muted/30 text-xs text-muted-foreground">
                <span class="border-r px-3 py-2">参数名</span>
                <span class="px-3 py-2">参数值</span>
                <span class="sr-only">操作</span>
              </div>
              <div class="min-h-0 flex-1 overflow-auto">
                <div
                  v-for="parameter in parameters"
                  :key="parameter.id"
                  class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] border-b"
                >
                  <input
                    v-model="parameter.name"
                    class="h-9 min-w-0 border-r bg-transparent px-3 text-xs outline-none focus:bg-muted/20"
                    placeholder="参数名"
                  >
                  <input
                    v-model="parameter.value"
                    class="h-9 min-w-0 bg-transparent px-3 text-xs outline-none focus:bg-muted/20"
                    placeholder="参数值"
                  >
                  <button
                    type="button"
                    class="h-9 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-destructive"
                    aria-label="删除参数"
                    @click="removeParameter(parameter.id)"
                  >
                    <Trash2 class="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  class="h-9 w-full flex items-center gap-2 px-3 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  @click="addParameter"
                >
                  <Plus class="size-4" />
                  添加参数
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs font-medium">响应结果</span>
              <Button type="submit" size="sm" class="h-8 gap-2" :disabled="calling">
                <LoaderCircle v-if="calling" class="size-4 animate-spin" />
                <Play v-else class="size-4" />
                调用
              </Button>
            </div>
            <pre
              class="max-h-44 min-h-28 overflow-auto whitespace-pre-wrap break-words border rounded-md bg-muted/30 p-3 text-xs"
              :class="failed ? 'text-destructive' : 'text-foreground/85'"
            >{{ result }}</pre>
          </div>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
