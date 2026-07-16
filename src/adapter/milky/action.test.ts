import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

describe('Milky action adapter', () => {
  it('returns an empty object for APIs without output data', async () => {
    const { response } = await import('./typed')
    expect(response()).toEqual({ status: 'ok', retcode: 0, data: {} })
  })

  it('implements every Milky 1.2.2 API endpoint', async () => {
    setActivePinia(createPinia())
    const { actionStrategy } = await import('./action')

    expect(Object.keys(actionStrategy).sort()).toEqual([
      'accept_friend_request',
      'accept_group_invitation',
      'accept_group_request',
      'create_group_folder',
      'delete_friend',
      'delete_group_announcement',
      'delete_group_file',
      'delete_group_folder',
      'get_cookies',
      'get_csrf_token',
      'get_custom_face_url_list',
      'get_forwarded_messages',
      'get_friend_info',
      'get_friend_list',
      'get_friend_requests',
      'get_group_announcements',
      'get_group_essence_messages',
      'get_group_file_download_url',
      'get_group_files',
      'get_group_info',
      'get_group_list',
      'get_group_member_info',
      'get_group_member_list',
      'get_group_notifications',
      'get_history_messages',
      'get_impl_info',
      'get_login_info',
      'get_message',
      'get_peer_pins',
      'get_private_file_download_url',
      'get_resource_temp_url',
      'get_user_profile',
      'kick_group_member',
      'mark_message_as_read',
      'move_group_file',
      'quit_group',
      'recall_group_message',
      'recall_private_message',
      'reject_friend_request',
      'reject_group_invitation',
      'reject_group_request',
      'rename_group_file',
      'rename_group_folder',
      'send_friend_nudge',
      'send_group_announcement',
      'send_group_message',
      'send_group_message_reaction',
      'send_group_nudge',
      'send_private_message',
      'send_profile_like',
      'set_avatar',
      'set_bio',
      'set_group_avatar',
      'set_group_essence_message',
      'set_group_member_admin',
      'set_group_member_card',
      'set_group_member_mute',
      'set_group_member_special_title',
      'set_group_name',
      'set_group_whole_mute',
      'set_nickname',
      'set_peer_pin',
      'upload_group_file',
      'upload_private_file',
    ].sort())
  })
})
