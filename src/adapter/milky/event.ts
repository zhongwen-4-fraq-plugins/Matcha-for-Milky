import { AdapterEventHandler } from '~/adapter/event'

import { friendEventStrategy } from './events/friend'
import { groupEventStrategy } from './events/group'
import { messageEventStrategy } from './events/message'
import { systemEventStrategy } from './events/system'

import type { MilkyEvent } from './events/typed'
import type { Messages } from './message'
import type { EventStrategy } from '~/adapter/event'
import type { SceneMapping } from '~/adapter/scene'

export const eventStrategy: EventStrategy<SceneMapping<Messages>> = {
  ...systemEventStrategy,
  ...messageEventStrategy,
  ...friendEventStrategy,
  ...groupEventStrategy,
}

export class EventHandler extends AdapterEventHandler<MilkyEvent> {
  readonly strategy = eventStrategy
}
