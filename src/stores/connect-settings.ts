import { defineStore } from 'pinia'

export interface ConnectSettings {
  host: string
  port: number
  accessToken?: string
  timeout: number
  postSelfEvents: boolean
}

export const useConnectSettingsStore = defineStore(
  'connect-settings',

  () => {
    const host = $ref('127.0.0.1')
    const port = $ref(3_0001)
    const accessToken = $ref<ConnectSettings['accessToken']>()
    const timeout = $ref(3)
    const postSelfEvents = $ref(false)

    return $$({
      host,
      port,
      accessToken,
      timeout,
      postSelfEvents,
    })
  },

  {
    persist: true,
  },
)
