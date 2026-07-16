/* eslint-disable camelcase */
import { createEvent } from './typed'

import type { MilkyEvent } from './typed'
import type { EventStrategy } from '~/adapter/event'
import type {
  GroupAdminNoticeScene,
  GroupEssenceNoticeScene,
  GroupFileUploadNoticeScene,
  GroupInviteRequestScene,
  GroupMemberBanNoticeScene,
  GroupMemberDecreaseNoticeScene,
  GroupMemberIncreaseNoticeScene,
  GroupMessageDeleteNoticeScene,
  GroupMessageReactionNoticeScene,
  GroupNameNoticeScene,
  GroupPokeNoticeScene,
  GroupWholeBanNoticeScene,
  JoinGroupRequestScene,
  SceneMapping,
} from '~/adapter/scene'

export const groupEventStrategy: EventStrategy<SceneMapping> = {
  'notice.group_message_delete': (scene: GroupMessageDeleteNoticeScene): MilkyEvent => createEvent(scene, 'message_recall', {
    message_scene: 'group',
    peer_id: Number(scene.group_id),
    message_seq: Number(scene.message_id),
    sender_id: Number(scene.user_id),
    operator_id: Number(scene.operator_id),
    display_suffix: '',
  }),
  'notice.group_poke': (scene: GroupPokeNoticeScene): MilkyEvent => createEvent(scene, 'group_nudge', {
    group_id: Number(scene.group_id),
    sender_id: Number(scene.user_id),
    receiver_id: Number(scene.target_id),
    display_action: '戳了戳',
    display_suffix: '',
    display_action_img_url: '',
  }),
  'notice.group_member_increase': (scene: GroupMemberIncreaseNoticeScene): MilkyEvent => createEvent(scene, 'group_member_increase', {
    group_id: Number(scene.group_id),
    user_id: Number(scene.user_id),
    operator_id: scene.sub_type === 'join' ? Number(scene.operator_id) : undefined,
    invitor_id: scene.sub_type === 'invite' ? Number(scene.operator_id) : undefined,
  }),
  'notice.group_member_decrease': (scene: GroupMemberDecreaseNoticeScene): MilkyEvent => createEvent(scene, 'group_member_decrease', {
    group_id: Number(scene.group_id),
    user_id: Number(scene.user_id),
    operator_id: scene.sub_type === 'remove' ? Number(scene.operator_id) : undefined,
  }),
  'notice.group_admin': (scene: GroupAdminNoticeScene): MilkyEvent => createEvent(scene, 'group_admin_change', {
    group_id: Number(scene.group_id),
    user_id: Number(scene.user_id),
    operator_id: Number(scene.operator_id),
    is_set: scene.sub_type === 'set',
  }),
  'notice.group_essence': (scene: GroupEssenceNoticeScene): MilkyEvent => createEvent(scene, 'group_essence_message_change', {
    group_id: Number(scene.group_id),
    message_seq: scene.message_id,
    operator_id: Number(scene.sender_id),
    is_set: scene.sub_type === 'add',
  }),
  'notice.group_message_reaction': (scene: GroupMessageReactionNoticeScene): MilkyEvent => createEvent(scene, 'group_message_reaction', {
    group_id: Number(scene.group_id),
    user_id: Number(scene.user_id),
    message_seq: scene.message_id,
    face_id: scene.face_id,
    reaction_type: scene.reaction_type,
    is_add: scene.is_add,
  }),
  'notice.group_member_ban': (scene: GroupMemberBanNoticeScene): MilkyEvent => createEvent(scene, 'group_mute', {
    group_id: Number(scene.group_id),
    user_id: Number(scene.user_id),
    operator_id: Number(scene.operator_id),
    duration: scene.duration ?? 0,
  }),
  'notice.group_whole_ban': (scene: GroupWholeBanNoticeScene): MilkyEvent => createEvent(scene, 'group_whole_mute', {
    group_id: Number(scene.group_id),
    operator_id: Number(scene.operator_id),
    is_mute: scene.sub_type === 'open',
  }),
  'notice.group_name': (scene: GroupNameNoticeScene): MilkyEvent => createEvent(scene, 'group_name_change', {
    group_id: Number(scene.group_id),
    new_group_name: scene.name,
    operator_id: Number(scene.operator_id),
  }),
  'notice.group_file_upload': (scene: GroupFileUploadNoticeScene): MilkyEvent => createEvent(scene, 'group_file_upload', {
    group_id: Number(scene.group_id),
    user_id: Number(scene.user_id),
    file_id: scene.file.id,
    file_name: scene.file.name,
    file_size: scene.file.size,
  }),
  'request.join_group': (scene: JoinGroupRequestScene): MilkyEvent => scene.invitor_id
    ? createEvent(scene, 'group_invited_join_request', {
        group_id: Number(scene.group_id),
        notification_seq: scene.time,
        initiator_id: Number(scene.invitor_id),
        target_user_id: Number(scene.user_id),
      })
    : createEvent(scene, 'group_join_request', {
        group_id: Number(scene.group_id),
        notification_seq: scene.time,
        is_filtered: false,
        initiator_id: Number(scene.user_id),
        comment: scene.comment,
      }),
  'request.group_invite': (scene: GroupInviteRequestScene): MilkyEvent => createEvent(scene, 'group_invitation', {
    group_id: Number(scene.group_id),
    invitation_seq: scene.time,
    initiator_id: Number(scene.invitor_id),
  }),
}
