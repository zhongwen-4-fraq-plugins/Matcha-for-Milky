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

function formatBracketedText(value: string) {
  let formatted = ''
  let indentation = 0
  let quoted = false
  let escaped = false

  for (let index = 0; index < value.length; index++) {
    const character = value[index]

    if (quoted) {
      formatted += character
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === '"') {
        quoted = false
      }
      continue
    }

    switch (character) {
      case '"': {
        quoted = true
        formatted += character
        break
      }
      case '{':
      case '[': {
        formatted += character
        indentation++
        const closingCharacter = character === '{' ? '}' : ']'
        if (value.slice(index + 1).trimStart()[0] !== closingCharacter) {
          formatted += `\n${'  '.repeat(indentation)}`
        }
        break
      }
      case '}':
      case ']': {
        indentation = Math.max(0, indentation - 1)
        formatted = formatted.trimEnd()
        const openingCharacter = character === '}' ? '{' : '['
        if (!formatted.endsWith(openingCharacter)) {
          formatted += `\n${'  '.repeat(indentation)}`
        }
        formatted += character
        break
      }
      case ',': {
        formatted = `${formatted.trimEnd()},\n${'  '.repeat(indentation)}`
        break
      }
      case ':': {
        formatted = `${formatted.trimEnd()}: `
        break
      }
      default: {
        if (/\s/.test(character)) {
          if (formatted && !/\s/.test(formatted.at(-1) ?? '')) {
            formatted += ' '
          }
        } else {
          formatted += character
        }
      }
    }
  }

  return formatted
}

function findJsonArray(message: string) {
  for (let index = 0; index < message.length; index++) {
    if (message[index] !== '[') {
      continue
    }
    try {
      const value = JSON.parse(message.slice(index)) as unknown
      if (Array.isArray(value)) {
        return { index, value }
      }
    } catch {
      // Continue until a complete JSON array suffix is found.
    }
  }
}

export function formatDetailedLogEntry(entry: FormattableLogEntry) {
  const objectMatch = /\{[\s\S]*\}/.exec(entry.message)
  const arrayMatch = findJsonArray(entry.message)
  if (arrayMatch && (objectMatch?.index === undefined || arrayMatch.index < objectMatch.index)) {
    const prefix = entry.message.slice(0, arrayMatch.index).trimEnd()
    const formattedArray = formatBracketedText(JSON.stringify(arrayMatch.value))
    return `${formatLogTime(entry.time)} | ${entry.level.toUpperCase()} | ${prefix}\n${formattedArray}`
  }

  if (objectMatch?.index !== undefined) {
    let formattedObject = objectMatch[0]
    try {
      const json = JSON.parse(objectMatch[0]) as unknown
      formattedObject = JSON.stringify(json, undefined, 2)
    } catch {
      formattedObject = formatBracketedText(objectMatch[0])
    }
    const prefix = entry.message.slice(0, objectMatch.index).trimEnd()
    const suffix = entry.message.slice(objectMatch.index + objectMatch[0].length).trimStart()
    const separator = prefix.endsWith('Object') ? ' ' : '\n'
    const message = `${prefix}${separator}${formattedObject}${suffix ? `\n${suffix}` : ''}`
    return `${formatLogTime(entry.time)} | ${entry.level.toUpperCase()} | ${message}`
  }

  return formatLogEntry(entry)
}

export function trimLogEntries<T>(entries: T[], limit: number) {
  if (entries.length > limit) {
    entries.splice(0, entries.length - limit)
  }
}
