import { describe, expect, it } from 'vitest'

import { formatLogEntry, trimLogEntries } from './logs'

describe('log utilities', () => {
  it('formats an exported log line', () => {
    const time = new Date(2026, 6, 19, 1, 2, 3).getTime()
    expect(formatLogEntry({ level: 'info', message: 'connected', time })).toBe('01:02:03 | INFO | connected')
  })

  it('keeps the newest entries within the configured limit', () => {
    const entries = [1, 2, 3, 4]
    trimLogEntries(entries, 2)
    expect(entries).toEqual([3, 4])
  })
})
