/* eslint-disable camelcase */
import { Behav } from '~/adapter/behav'
import { createFileCache } from '~/utils/file'

import { MessageHandler } from '../message'
import { failure, response } from '../typed'

import type { ActionStrategy } from '~/adapter/action'

async function canManageGroup(groupId: string): Promise<boolean> {
  return await roleCheck('admin', groupId, useStateStore().bot!.id)
}

export const groupActions: ActionStrategy = {
  set_group_avatar: async ({ group_id, image_uri }: { group_id: number, image_uri: string }) => {
    const groupId = group_id.toString()
    if (!(await canManageGroup(groupId))) {
      return failure(-403, '机器人不是群管理员')
    }
    const avatar = await createFileCache(image_uri, 'image', `group-${groupId}-avatar`)
    await db.groups.update(groupId, { avatar: avatar.url })
    const state = useStateStore()
    if (state.chatTarget?.id === groupId) {
      await state.refreshChatTarget()
    }
    return response()
  },
  get_group_announcements: async ({ group_id }: { group_id: number }) => {
    const announcements = await db.groupAnnouncements.where({ groupId: group_id.toString() }).toArray()
    return response({
      announcements: announcements.sort((left, right) => right.time - left.time).map(announcement => ({
        group_id,
        announcement_id: announcement.announcementId,
        user_id: Number(announcement.userId),
        time: announcement.time,
        content: announcement.content,
        image_url: announcement.imageUrl,
      })),
    })
  },
  send_group_announcement: async ({
    group_id,
    content,
    image_uri,
  }: {
    group_id: number
    content: string
    image_uri?: string
  }) => {
    const groupId = group_id.toString()
    if (!(await canManageGroup(groupId))) {
      return failure(-403, '机器人不是群管理员')
    }
    const image = image_uri ? await createFileCache(image_uri, 'image', 'announcement-image') : undefined
    await db.groupAnnouncements.add({
      groupId,
      announcementId: getUUID(),
      userId: useStateStore().bot!.id,
      time: getTimestamp(),
      content,
      imageUrl: image?.url,
    })
    return response()
  },
  delete_group_announcement: async ({ group_id, announcement_id }: { group_id: number, announcement_id: string }) => {
    const groupId = group_id.toString()
    if (!(await canManageGroup(groupId))) {
      return failure(-403, '机器人不是群管理员')
    }
    if (!(await db.groupAnnouncements.get([groupId, announcement_id]))) {
      return failure(-404, `群公告 ${announcement_id} 不存在`)
    }
    await db.groupAnnouncements.delete([groupId, announcement_id])
    return response()
  },
  get_group_essence_messages: async ({
    group_id,
    page_index,
    page_size,
  }: {
    group_id: number
    page_index: number
    page_size: number
  }) => {
    const groupId = group_id.toString()
    const allEssences = await db.groupEssences.where({ groupId }).toArray()
    allEssences.sort((left, right) => right.operationTime - left.operationTime)
    const selected = allEssences.slice(page_index * page_size, (page_index + 1) * page_size)
    const messages = await Promise.all(selected.map(async (essence) => {
      const chat = useChatStore().getMessage(essence.messageId)
      if (!chat || chat.scene.detail_type !== 'group') {
        return
      }
      const scene = chat.scene
      return {
        group_id,
        message_seq: Number(scene.message_id),
        message_time: scene.time,
        sender_id: Number(scene.user_id),
        sender_name: scene.user_name,
        operator_id: Number(essence.operatorId),
        operator_name: await getUserNickname(essence.operatorId, groupId),
        operation_time: essence.operationTime,
        segments: await new MessageHandler().build(scene.message),
      }
    }))
    return response({
      messages: messages.filter(message => nonNullable(message)),
      is_end: (page_index + 1) * page_size >= allEssences.length,
    })
  },
  set_group_essence_message: async ({
    group_id,
    message_seq,
    is_set = true,
  }: {
    group_id: number
    message_seq: number
    is_set?: boolean
  }) => {
    const groupId = group_id.toString()
    if (!(await canManageGroup(groupId))) {
      return failure(-403, '机器人不是群管理员')
    }
    const messageId = message_seq.toString()
    const chat = useChatStore().getMessage(messageId)
    if (!chat || chat.scene.detail_type !== 'group' || chat.scene.group_id !== groupId) {
      return failure(-404, `群消息 ${message_seq} 不存在`)
    }
    await (is_set
      ? db.groupEssences.put({
          groupId,
          messageId,
          operatorId: useStateStore().bot!.id,
          operationTime: getTimestamp(),
        })
      : db.groupEssences.delete([groupId, messageId]))
    await new Behav().setGroupEssence(groupId, message_seq, chat.scene.user_id, is_set)
    return response()
  },
  send_group_message_reaction: async ({
    group_id,
    message_seq,
    reaction,
    reaction_type,
    is_add,
  }: {
    group_id: number
    message_seq: number
    reaction: string
    reaction_type: 'face' | 'emoji'
    is_add: boolean
  }) => {
    const groupId = group_id.toString()
    const chat = useChatStore().getMessage(message_seq.toString())
    if (!chat || chat.scene.detail_type !== 'group' || chat.scene.group_id !== groupId) {
      return failure(-404, `群消息 ${message_seq} 不存在`)
    }
    await new Behav().reactGroupMessage(groupId, message_seq, reaction, reaction_type, is_add)
    return response()
  },
}
