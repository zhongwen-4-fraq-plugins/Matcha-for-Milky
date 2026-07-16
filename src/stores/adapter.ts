import { defineStore } from 'pinia'

import { Milky } from '~/adapter/milky'

export const useAdapterStore = defineStore('adapter', () => {
  const connect = useConnectSettingsStore()

  const bot = new Milky(connect)

  return {
    bot,
  }
})
