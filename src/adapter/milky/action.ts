/* eslint-disable camelcase */
import { getVersion } from '@tauri-apps/api/app'

import { AdapterActionHandler } from '~/adapter/action'
import { Behav } from '~/adapter/behav'

import { fileActions } from './actions/file'
import { friendActions } from './actions/friend'
import { groupActions } from './actions/group'
import { notificationActions } from './actions/notification'
import { systemActions } from './actions/system'
import { getFriend, getGroup, getGroupMember, getUserProfile } from './entities'
import { EventHandler } from './event'
import { MessageHandler } from './message'
import { failure, response } from './typed'

import type { Messages } from './message'
import type { ActionRequest, ActionResponse, ActionStrategy } from '~/adapter/action'
import type { Message as ChatMessage } from '~/stores/chat'

export class ActionHandler extends AdapterActionHandler {
  readonly strategy: ActionStrategy = actionStrategy

  async handle({ action, params }: ActionRequest): Promise<ActionResponse> {
    const handler = this.strategy[action]
    if (!handler) {
      return failure(-404, `不支持 Milky API: ${action}`)
    }
    try {
      return await asyncWrapper<ActionResponse>(handler)(params)
    } catch (error) {
      void logger.error(`[Milky] ${action} 处理失败: ${String(error)}`)
      return failure(-500, String(error))
    }
  }
}

export const actionStrategy: ActionStrategy = {
  ...systemActions,
  ...friendActions,
  ...groupActions,
  ...notificationActions,
  ...fileActions,
  get_login_info: () => {
    const bot = useStateStore().bot!
    return response({ uin: Number(bot.id), nickname: bot.name })
  },
  get_impl_info: async () => response({
    impl_name: 'meow',
    impl_version: await getVersion(),
    qq_protocol_version: 'mock',
    qq_protocol_type: 'windows',
    milky_version: '1.2',
  }),
  get_user_profile: async ({ user_id }: { user_id: number }) => response(await getUserProfile(user_id.toString())),
  get_friend_info: async ({ user_id }: { user_id: number }) => {
    const bot = useStateStore().bot!
    return response({ friend: await getFriend(bot.id, user_id.toString()) })
  },
  get_friend_list: async () => {
    const bot = useStateStore().bot!
    const friends = await db.friends.where({ userId: bot.id }).toArray()
    return response({
      friends: await Promise.all(friends.map(friend => getFriend(bot.id, friend.friendId))),
    })
  },
  get_group_info: async ({ group_id }: { group_id: number }) => response({
    group: await getGroup(group_id.toString()),
  }),
  get_group_list: async () => {
    const bot = useStateStore().bot!
    const members = await db.members.where({ userId: bot.id }).toArray()
    return response({
      groups: await Promise.all(members.map(member => getGroup(member.groupId))),
    })
  },
  get_group_member_info: async ({ group_id, user_id }: { group_id: number, user_id: number }) => response({
    member: await getGroupMember(group_id.toString(), user_id.toString()),
  }),
  get_group_member_list: async ({ group_id }: { group_id: number }) => {
    const members = await db.members.where({ groupId: group_id.toString() }).toArray()
    return response({
      members: await Promise.all(members.map(member => getGroupMember(member.groupId, member.userId))),
    })
  },
  send_private_message: async ({ user_id, message }: { user_id: number, message: Messages[] }) => {
    const behav = new Behav()
    const receiver = await getContact('user', user_id.toString())
    const scene = await behav.sendPrivateMessage(behav.state.bot!, receiver, await new MessageHandler().parse(message))
    return response({ message_seq: Number(scene.message_id), time: scene.time })
  },
  send_group_message: async ({ group_id, message }: { group_id: number, message: Messages[] }) => {
    const behav = new Behav()
    const receiver = await getContact('group', group_id.toString())
    const scene = await behav.sendGroupMessage(behav.state.bot!, receiver, await new MessageHandler().parse(message))
    return response({ message_seq: Number(scene.message_id), time: scene.time })
  },
  recall_private_message: async ({ message_seq }: { message_seq: number }) => {
    const behav = new Behav()
    await behav.recallMessage(message_seq.toString(), behav.state.bot!.id)
    return response()
  },
  recall_group_message: async ({ message_seq }: { message_seq: number }) => {
    const behav = new Behav()
    await behav.recallMessage(message_seq.toString(), behav.state.bot!.id)
    return response()
  },
  get_message: async ({ message_seq }: { message_seq: number }) => {
    const message = useChatStore().getMessage(message_seq.toString())
    if (!message) {
      return failure(-404, `消息 ${message_seq} 不存在`)
    }
    const event = await new EventHandler().handle(message.scene)
    return response({ message: event!.data })
  },
  get_history_messages: async ({
    message_scene,
    peer_id,
    start_message_seq,
    limit = 20,
  }: {
    message_scene: 'friend' | 'group' | 'temp'
    peer_id: number
    start_message_seq?: number
    limit?: number
  }) => {
    const messages = useChatStore().chatLogs
      .filter((chat): chat is ChatMessage => chat.type === 'message')
      .filter((chat) => {
        const scene = chat.scene
        const isPeer = scene.detail_type === 'group'
          ? message_scene === 'group' && scene.group_id === peer_id.toString()
          : message_scene !== 'group' && (scene.sender_id === peer_id.toString() || scene.receiver_id === peer_id.toString())
        return isPeer && (!start_message_seq || Number(scene.message_id) <= start_message_seq)
      })
      .slice(-Math.min(limit, 30))
      .reverse()
    const events = await Promise.all(messages.map(message => new EventHandler().handle(message.scene)))
    return response({
      messages: events.map(event => event!.data),
      next_message_seq: messages.at(-1) ? Number(messages.at(-1)!.scene.message_id) : 0,
    })
  },
  mark_message_as_read: () => response(),
  send_friend_nudge: async ({ user_id, is_self }: { user_id: number, is_self: boolean }) => {
    const behav = new Behav()
    const userId = user_id.toString()
    await behav.pokeUser(behav.state.bot!.id, is_self ? behav.state.bot!.id : userId, undefined, userId)
    return response()
  },
  send_group_nudge: async ({ group_id, user_id }: { group_id: number, user_id: number }) => {
    const behav = new Behav()
    await behav.pokeUser(behav.state.bot!.id, user_id.toString(), group_id.toString())
    return response()
  },
  delete_friend: async ({ user_id }: { user_id: number }) => {
    const behav = new Behav()
    await behav.removeFriend(behav.state.bot!.id, user_id.toString())
    return response()
  },
  set_group_name: async ({ group_id, new_group_name }: { group_id: number, new_group_name: string }) => {
    const behav = new Behav()
    await behav.editGroupName(group_id.toString(), behav.state.bot!.id, new_group_name)
    return response()
  },
  set_group_member_card: async ({ group_id, user_id, card }: { group_id: number, user_id: number, card: string }) => {
    const behav = new Behav()
    await behav.editGroupMemberCard(group_id.toString(), user_id.toString(), behav.state.bot!.id, card)
    return response()
  },
  set_group_member_special_title: async ({
    group_id,
    user_id,
    special_title,
  }: {
    group_id: number
    user_id: number
    special_title: string
  }) => {
    const behav = new Behav()
    await behav.editGroupMemberspecialTitle(
      group_id.toString(),
      user_id.toString(),
      behav.state.bot!.id,
      special_title,
      0,
    )
    return response()
  },
  set_group_member_admin: async ({ group_id, user_id, is_set }: { group_id: number, user_id: number, is_set: boolean }) => {
    const behav = new Behav()
    await behav.setGroupAdmin(group_id.toString(), user_id.toString(), behav.state.bot!.id, is_set)
    return response()
  },
  set_group_member_mute: async ({ group_id, user_id, duration }: { group_id: number, user_id: number, duration: number }) => {
    const behav = new Behav()
    await behav.banGroupMember(group_id.toString(), user_id.toString(), behav.state.bot!.id, duration)
    return response()
  },
  set_group_whole_mute: async ({ group_id, is_mute }: { group_id: number, is_mute: boolean }) => {
    const behav = new Behav()
    await behav.banGroupWhole(group_id.toString(), behav.state.bot!.id, is_mute)
    return response()
  },
  kick_group_member: async ({ group_id, user_id }: { group_id: number, user_id: number }) => {
    const behav = new Behav()
    await behav.removeGroupMember(group_id.toString(), user_id.toString(), behav.state.bot!.id)
    return response()
  },
  quit_group: async ({ group_id }: { group_id: number }) => {
    const behav = new Behav()
    await behav.removeGroupMember(group_id.toString(), behav.state.bot!.id, behav.state.bot!.id)
    return response()
  },
  send_profile_like: () => response(),
}
