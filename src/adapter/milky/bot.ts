import { Adapter } from '~/adapter/adapter'

import { ActionHandler } from './action'
import { EventHandler } from './event'

export class Milky extends Adapter {
  readonly protocolName = 'Milky 1.2'
  readonly protocolId = 'Milky.V1.2'
  readonly protocolUrl = ''
  readonly supportMode = 'milky'
  readonly actionHandler = new ActionHandler()
  readonly eventHandler = new EventHandler()

  getConnectHeaders(): Record<string, string> {
    return {}
  }
}
