/* eslint-disable camelcase */
import { getFriend, getGroup, getGroupMember } from '../entities'
import { toMilkyId } from '../id'
import { MessageHandler } from '../message'
import { createEvent } from './typed'

import type { Messages } from '../message'
import type { MilkyEvent } from './typed'
import type { EventStrategy } from '~/adapter/event'
import type { GroupMessageScene, PrivateMessageScene, SceneMapping } from '~/adapter/scene'

export const messageEventStrategy: EventStrategy<SceneMapping<Messages>> = {
  'message.private': async (scene: PrivateMessageScene<Messages>): Promise<MilkyEvent> => {
    const peerId = scene.user_id === scene.self_id ? scene.receiver_id : scene.user_id
    const data: Record<string, unknown> = {
      message_scene: scene.sub_type === 'friend' ? 'friend' : 'temp',
      peer_id: toMilkyId(peerId),
      message_seq: Number(scene.message_id),
      sender_id: toMilkyId(scene.user_id),
      time: scene.time,
      segments: await new MessageHandler().build(scene.message),
    }
    if (scene.sub_type === 'friend') {
      data.friend = await getFriend(scene.self_id, peerId)
    }
    return createEvent(scene, 'message_receive', data)
  },
  'message.group': async (scene: GroupMessageScene<Messages>): Promise<MilkyEvent> => createEvent(scene, 'message_receive', {
    message_scene: 'group',
    peer_id: toMilkyId(scene.group_id),
    message_seq: Number(scene.message_id),
    sender_id: toMilkyId(scene.user_id),
    time: scene.time,
    segments: await new MessageHandler().build(scene.message),
    group: await getGroup(scene.group_id),
    group_member: await getGroupMember(scene.group_id, scene.user_id),
  }),
}
