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

export function formatDetailedLogEntry(entry: FormattableLogEntry) {
  for (let index = 0; index < entry.message.length; index++) {
    if (entry.message[index] !== '{' && entry.message[index] !== '[') {
      continue
    }
    try {
      const json = JSON.parse(entry.message.slice(index)) as unknown
      const message = entry.message.slice(0, index).trimEnd()
      return `${formatLogTime(entry.time)} | ${entry.level.toUpperCase()} | ${message}\n${JSON.stringify(json, undefined, 2)}`
    } catch {
      // Continue until a complete JSON suffix is found.
    }
  }
  return formatLogEntry(entry)
}

export function trimLogEntries<T>(entries: T[], limit: number) {
  if (entries.length > limit) {
    entries.splice(0, entries.length - limit)
  }
}
