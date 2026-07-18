/* eslint-disable camelcase */
import { toMilkyId } from '../id'
import { createEvent } from './typed'

import type { MilkyEvent } from './typed'
import type { EventStrategy } from '~/adapter/event'
import type {
  AddFriendRequestScene,
  FriendPokeNoticeScene,
  OfflineFileNoticeScene,
  PrivateMessageDeleteNoticeScene,
  SceneMapping,
} from '~/adapter/scene'

export const friendEventStrategy: EventStrategy<SceneMapping> = {
  'notice.private_message_delete': (scene: PrivateMessageDeleteNoticeScene): MilkyEvent => {
    const peerId = scene.user_id === scene.self_id ? scene.receiver_id : scene.user_id
    return createEvent(scene, 'message_recall', {
      message_scene: 'friend',
      peer_id: toMilkyId(peerId),
      message_seq: Number(scene.message_id),
      sender_id: toMilkyId(scene.user_id),
      operator_id: toMilkyId(scene.sender_id),
      display_suffix: '',
    })
  },
  'notice.friend_poke': (scene: FriendPokeNoticeScene): MilkyEvent => {
    const friendId = scene.user_id === scene.self_id
      ? (scene.target_id === scene.self_id ? scene.receiver_id : scene.target_id)
      : scene.user_id
    return createEvent(scene, 'friend_nudge', {
      user_id: toMilkyId(friendId),
      is_self_send: scene.user_id === scene.self_id,
      is_self_receive: scene.target_id === scene.self_id,
      display_action: '戳了戳',
      display_suffix: '',
      display_action_img_url: '',
    })
  },
  'notice.offline_file': (scene: OfflineFileNoticeScene): MilkyEvent => createEvent(scene, 'friend_file_upload', {
    user_id: toMilkyId(scene.user_id),
    file_id: scene.file.id,
    file_name: scene.file.name,
    file_size: scene.file.size,
    file_hash: scene.file.hash ?? '',
    is_self: scene.sender_id === scene.self_id,
  }),
  'request.add_friend': (scene: AddFriendRequestScene): MilkyEvent => createEvent(scene, 'friend_request', {
    initiator_id: toMilkyId(scene.user_id),
    initiator_uid: scene.user_id,
    comment: scene.comment,
    via: 'mfm',
  }),
}
