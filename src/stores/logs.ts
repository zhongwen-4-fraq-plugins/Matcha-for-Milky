import { isTauri } from '@tauri-apps/api/core'
import { attachLogger, LogLevel } from '@tauri-apps/plugin-log'
import { defineStore } from 'pinia'

import { trimLogEntries } from '~/utils/logs'

import type { UnlistenFn } from '@tauri-apps/api/event'

export interface LogEntry {
  id: number
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error'
  message: string
  time: number
}

function getLevel(level: LogLevel): LogEntry['level'] {
  switch (level) {
    case LogLevel.Trace: {
      return 'trace'
    }
    case LogLevel.Debug: {
      return 'debug'
    }
    case LogLevel.Warn: {
      return 'warn'
    }
    case LogLevel.Error: {
      return 'error'
    }
    default: {
      return 'info'
    }
  }
}

export const useLogsStore = defineStore('logs', () => {
  const general = useGeneralSettingsStore()
  const entries = $ref<LogEntry[]>([])
  let nextId = 1
  let unlisten: UnlistenFn | undefined

  function append(level: LogEntry['level'], message: string) {
    entries.push({
      id: nextId++,
      level,
      message,
      time: Date.now(),
    })
    trimLogEntries(entries, general.logLimit)
  }

  async function start() {
    if (!isTauri() || unlisten) {
      return
    }
    unlisten = await attachLogger(({ level, message }) => {
      append(getLevel(level), message)
    })
  }

  function stop() {
    unlisten?.()
    unlisten = undefined
  }

  function clear() {
    entries.splice(0)
  }

  watch(
    () => general.logLimit,
    limit => trimLogEntries(entries, limit),
  )

  return $$({
    entries,
    append,
    start,
    stop,
    clear,
  })
})
