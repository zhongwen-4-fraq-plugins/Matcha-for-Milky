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
  const objectMatch = /\{[\s\S]*\}/.exec(entry.message)
  if (objectMatch?.index !== undefined) {
    try {
      const json = JSON.parse(objectMatch[0]) as unknown
      const prefix = entry.message.slice(0, objectMatch.index).trimEnd()
      const suffix = entry.message.slice(objectMatch.index + objectMatch[0].length).trimStart()
      const message = [prefix, JSON.stringify(json, undefined, 2), suffix].filter(Boolean).join('\n')
      return `${formatLogTime(entry.time)} | ${entry.level.toUpperCase()} | ${message}`
    } catch {
      return formatLogEntry(entry)
    }
  }

  for (let index = 0; index < entry.message.length; index++) {
    if (entry.message[index] !== '[') {
      continue
    }
    try {
      const json = JSON.parse(entry.message.slice(index)) as unknown
      const prefix = entry.message.slice(0, index).trimEnd()
      return `${formatLogTime(entry.time)} | ${entry.level.toUpperCase()} | ${prefix}\n${JSON.stringify(json, undefined, 2)}`
    } catch {
      // Continue until a complete JSON array suffix is found.
    }
  }
  return formatLogEntry(entry)
}

export function trimLogEntries<T>(entries: T[], limit: number) {
  if (entries.length > limit) {
    entries.splice(0, entries.length - limit)
  }
}
