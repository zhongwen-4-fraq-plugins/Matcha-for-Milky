/* eslint-disable camelcase */
import { createFileCache, getFile, GetType } from '~/utils/file'

import { getFriend, getGroup } from '../entities'
import { getForwardedMessages } from '../resources'
import { failure, response } from '../typed'

import type { ActionStrategy } from '~/adapter/action'

export const systemActions: ActionStrategy = {
  get_peer_pins: async () => {
    const state = useStateStore()
    const pins = await Promise.all(state.pinnedOrder.map(async (id) => {
      if (await db.groups.get(id)) {
        return { type: 'group', value: await getGroup(id) } as const
      }
      if (state.bot && await db.friends.get([state.bot.id, id])) {
        return { type: 'friend', value: await getFriend(state.bot.id, id) } as const
      }
    }))
    return response({
      friends: pins.filter(pin => pin?.type === 'friend').map(pin => pin.value),
      groups: pins.filter(pin => pin?.type === 'group').map(pin => pin.value),
    })
  },
  set_peer_pin: ({ peer_id, is_pinned = true }: { peer_id: number, is_pinned?: boolean }) => {
    const state = useStateStore()
    const peerId = peer_id.toString()
    state.pinnedOrder = is_pinned
      ? [...new Set([...state.pinnedOrder, peerId])]
      : state.pinnedOrder.filter(id => id !== peerId)
    return response()
  },
  set_avatar: async ({ uri }: { uri: string }) => {
    const state = useStateStore()
    const avatar = await createFileCache(uri, 'image', 'avatar')
    await db.users.update(state.bot!.id, { avatar: avatar.url })
    state.bot!.avatar = avatar.url
    if (state.chatTarget?.id === state.bot!.id) {
      state.chatTarget.avatar = avatar.url
    }
    return response()
  },
  set_nickname: async ({ new_nickname }: { new_nickname: string }) => {
    const state = useStateStore()
    await db.users.update(state.bot!.id, { name: new_nickname })
    state.bot!.name = new_nickname
    if (state.chatTarget?.id === state.bot!.id) {
      state.chatTarget.name = new_nickname
    }
    return response()
  },
  set_bio: async ({ new_bio }: { new_bio: string }) => {
    const state = useStateStore()
    await db.users.update(state.bot!.id, { sign: new_bio })
    return response()
  },
  get_custom_face_url_list: () => response({ urls: [] }),
  get_cookies: () => response({ cookies: '' }),
  get_csrf_token: () => response({ csrf_token: '' }),
  get_resource_temp_url: async ({ resource_id }: { resource_id: string }) => {
    try {
      return response({ url: await getFile(GetType.URL, resource_id) })
    } catch {
      return failure(-404, `资源 ${resource_id} 不存在`)
    }
  },
  get_forwarded_messages: ({ forward_id }: { forward_id: string }) => {
    const messages = getForwardedMessages(forward_id)
    return messages ? response({ messages }) : failure(-404, `合并转发 ${forward_id} 不存在`)
  },
}
