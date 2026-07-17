export interface MilkyEventType {
  name: string
  label: string
  group: string
}

export const milkyEventTypes = [
  { name: 'bot_offline', label: '机器人离线', group: '系统' },
  { name: 'message_receive', label: '消息接收', group: '消息' },
  { name: 'message_recall', label: '消息撤回', group: '消息' },
  { name: 'peer_pin_change', label: '会话置顶变更', group: '会话' },
  { name: 'friend_request', label: '好友请求', group: '请求' },
  { name: 'group_join_request', label: '入群请求', group: '请求' },
  { name: 'group_invited_join_request', label: '群成员邀请入群请求', group: '请求' },
  { name: 'group_invitation', label: '群邀请', group: '请求' },
  { name: 'friend_nudge', label: '好友戳一戳', group: '好友' },
  { name: 'friend_file_upload', label: '好友文件上传', group: '好友' },
  { name: 'group_admin_change', label: '群管理员变更', group: '群聊' },
  { name: 'group_essence_message_change', label: '群精华消息变更', group: '群聊' },
  { name: 'group_member_increase', label: '群成员增加', group: '群聊' },
  { name: 'group_member_decrease', label: '群成员减少', group: '群聊' },
  { name: 'group_name_change', label: '群名称变更', group: '群聊' },
  { name: 'group_message_reaction', label: '群消息回应', group: '群聊' },
  { name: 'group_mute', label: '群成员禁言', group: '群聊' },
  { name: 'group_whole_mute', label: '群全员禁言', group: '群聊' },
  { name: 'group_nudge', label: '群戳一戳', group: '群聊' },
  { name: 'group_file_upload', label: '群文件上传', group: '群聊' },
] as const satisfies readonly MilkyEventType[]
