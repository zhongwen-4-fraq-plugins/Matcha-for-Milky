/* eslint-disable camelcase */
import { AdapterEventHandler } from '~/adapter/event'

import { getFriend, getGroup, getGroupMember } from './entities'
import { MessageHandler } from './message'

import type { Messages } from './message'
import type { Event as BaseEvent, EventStrategy } from '~/adapter/event'
import type {
  AddFriendRequestScene,
  FriendPokeNoticeScene,
  GroupAdminNoticeScene,
  GroupInviteRequestScene,
  GroupMemberBanNoticeScene,
  GroupMemberDecreaseNoticeScene,
  GroupMemberIncreaseNoticeScene,
  GroupMessageDeleteNoticeScene,
  GroupMessageScene,
  GroupNameNoticeScene,
  GroupPokeNoticeScene,
  GroupWholeBanNoticeScene,
  JoinGroupRequestScene,
  PrivateMessageDeleteNoticeScene,
  PrivateMessageScene,
  SceneMapping,
} from '~/adapter/scene'

interface Event extends BaseEvent {
  event_type: string
  time: number
  self_id: number
  data: Record<string, unknown>
}

const eventStrategy: EventStrategy<SceneMapping<Messages>> = {
  'message.private': async (scene: PrivateMessageScene<Messages>): Promise<Event> => {
    const data: Record<string, unknown> = {
      message_scene: scene.sub_type === 'friend' ? 'friend' : 'temp',
      peer_id: Number(scene.user_id),
      message_seq: Number(scene.message_id),
      sender_id: Number(scene.user_id),
      time: scene.time,
      segments: await new MessageHandler().build(scene.message),
    }
    if (scene.sub_type === 'friend') {
      data.friend = await getFriend(scene.self_id, scene.user_id)
    }
    return {
      event_type: 'message_receive',
      time: scene.time,
      self_id: Number(scene.self_id),
      data,
    }
  },
  'message.group': async (scene: GroupMessageScene<Messages>): Promise<Event> => ({
    event_type: 'message_receive',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      message_scene: 'group',
      peer_id: Number(scene.group_id),
      message_seq: Number(scene.message_id),
      sender_id: Number(scene.user_id),
      time: scene.time,
      segments: await new MessageHandler().build(scene.message),
      group: await getGroup(scene.group_id),
      group_member: await getGroupMember(scene.group_id, scene.user_id),
    },
  }),
  'notice.private_message_delete': (scene: PrivateMessageDeleteNoticeScene): Event => ({
    event_type: 'message_recall',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      message_scene: 'friend',
      peer_id: Number(scene.user_id),
      message_seq: Number(scene.message_id),
      sender_id: Number(scene.user_id),
      operator_id: Number(scene.sender_id),
      display_suffix: '',
    },
  }),
  'notice.group_message_delete': (scene: GroupMessageDeleteNoticeScene): Event => ({
    event_type: 'message_recall',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      message_scene: 'group',
      peer_id: Number(scene.group_id),
      message_seq: Number(scene.message_id),
      sender_id: Number(scene.user_id),
      operator_id: Number(scene.operator_id),
      display_suffix: '',
    },
  }),
  'notice.friend_poke': (scene: FriendPokeNoticeScene): Event => ({
    event_type: 'friend_nudge',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      user_id: Number(scene.user_id),
      is_self_send: scene.user_id === scene.self_id,
      is_self_receive: scene.target_id === scene.self_id,
      display_action: '戳了戳',
      display_suffix: '',
      display_action_img_url: '',
    },
  }),
  'notice.group_poke': (scene: GroupPokeNoticeScene): Event => ({
    event_type: 'group_nudge',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      group_id: Number(scene.group_id),
      sender_id: Number(scene.user_id),
      receiver_id: Number(scene.target_id),
      display_action: '戳了戳',
      display_suffix: '',
      display_action_img_url: '',
    },
  }),
  'notice.group_member_increase': (scene: GroupMemberIncreaseNoticeScene): Event => ({
    event_type: 'group_member_increase',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      group_id: Number(scene.group_id),
      user_id: Number(scene.user_id),
      operator_id: scene.sub_type === 'join' ? Number(scene.operator_id) : undefined,
      invitor_id: scene.sub_type === 'invite' ? Number(scene.operator_id) : undefined,
    },
  }),
  'notice.group_member_decrease': (scene: GroupMemberDecreaseNoticeScene): Event => ({
    event_type: 'group_member_decrease',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      group_id: Number(scene.group_id),
      user_id: Number(scene.user_id),
      operator_id: scene.sub_type === 'remove' ? Number(scene.operator_id) : undefined,
    },
  }),
  'notice.group_admin': (scene: GroupAdminNoticeScene): Event => ({
    event_type: 'group_admin_change',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      group_id: Number(scene.group_id),
      user_id: Number(scene.user_id),
      operator_id: Number(scene.operator_id),
      is_set: scene.sub_type === 'set',
    },
  }),
  'notice.group_member_ban': (scene: GroupMemberBanNoticeScene): Event => ({
    event_type: 'group_mute',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      group_id: Number(scene.group_id),
      user_id: Number(scene.user_id),
      operator_id: Number(scene.operator_id),
      duration: scene.duration ?? 0,
    },
  }),
  'notice.group_whole_ban': (scene: GroupWholeBanNoticeScene): Event => ({
    event_type: 'group_whole_mute',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      group_id: Number(scene.group_id),
      operator_id: Number(scene.operator_id),
      is_mute: scene.sub_type === 'open',
    },
  }),
  'notice.group_name': (scene: GroupNameNoticeScene): Event => ({
    event_type: 'group_name_change',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      group_id: Number(scene.group_id),
      new_group_name: scene.name,
      operator_id: Number(scene.operator_id),
    },
  }),
  'request.add_friend': (scene: AddFriendRequestScene): Event => ({
    event_type: 'friend_request',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      initiator_id: Number(scene.user_id),
      initiator_uid: scene.user_id,
      comment: scene.comment,
      via: 'matcha',
    },
  }),
  'request.join_group': (scene: JoinGroupRequestScene): Event => ({
    event_type: 'group_join_request',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      group_id: Number(scene.group_id),
      notification_seq: scene.time,
      is_filtered: false,
      initiator_id: Number(scene.user_id),
      comment: scene.comment,
    },
  }),
  'request.group_invite': (scene: GroupInviteRequestScene): Event => ({
    event_type: 'group_invitation',
    time: scene.time,
    self_id: Number(scene.self_id),
    data: {
      group_id: Number(scene.group_id),
      invitation_seq: scene.time,
      initiator_id: Number(scene.invitor_id),
    },
  }),
}

export class EventHandler extends AdapterEventHandler<Event> {
  readonly strategy = eventStrategy
}
