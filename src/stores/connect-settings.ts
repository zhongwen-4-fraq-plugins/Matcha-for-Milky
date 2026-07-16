import { defineStore } from 'pinia'

export interface ConnectSettings {
  protocol: 'Milky.V1.2' | 'OneBot.V11.Standard' | 'OneBot.V12.Standard'
  comm: 'milky' | 'http' | 'httpWebhook' | 'websocketServer' | 'websocketClient'
  host: string
  port: number
  url: string
  accessToken?: string
  reconnectInterval: number
  heartbeatInterval: number
  timeout: number
  postSelfEvents: boolean
  showError: boolean
  autoReconnect: boolean
}

export const useConnectSettingsStore = defineStore(
  'connect-settings',

  () => {
    const protocol = $ref<ConnectSettings['protocol']>('Milky.V1.2')
    const comm = $ref<ConnectSettings['comm']>('milky')
    const host = $ref('127.0.0.1')
    const port = $ref(3_0001)
    const url = $ref('ws://127.0.0.1:8120/onebot/v11/ws')
    const accessToken = $ref<ConnectSettings['accessToken']>()
    const reconnectInterval = $ref(3)
    const heartbeatInterval = $ref(3)
    const timeout = $ref(3)
    const postSelfEvents = $ref(false)
    const showError = $ref(true)
    const autoReconnect = $ref(true)

    return $$({
      protocol,
      comm,
      host,
      port,
      url,
      accessToken,
      reconnectInterval,
      heartbeatInterval,
      timeout,
      postSelfEvents,
      showError,
      autoReconnect,
    })
  },

  {
    persist: true,
  },
)
