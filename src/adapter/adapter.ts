/* eslint-disable @typescript-eslint/no-empty-function */
import { MilkyDriver } from '~/driver/milky'

import { ProtocolError } from './errors'

import type { ActionRequest, ActionResponse, AdapterActionHandler } from './action'
import type { AdapterEventHandler, Event } from './event'
import type { ConnectSettings } from '~/stores/connect-settings'

export abstract class Adapter {
  /** 协议名称 */
  abstract readonly protocolName: string

  /** 动作处理器 */
  abstract readonly actionHandler: AdapterActionHandler

  /** 事件处理器 */
  abstract readonly eventHandler: AdapterEventHandler<Event>

  /** 驱动器实例 */
  driver: MilkyDriver | undefined

  chat = useChatStore()

  state = useStateStore()

  constructor(public config: ConnectSettings) {}

  async startup(): Promise<void> {
    if (!this.state.bot || this.driver) {
      return
    }
    this.driver = new MilkyDriver(this)
    await this.driver.run()
  }

  async shutdown(): Promise<void> {
    if (!this.driver) {
      return
    }
    await this.onShutdown()
    await this.driver.stop()
    this.driver = undefined
  }

  async reboot(): Promise<void> {
    await this.shutdown()
    await this.startup()
  }

  async send(event: Event): Promise<boolean> {
    return (await this.driver?.send(event)) || false
  }

  async actionHandle(request: ActionRequest): Promise<ActionResponse> {
    void logger.debug(
      `[API: ${request.action}] 请求参数: ${JSON.stringify(request.params)}`,
    )
    try {
      const response = await this.actionHandler.handle(request)
      void logger.debug(
        `[API: ${request.action}] 响应结果: ${JSON.stringify(response)}`,
      )
      return response
    } catch (error) {
      if (error instanceof ProtocolError) {
        void logger.warn(
          `[API: ${request.action}] 调用失败: ${JSON.stringify(error.response)}`,
        )
        return error.response
      }
      void logger.error(`[API: ${request.action}] 调用异常: ${String(error)}`)
      throw error
    }
  }

  /** 当适配器关闭时 */
  async onShutdown(): Promise<void> {}
}
