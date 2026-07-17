<script setup lang="ts">
import { Braces, Maximize2, Plus, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import type { ParameterEntry } from '~/types/parameter'

const parameters = defineModel<ParameterEntry[]>({ required: true })
let editorOpen = $ref(false)
let editingIndex = $ref(-1)

const editingParameter = $computed(() => parameters.value[editingIndex])

function addParameter() {
  parameters.value.push({ name: '', value: '' })
}

function removeParameter(index: number) {
  parameters.value.splice(index, 1)
}

function openEditor(index: number) {
  editingIndex = index
  editorOpen = true
}

function formatValue() {
  if (!editingParameter) {
    return
  }
  try {
    editingParameter.value = JSON.stringify(JSON.parse(editingParameter.value), undefined, 2)
  } catch {
    toast.error('', { description: '参数值不是有效的 JSON' })
  }
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
        <div class="grid grid-cols-[minmax(0,1fr)_2.25rem] min-w-0">
          <input
            v-model="parameter.value"
            class="h-9 min-w-0 bg-transparent px-3 text-xs outline-none focus:bg-muted/20"
            placeholder="参数值"
          >
          <button
            type="button"
            class="h-9 flex items-center justify-center border-l text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="放大编辑参数值"
            title="放大编辑"
            @click="openEditor(index)"
          >
            <Maximize2 class="size-4" />
          </button>
        </div>
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

  <Dialog v-model:open="editorOpen">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>编辑参数值</DialogTitle>
        <DialogDescription class="sr-only">
          使用多行编辑器修改参数值
        </DialogDescription>
      </DialogHeader>
      <textarea
        v-if="editingParameter"
        v-model="editingParameter.value"
        class="min-h-72 w-full resize-y border rounded-md bg-background p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
        spellcheck="false"
      />
      <div class="flex items-center justify-between">
        <Button type="button" size="sm" variant="outline" class="gap-2" @click="formatValue">
          <Braces class="size-4" />
          格式化
        </Button>
        <DialogClose as-child>
          <Button type="button" size="sm">
            完成
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
</template>
