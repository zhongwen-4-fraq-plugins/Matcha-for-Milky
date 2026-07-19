/* eslint-disable camelcase */
import { createPinia, setActivePinia } from 'pinia'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('@tauri-apps/api/path', () => ({
  appCacheDir: async () => '/cache',
  join: async (...parts: string[]) => parts.join('/'),
}))

import type { Messages } from './message'
import type { FileContent } from '~/adapter/content'

describe('Milky message parser', () => {
  beforeAll(() => {
    vi.stubGlobal('asyncWrapper', (handler: (context: unknown) => unknown) => async (context: unknown) => await handler(context))
    vi.stubGlobal('nonNullable', (value: unknown) => value !== undefined && value !== null)
  })

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

  it('adds a TriSHA1 hash only when building private file segments', async () => {
    vi.stubGlobal('db', {
      files: {
        get: vi.fn(async () => ({ id: 'file', name: 'test.bin', size: 3, sha256: 'cache' })),
      },
    })
    vi.stubGlobal('Commands', {
      readFile: vi.fn(async () => [1, 2, 3]),
    })
    const { MessageHandler } = await import('./message')
    const contents: FileContent[] = [{ type: 'file', data: { id: 'file', url: '' } }]

    const privateSegments = await new MessageHandler(true).build(contents)
    const groupSegments = await new MessageHandler().build(contents)

    expect(privateSegments).toEqual([{
      type: 'file',
      data: {
        file_id: 'file',
        file_name: 'test.bin',
        file_size: 3,
        file_hash: 'E73CFC78A5B002CDC20290EFCB5D0C6C6159A93F',
      },
    }])
    expect(groupSegments[0].data).not.toHaveProperty('file_hash')
  })
})
