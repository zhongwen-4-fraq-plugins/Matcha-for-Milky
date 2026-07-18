interface FormattableLogEntry {
  level: string
  message: string
  time: number
}

export function formatLogTime(time: number) {
  return new Date(time).toLocaleTimeString('zh-CN', { hour12: false })
}

export function formatLogEntry(entry: FormattableLogEntry) {
  return `${formatLogTime(entry.time)} | ${entry.level.toUpperCase()} | ${entry.message}`
}

export function trimLogEntries<T>(entries: T[], limit: number) {
  if (entries.length > limit) {
    entries.splice(0, entries.length - limit)
  }
}
