function normalizeKey(key: string): string {
  if (key === ' ') {
    return 'Space'
  }

  if (key.length === 1) {
    return key.toUpperCase()
  }

  return key
}

export function getShortcutFromEvent(event: KeyboardEvent): string {
  if (['Alt', 'Control', 'Meta', 'Shift', 'Dead'].includes(event.key)) {
    return ''
  }

  const key = normalizeKey(event.key)
  const isFunctionKey = /^F(?:[1-9]|1[0-2])$/.test(key)
  if (!event.ctrlKey && !event.altKey && !event.metaKey && !isFunctionKey) {
    return ''
  }

  const keys = []
  if (event.ctrlKey) {
    keys.push('Ctrl')
  }
  if (event.altKey) {
    keys.push('Alt')
  }
  if (event.shiftKey) {
    keys.push('Shift')
  }
  if (event.metaKey) {
    keys.push('Meta')
  }
  keys.push(key)
  return keys.join('+')
}

export function getShortcutLabel(shortcut: string): string {
  return shortcut
    .split('+')
    .map((key) => {
      switch (key) {
        case 'ArrowUp': {
          return '↑'
        }
        case 'ArrowDown': {
          return '↓'
        }
        case 'ArrowLeft': {
          return '←'
        }
        case 'ArrowRight': {
          return '→'
        }
        default: {
          return key
        }
      }
    })
    .join(' + ')
}
