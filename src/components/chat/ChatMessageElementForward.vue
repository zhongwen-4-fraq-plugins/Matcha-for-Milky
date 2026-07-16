<script setup lang="ts">
import { ChevronDown, MessagesSquare } from 'lucide-vue-next'

import type { ForwardContent } from '~/adapter/content'

const { data } = $defineProps<{
  data: ForwardContent['data']
}>()
</script>

<template>
  <details data-type="forward" class="group min-w-72 overflow-hidden border border-border/70 rounded-md bg-background/70">
    <summary class="flex cursor-pointer select-none list-none items-center gap-2 px-3 py-2.5">
      <MessagesSquare class="size-4 flex-none text-blue-500" />
      <span class="min-w-0 flex-1">
        <span class="block truncate text-foreground font-medium">{{ data.title || '合并转发' }}</span>
        <span class="block truncate text-xs text-muted-foreground">{{ data.summary || data.prompt || `${data.content.length} 条消息` }}</span>
      </span>
      <ChevronDown class="size-4 flex-none text-muted-foreground transition-transform group-open:rotate-180" />
    </summary>
    <div class="max-h-80 overflow-y-auto border-t border-border/70">
      <section
        v-for="(node, index) in data.content"
        :key="`${node.data.user_id}-${index}`"
        class="px-3 py-2.5 not-last:border-b not-last:border-border/60"
      >
        <div class="mb-1 text-xs text-muted-foreground font-medium">
          {{ node.data.user_name }}
        </div>
        <div class="break-words text-sm text-foreground">
          <ChatMessageElement
            v-for="(message, messageIndex) in node.data.message"
            :key="messageIndex"
            :type="message.type"
            :data="message.data"
          />
        </div>
      </section>
    </div>
  </details>
</template>
