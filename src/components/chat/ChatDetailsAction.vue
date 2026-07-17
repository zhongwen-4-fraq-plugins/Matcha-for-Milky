<script setup lang="ts">
import { ChevronRight, Workflow } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col gap-2">
    <MilkyApiQuickCallDialog />
    <MilkyCustomEventDialog />
    <Button variant="secondary" class="h-9 flex justify-start gap-2 text-muted-foreground">
      <span class="size-7 flex items-center justify-center rounded-md bg-orange-100">
        <Workflow class="size-5 stroke-1.5 text-orange-500" />
      </span>
      <span class="text-xs">运行流程</span>
      <ChevronRight class="ml-auto size-5 stroke-1.5" />
    </Button>
  </div>
</template>
