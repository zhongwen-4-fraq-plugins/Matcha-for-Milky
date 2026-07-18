import { defineStore } from 'pinia'

export interface ShortcutSettings {
  enabled: boolean
  focusMessageInputEnabled: boolean
  focusMessageInput: string
  previousUserEnabled: boolean
  previousUser: string
  nextUserEnabled: boolean
  nextUser: string
}

export const useShortcutSettingsStore = defineStore(
  'shortcut-settings',

  () => {
    const enabled = $ref<ShortcutSettings['enabled']>(true)
    const focusMessageInputEnabled = $ref<ShortcutSettings['focusMessageInputEnabled']>(true)
    const focusMessageInput = $ref<ShortcutSettings['focusMessageInput']>('Alt+I')
    const previousUserEnabled = $ref<ShortcutSettings['previousUserEnabled']>(true)
    const previousUser = $ref<ShortcutSettings['previousUser']>('Alt+ArrowUp')
    const nextUserEnabled = $ref<ShortcutSettings['nextUserEnabled']>(true)
    const nextUser = $ref<ShortcutSettings['nextUser']>('Alt+ArrowDown')

    return $$(
      {
        enabled,
        focusMessageInputEnabled,
        focusMessageInput,
        previousUserEnabled,
        previousUser,
        nextUserEnabled,
        nextUser,
      },
    )
  },

  {
    persist: true,
  },
)
