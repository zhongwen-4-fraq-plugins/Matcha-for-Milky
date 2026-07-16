/* eslint-disable camelcase */
import { Behav } from '~/adapter/behav'

import { failure, response } from '../typed'

import type { ActionStrategy } from '~/adapter/action'
import type { GroupInviteRequestScene, JoinGroupRequestScene } from '~/adapter/scene'
import type { Notice, Request } from '~/stores/chat'

function findGroupRequest(groupId: string, notificationSeq: number, notificationType: string): Request | undefined {
  return useChatStore().chatLogs.findLast((chat): chat is Request => {
    if (chat.type !== 'request' || chat.scene.detail_type !== 'join_group' || chat.action !== 'await') {
      return false
    }
    const scene = chat.scene as JoinGroupRequestScene
    const type = scene.invitor_id ? 'invited_join_request' : 'join_request'
    return scene.group_id === groupId && scene.time === notificationSeq && type === notificationType
  })
}

function findGroupInvitation(groupId: string, invitationSeq: number): Request | undefined {
  const botId = useStateStore().bot!.id
  return useChatStore().chatLogs.findLast((chat): chat is Request =>
    chat.type === 'request'
    && chat.scene.detail_type === 'group_invite'
    && chat.scene.group_id === groupId
    && chat.scene.user_id === botId
    && chat.scene.time === invitationSeq
    && chat.action === 'await')
}

export const notificationActions: ActionStrategy = {
  get_group_notifications: ({
    start_notification_seq,
    is_filtered = false,
    limit = 20,
  }: {
    start_notification_seq?: number
    is_filtered?: boolean
    limit?: number
  }) => {
    if (is_filtered) {
      return response({ notifications: [] })
    }
    const notifications: Record<string, unknown>[] = []
    for (const chat of useChatStore().chatLogs) {
      if (chat.type === 'request' && chat.scene.detail_type === 'join_group') {
        const scene = chat.scene as JoinGroupRequestScene
        notifications.push(scene.invitor_id
          ? {
              type: 'invited_join_request',
              group_id: Number(scene.group_id),
              notification_seq: scene.time,
              initiator_id: Number(scene.invitor_id),
              target_user_id: Number(scene.user_id),
              state: chat.action === 'await' ? 'pending' : (chat.action === 'agree' ? 'accepted' : 'rejected'),
            }
          : {
              type: 'join_request',
              group_id: Number(scene.group_id),
              notification_seq: scene.time,
              is_filtered: false,
              initiator_id: Number(scene.user_id),
              state: chat.action === 'await' ? 'pending' : (chat.action === 'agree' ? 'accepted' : 'rejected'),
              comment: scene.comment,
            })
      } else if (chat.type === 'notice') {
        const scene = (chat as Notice).scene
        if (scene.detail_type === 'group_admin') {
          notifications.push({
            type: 'admin_change',
            group_id: Number(scene.group_id),
            notification_seq: scene.time,
            target_user_id: Number(scene.user_id),
            is_set: scene.sub_type === 'set',
            operator_id: Number(scene.operator_id),
          })
        } else if (scene.detail_type === 'group_member_decrease') {
          notifications.push(scene.sub_type === 'remove'
            ? {
                type: 'kick',
                group_id: Number(scene.group_id),
                notification_seq: scene.time,
                target_user_id: Number(scene.user_id),
                operator_id: Number(scene.operator_id),
              }
            : {
                type: 'quit',
                group_id: Number(scene.group_id),
                notification_seq: scene.time,
                target_user_id: Number(scene.user_id),
              })
        }
      }
    }
    const filtered = notifications
      .filter(notification => !start_notification_seq || Number(notification.notification_seq) <= start_notification_seq)
      .sort((left, right) => Number(right.notification_seq) - Number(left.notification_seq))
    const selected = filtered.slice(0, limit)
    return response({
      notifications: selected,
      next_notification_seq: filtered.length > limit ? selected.at(-1)?.notification_seq : undefined,
    })
  },
  accept_group_request: async ({
    notification_seq,
    notification_type,
    group_id,
  }: {
    notification_seq: number
    notification_type: string
    group_id: number
  }) => {
    const request = findGroupRequest(group_id.toString(), notification_seq, notification_type)
    if (!request) {
      return failure(-404, `群请求 ${notification_seq} 不存在`)
    }
    await new Behav().approveJoinGroup(request.id, useStateStore().bot!.id, true)
    return response()
  },
  reject_group_request: async ({
    notification_seq,
    notification_type,
    group_id,
    reason = '',
  }: {
    notification_seq: number
    notification_type: string
    group_id: number
    reason?: string
  }) => {
    const request = findGroupRequest(group_id.toString(), notification_seq, notification_type)
    if (!request) {
      return failure(-404, `群请求 ${notification_seq} 不存在`)
    }
    await new Behav().approveJoinGroup(request.id, useStateStore().bot!.id, false, reason)
    return response()
  },
  accept_group_invitation: async ({ group_id, invitation_seq }: { group_id: number, invitation_seq: number }) => {
    const groupId = group_id.toString()
    const request = findGroupInvitation(groupId, invitation_seq)
    if (!request) {
      return failure(-404, `群邀请 ${invitation_seq} 不存在`)
    }
    const scene = request.scene as GroupInviteRequestScene
    await db.members.put({
      groupId,
      userId: scene.user_id,
      card: '',
      role: 'member',
      level: 0,
      title: '',
      joinTime: getTimestamp(),
      titleExpireTime: 0,
      banExpireTime: 0,
    })
    request.action = 'agree'
    return response()
  },
  reject_group_invitation: ({ group_id, invitation_seq }: { group_id: number, invitation_seq: number }) => {
    const request = findGroupInvitation(group_id.toString(), invitation_seq)
    if (!request) {
      return failure(-404, `群邀请 ${invitation_seq} 不存在`)
    }
    request.action = 'refuse'
    return response()
  },
}
