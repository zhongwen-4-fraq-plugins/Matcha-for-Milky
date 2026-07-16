<script setup lang="ts">
import { isTauri } from '@tauri-apps/api/core'
import { locale as dayjsLocale } from 'dayjs'

import 'dayjs/locale/zh-cn'

dayjsLocale('zh-cn')

const general = useGeneralSettingsStore()

const { theme } = storeToRefs(general)

const themeMode = useColorMode({
  emitAuto: true,
  storageRef: theme,
})

provide('themeMode', themeMode)

onBeforeMount(async () => {
  if (!isTauri()) {
    return
  }
  await logger.attachConsole()

  await setWindowEffect()
  await setAcrylicWindowEffect(general.applyAcrylicWindowEffects)
})
</script>

<template>
  <RouterView />
</template>
