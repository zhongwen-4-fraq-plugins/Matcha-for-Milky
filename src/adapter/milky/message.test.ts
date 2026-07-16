/* eslint-disable camelcase */
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import type { Messages } from './message'

describe('Milky message parser', () => {
  it('parses forwarded plugin help messages', async () => {
    setActivePinia(createPinia())
    const { MessageHandler } = await import('./message')
    const contents = await new MessageHandler().parse([{
      type: 'forward',
      data: {
        title: '群管帮助',
        summary: '共 1 段群管帮助',
        messages: [{
          user_id: 1_0001,
          sender_name: '基础命令',
          segments: [{ type: 'text', data: { text: 'help - 查看帮助' } }],
        }],
      },
    }] as Messages[])

    expect(contents).toEqual([{
      type: 'forward',
      data: {
        title: '群管帮助',
        summary: '共 1 段群管帮助',
        content: [{
          type: 'node',
          data: {
            user_id: '10001',
            user_name: '基础命令',
            message: [{ type: 'text', data: { text: 'help - 查看帮助' } }],
            time: 0,
          },
        }],
      },
    }])
  })
})
