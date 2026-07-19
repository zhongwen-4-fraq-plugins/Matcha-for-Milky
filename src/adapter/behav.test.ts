import { describe, expect, it, vi } from 'vitest'

describe('private message scenes', () => {
  it('uses the actual peer relationship for the Milky message scene', async () => {
    const bot = { type: 'user', id: '10000', name: '机器人', avatar: '', isBot: true } as const
    const currentUser = { type: 'user', id: '20000', name: '当前用户', avatar: '' } as const
    const receiver = { type: 'user', id: '30000', name: '消息对端', avatar: '' } as const
    const appendScene = vi.fn(async scene => scene)
    const friendGet = vi.fn(async (key: [string, string]) => key[0] === bot.id && key[1] === receiver.id)

    vi.stubGlobal('useStateStore', () => ({ bot, user: currentUser }))
    vi.stubGlobal('useChatStore', () => ({ appendScene }))
    vi.stubGlobal('db', {
      friends: { get: friendGet },
      members: { where: vi.fn(() => ({ toArray: vi.fn(async () => []) })) },
    })
    vi.stubGlobal('getMessageId', () => 10)
    vi.stubGlobal('getPlainMessage', vi.fn(async () => ''))
    vi.stubGlobal('getTimestamp', () => 17_0000_0000)
    vi.stubGlobal('getUUID', () => 'scene')

    const { Behav } = await import('./behav')
    const scene = await new Behav().sendPrivateMessage(bot, receiver, [])

    expect(friendGet).toHaveBeenCalledWith([bot.id, receiver.id])
    expect(scene.sub_type).toBe('friend')
  })
})
