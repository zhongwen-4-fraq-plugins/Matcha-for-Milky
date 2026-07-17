<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'

import type { ParameterEntry } from '~/types/parameter'

const parameters = defineModel<ParameterEntry[]>({ required: true })

function addParameter() {
  parameters.value.push({ name: '', value: '' })
}

function removeParameter(index: number) {
  parameters.value.splice(index, 1)
}
</script>

<template>
  <div class="min-h-36 flex flex-col overflow-hidden border rounded-md">
    <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] border-b bg-muted/30 text-xs text-muted-foreground">
      <span class="border-r px-3 py-2">参数名</span>
      <span class="px-3 py-2">参数值</span>
      <span class="sr-only">操作</span>
    </div>
    <div class="min-h-0 flex-1 overflow-auto">
      <div
        v-for="(parameter, index) in parameters"
        :key="index"
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
          @click="removeParameter(index)"
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
</template>
