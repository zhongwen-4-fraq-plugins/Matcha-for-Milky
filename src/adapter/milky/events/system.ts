/* eslint-disable camelcase */
import { createEvent } from './typed'

import type { MilkyEvent } from './typed'
import type { EventStrategy } from '~/adapter/event'
import type { BotOfflineNoticeScene, PeerPinChangeNoticeScene, SceneMapping } from '~/adapter/scene'

export const systemEventStrategy: EventStrategy<SceneMapping> = {
  'notice.bot_offline': (scene: BotOfflineNoticeScene): MilkyEvent => createEvent(scene, 'bot_offline', {
    reason: scene.reason,
  }),
  'notice.peer_pin_change': (scene: PeerPinChangeNoticeScene): MilkyEvent => createEvent(scene, 'peer_pin_change', {
    message_scene: scene.message_scene,
    peer_id: Number(scene.peer_id),
    is_pinned: scene.is_pinned,
  }),
}

export function createBotOfflineEvent(selfId: string, reason: string): MilkyEvent {
  return createEvent({ self_id: selfId, time: Math.floor(Date.now() / 1000) }, 'bot_offline', { reason })
}
