import { Adapter } from '~/adapter/adapter'

import { ActionHandler } from './action'
import { EventHandler } from './event'
import { createBotOfflineEvent } from './events/system'

export class Milky extends Adapter {
  readonly protocolName = 'Milky 1.2'
  readonly actionHandler = new ActionHandler()
  readonly eventHandler = new EventHandler()

  async onShutdown(): Promise<void> {
    if (this.state.bot) {
      await this.send(createBotOfflineEvent(this.state.bot.id, 'Meow 协议端已停止'))
    }
  }
}
