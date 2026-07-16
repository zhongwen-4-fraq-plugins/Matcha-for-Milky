<!-- eslint-disable camelcase -->
<script setup lang="ts">
import type {
  NoticeScenes,
  OfflineFileNoticeScene,
  GroupMemberTitleNoticeScene,
  GroupMemberHonorNoticeScene,
  GroupFileUploadNoticeScene,
  GroupMemberBanNoticeScene,
  GroupMemberIncreaseNoticeScene,
  GroupMemberDecreaseNoticeScene,
  GroupPokeNoticeScene,
  GroupAdminNoticeScene,
  GroupMemberCardNoticeScene,
  GroupEssenceNoticeScene,
  GroupHongbaoLuckyNoticeScene,
  GroupWholeBanNoticeScene,
  BotOfflineNoticeScene,
  PeerPinChangeNoticeScene,
  GroupMessageReactionNoticeScene,
} from '~/adapter/scene'
import type { Notice } from '~/stores/chat'

const { notice } = $defineProps<{
  notice: Notice
}>()

const state = useStateStore()

let noticeDisplay = $ref('')

interface Context {
  sender: string
  target: string
  group?: string
}

const noticeStrategy = {
  bot_offline: (scene: BotOfflineNoticeScene) => `机器人已离线：${scene.reason}`,
  peer_pin_change: (scene: PeerPinChangeNoticeScene) => scene.is_pinned ? '已置顶会话' : '已取消置顶会话',
  friend_increase: () => '{sender}已经和{target}成为好友，现在可以开始聊天了',
  friend_decrease: () => '{sender}和{target}不再是好友了，友谊的小船说翻就翻',
  private_message_delete: () => '{sender}撤回了一条消息',
  friend_poke: (_, context: Context) => {
    return `{sender}👉戳了戳${context.sender === context.target ? '自己' : '{target}'}`
  },
  offline_file: (scene: OfflineFileNoticeScene) => {
    return `{sender}向{target}发送了文件${scene.file.name}`
  },
  group_member_increase: (scene: GroupMemberIncreaseNoticeScene, context: Context) => {
    context.target = scene.user_id
    return '{target}加入了本群'
  },
  group_member_decrease: (scene: GroupMemberDecreaseNoticeScene, context: Context) => {
    context.target = scene.user_id
    return '{target}退出了本群'
  },
  group_message_delete: () => '{sender}撤回了一条消息',
  group_poke: (scene: GroupPokeNoticeScene, context: Context) => {
    context.target = scene.target_id
    return `{sender}👉戳了戳${context.sender === context.target ? '自己' : '{target}'}`
  },
  group_admin: (scene: GroupAdminNoticeScene, context: Context) => {
    context.target = scene.user_id
    return '{target}成为了管理员'
  },
  group_member_ban: (scene: GroupMemberBanNoticeScene, context: Context) => {
    context.target = scene.user_id
    const duration = scene.duration ?? 0
    const time = Math.ceil(duration / 60)
    return time > 0 ? `{target} 被{sender}禁言${time}分钟` : '{target} 被{sender}解除禁言'
  },
  group_whole_ban: (scene: GroupWholeBanNoticeScene) => {
    return `{sender}${scene.sub_type === 'open' ? '开启' : '关闭'}了全员禁言`
  },
  group_anonymous: () => '管理员已允许群内匿名聊天',
  group_name: () => '{sender}修改了群名',
  group_member_card: (scene: GroupMemberCardNoticeScene, context: Context) => {
    context.target = scene.user_id
    return '{sender}修改了{target}的群名片'
  },
  group_member_title: (scene: GroupMemberTitleNoticeScene, context: Context) => {
    context.target = scene.user_id
    return `{target}获得了群头衔${scene.title}`
  },
  group_member_honor: (scene: GroupMemberHonorNoticeScene, context: Context) => {
    context.target = scene.user_id
    return `{target}获得了群荣誉${scene.honor}`
  },
  group_essence: (scene: GroupEssenceNoticeScene, context: Context) => {
    context.target = scene.user_id
    return `{target}的消息被${scene.sub_type === 'add' ? '设为' : '移出'}了精华消息`
  },
  group_message_reaction: (scene: GroupMessageReactionNoticeScene, context: Context) => {
    context.target = scene.user_id
    return `{target}${scene.is_add ? '添加' : '取消'}了消息回应 ${scene.face_id}`
  },
  group_hongbao_lucky: (scene: GroupHongbaoLuckyNoticeScene, context: Context) => {
    context.target = scene.user_id
    return '{target}运气王'
  },
  group_file_upload: (scene: GroupFileUploadNoticeScene) => {
    return `{sender}上传了群文件${scene.file.name}`
  },
} as Record<string, ((scene: NoticeScenes, context: Context) => string) | undefined>

async function getNoticeDisplay(scene: NoticeScenes): Promise<string> {
  const { group_id: group } = scene as NoticeScenes & { group_id?: string }
  const context = {
    sender: scene.sender_id,
    target: scene.receiver_id,
    group,
  }

  const strategy = noticeStrategy[scene.detail_type]

  if (!strategy) {
    return ''
  }

  const template = strategy(scene, context)

  const matches = [...template.matchAll(/\{(\w+)\}/g)]
  const replacements = await Promise.all(
    matches.map(async (match) => {
      const [, key] = match
      if (key === 'sender' || key === 'target') {
        const userId = context[key]
        const name = userId === state.user?.id ? '你' : await getUserNickname(userId, context.group)
        return name
      }
    }),
  )

  return strategy(scene, context).replaceAll(/\{(\w+)\}/g, () => replacements.shift() || '')
}

watch(
  () => state.user,
  async () => {
    noticeDisplay = await getNoticeDisplay(notice.scene)
    notice.preview = noticeDisplay
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="noticeDisplay" class="flex justify-center">
    <span class="rounded-full bg-gray-100 px-3 py-1 text-xs text-muted-foreground/80 dark:bg-gray-800" dark="">
      {{ noticeDisplay }}
    </span>
  </div>
</template>
