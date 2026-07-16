/* eslint-disable camelcase */
import { Behav } from '~/adapter/behav'

import { failure, response } from '../typed'

import type { ActionStrategy } from '~/adapter/action'
import type { AddFriendRequestScene } from '~/adapter/scene'
import type { Request } from '~/stores/chat'

function findFriendRequest(initiatorUid: string): Request | undefined {
  return useChatStore().chatLogs.findLast((chat): chat is Request =>
    chat.type === 'request'
    && chat.scene.detail_type === 'add_friend'
    && chat.scene.user_id === initiatorUid
    && chat.action === 'await')
}

export const friendActions: ActionStrategy = {
  get_friend_requests: ({ limit = 20, is_filtered = false }: { limit?: number, is_filtered?: boolean }) => {
    if (is_filtered) {
      return response({ requests: [] })
    }
    const requests = useChatStore().chatLogs
      .filter((chat): chat is Request => chat.type === 'request' && chat.scene.detail_type === 'add_friend')
      .slice(-limit)
      .reverse()
      .map((request) => {
        const scene = request.scene as AddFriendRequestScene
        return {
          time: scene.time,
          initiator_id: Number(scene.user_id),
          initiator_uid: scene.user_id,
          target_user_id: Number(scene.receiver_id),
          target_user_uid: scene.receiver_id,
          state: request.action === 'await' ? 'pending' : (request.action === 'agree' ? 'accepted' : 'rejected'),
          comment: scene.comment,
          via: 'meow',
          is_filtered: false,
        }
      })
    return response({ requests })
  },
  accept_friend_request: async ({ initiator_uid }: { initiator_uid: string }) => {
    const request = findFriendRequest(initiator_uid)
    if (!request) {
      return failure(-404, `好友请求 ${initiator_uid} 不存在`)
    }
    const bot = useStateStore().bot!
    await new Behav().approveAddFriend(request.id, bot.id, true)
    return response()
  },
  reject_friend_request: async ({ initiator_uid, reason = '' }: { initiator_uid: string, reason?: string }) => {
    const request = findFriendRequest(initiator_uid)
    if (!request) {
      return failure(-404, `好友请求 ${initiator_uid} 不存在`)
    }
    request.reason = reason
    await new Behav().approveAddFriend(request.id, useStateStore().bot!.id, false)
    return response()
  },
}
