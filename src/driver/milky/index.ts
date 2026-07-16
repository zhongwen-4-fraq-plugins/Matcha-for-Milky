import { invoke, isTauri } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { toast } from 'vue-sonner'

import { Driver } from '../driver'

import type { UnlistenFn } from '@tauri-apps/api/event'
import type { ActionRequest, ActionResponse } from '~/adapter/action'
import type { Adapter } from '~/adapter/adapter'
import type { Event } from '~/adapter/event'

interface MilkyActionRequest extends ActionRequest {
  requestId: number
}

export class milky extends Driver {
  private unlisten: UnlistenFn[] = []

  constructor(public adapter: Adapter) {
    super(adapter)
    useEventListener('beforeunload', () => void this.adapter.shutdown())
  }

  async run(): Promise<void> {
    await this.stop()
    if (!isTauri()) {
      return
    }
    this.unlisten = await Promise.all([
      listen<MilkyActionRequest>('milky-action', async ({ payload }) => {
        let response: ActionResponse
        try {
          response = await this.adapter.actionHandle(payload)
        } catch (error) {
          response = {
            status: 'failed',
            retcode: -500,
            // eslint-disable-next-line unicorn/no-null
            data: null,
            message: String(error),
          } as ActionResponse
        }
        await invoke('resolve_milky_action', { requestId: payload.requestId, response }).catch((error) => {
          void logger.debug(`Milky API 请求已结束: ${String(error)}`)
        })
      }),
      listen<number>('milky-client-count', ({ payload }) => {
        this.adapter.state.isConnected = payload > 0
      }),
    ])
    try {
      await invoke('start_milky_server', {
        host: this.adapter.config.host,
        port: this.adapter.config.port,
        accessToken: this.adapter.config.accessToken ?? '',
        timeout: this.adapter.config.timeout,
      })
      this.adapter.state.isConnected = false
      void logger.info(`Milky 服务已监听 http://${this.adapter.config.host}:${this.adapter.config.port}`)
      toast.success('Milky 服务已启动', {
        description: `${this.adapter.config.host}:${this.adapter.config.port}`,
      })
    } catch (error) {
      for (const unlisten of this.unlisten) {
        unlisten()
      }
      this.unlisten = []
      throw error
    }
  }

  async stop(): Promise<void> {
    for (const unlisten of this.unlisten) {
      unlisten()
    }
    this.unlisten = []
    if (!isTauri()) {
      this.adapter.state.isConnected = false
      return
    }
    await invoke('stop_milky_server').catch((error) => {
      void logger.debug(`Milky 服务无需停止: ${String(error)}`)
    })
    this.adapter.state.isConnected = false
  }

  async send(event: Event): Promise<boolean> {
    if (!isTauri()) {
      return false
    }
    try {
      await invoke('emit_milky_event', { event })
      return true
    } catch (error) {
      void logger.error(`Milky 事件发送失败: ${String(error)}`)
      return false
    }
  }
}
