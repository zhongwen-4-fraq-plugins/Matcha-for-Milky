import { describe, expect, it } from 'vitest'

import { formatDetailedLogEntry, formatLogEntry, trimLogEntries } from './logs'

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

  it('formats a JSON object at the end of a detailed log', () => {
    const time = new Date(2026, 6, 19, 1, 2, 3).getTime()
    expect(formatDetailedLogEntry({
      level: 'debug',
      message: '[API: send_group_message] 请求参数: {"group_id":10000,"message":[{"type":"text","data":{"text":"test"}}]}',
      time,
    })).toBe(`01:02:03 | DEBUG | [API: send_group_message] 请求参数:
{
  "group_id": 10000,
  "message": [
    {
      "type": "text",
      "data": {
        "text": "test"
      }
    }
  ]
}`)
  })

  it('formats a JSON array after a bracketed log prefix', () => {
    const time = new Date(2026, 6, 19, 1, 2, 3).getTime()
    expect(formatDetailedLogEntry({
      level: 'info',
      message: '[Event: test] 内容: [{"id":1}]',
      time,
    })).toContain('[\n  {\n    "id": 1\n  }\n]')
  })

  it('keeps non-JSON details unchanged', () => {
    const time = new Date(2026, 6, 19, 1, 2, 3).getTime()
    expect(formatDetailedLogEntry({ level: 'warn', message: 'connection closed', time }))
      .toBe('01:02:03 | WARN | connection closed')
  })
})
