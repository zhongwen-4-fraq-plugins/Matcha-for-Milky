/* eslint-disable camelcase */
import { describe, expect, it } from 'vitest'

import { eventStrategy } from './event'
import { milkyEventTypes } from './event-types'
import { createBotOfflineEvent } from './events/system'

import type { MilkyEvent } from './events/typed'
import type { Scenes } from '~/adapter/scene'

const scene = {
  id: 'scene',
  time: 17_0000_0000,
  self_id: '10000',
  type: 'notice',
  chat_type: 'group',
  sender_id: '10000',
  receiver_id: '20000',
} as const

async function buildEvent(key: string, value: Scenes): Promise<MilkyEvent> {
  const strategies = eventStrategy as Record<string, (scene: Scenes) => MilkyEvent | Promise<MilkyEvent>>
  return await strategies[key](value)
}

describe('Milky event adapter', () => {
  it('lists every Milky 1.2.2 event for custom sending', () => {
    expect(milkyEventTypes.map(event => event.name).sort()).toEqual([
      'bot_offline',
      'friend_file_upload',
      'friend_nudge',
      'friend_request',
      'group_admin_change',
      'group_essence_message_change',
      'group_file_upload',
      'group_invitation',
      'group_invited_join_request',
      'group_join_request',
      'group_member_decrease',
      'group_member_increase',
      'group_message_reaction',
      'group_mute',
      'group_name_change',
      'group_nudge',
      'group_whole_mute',
      'message_recall',
      'message_receive',
      'peer_pin_change',
    ].sort())
  })

  it('implements every scene used by Milky events', () => {
    expect(Object.keys(eventStrategy).sort()).toEqual([
      'message.group',
      'message.private',
      'notice.bot_offline',
      'notice.friend_poke',
      'notice.group_admin',
      'notice.group_essence',
      'notice.group_file_upload',
      'notice.group_member_ban',
      'notice.group_member_decrease',
      'notice.group_member_increase',
      'notice.group_message_delete',
      'notice.group_message_reaction',
      'notice.group_name',
      'notice.group_poke',
      'notice.group_whole_ban',
      'notice.offline_file',
      'notice.peer_pin_change',
      'notice.private_message_delete',
      'request.add_friend',
      'request.group_invite',
      'request.join_group',
    ].sort())
  })

  it('builds every newly supported Milky event', async () => {
    const events = await Promise.all([
      buildEvent('notice.peer_pin_change', {
        ...scene,
        detail_type: 'peer_pin_change',
        message_scene: 'group',
        peer_id: '20000',
        is_pinned: true,
      } as Scenes),
      buildEvent('request.join_group', {
        ...scene,
        type: 'request',
        detail_type: 'join_group',
        group_id: '20000',
        user_id: '30000',
        invitor_id: '40000',
        comment: '',
      } as Scenes),
      buildEvent('notice.offline_file', {
        ...scene,
        chat_type: 'private',
        detail_type: 'offline_file',
        user_id: '30000',
        file: { id: 'file', name: 'test.txt', size: 4 },
      } as Scenes),
      buildEvent('notice.group_essence', {
        ...scene,
        detail_type: 'group_essence',
        sub_type: 'add',
        group_id: '20000',
        message_id: 10,
        user_id: '30000',
      } as Scenes),
      buildEvent('notice.group_message_reaction', {
        ...scene,
        detail_type: 'group_message_reaction',
        group_id: '20000',
        user_id: '10000',
        message_id: 10,
        face_id: '76',
        reaction_type: 'face',
        is_add: true,
      } as Scenes),
      buildEvent('notice.group_file_upload', {
        ...scene,
        detail_type: 'group_file_upload',
        group_id: '20000',
        user_id: '10000',
        file: { id: 'file', name: 'test.txt', size: 4 },
      } as Scenes),
    ])

    expect([createBotOfflineEvent('10000', '测试离线'), ...events].map(event => event?.event_type)).toEqual([
      'bot_offline',
      'peer_pin_change',
      'group_invited_join_request',
      'friend_file_upload',
      'group_essence_message_change',
      'group_message_reaction',
      'group_file_upload',
    ])
  })

  it('keeps the friend peer ID for outgoing private messages', async () => {
    const event = await buildEvent('message.private', {
      ...scene,
      type: 'message',
      chat_type: 'private',
      detail_type: 'private',
      sub_type: 'temp',
      message_id: '10',
      message: [],
      plain_message: '',
      user_id: '10000',
      user_name: '机器人',
      sender_id: '10000',
      receiver_id: '30000',
    } as Scenes)

    expect(event.data.peer_id).toBe(3_0000)
    expect(event.data.sender_id).toBe(1_0000)
  })
})
