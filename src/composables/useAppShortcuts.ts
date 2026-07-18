import { toast } from 'vue-sonner'

import { useShortcutSettingsStore } from '~/stores/shortcut-settings'
import { getShortcutFromEvent } from '~/utils/shortcut'

export function useAppShortcuts(): void {
  const settings = useShortcutSettingsStore()
  const state = useStateStore()

  function focusMessageInput(): void {
    document.querySelector<HTMLElement>('[data-chat-input]')?.focus()
  }

  async function switchUser(direction: -1 | 1): Promise<void> {
    const allUsers = await db.users.orderBy('id').toArray()
    const users = allUsers.filter(user => user.id !== state.bot?.id)
    if (users.length < 2) {
      return
    }

    const currentIndex = users.findIndex(user => user.id === state.user?.id)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + direction + users.length) % users.length
    const user = users[nextIndex]
    await state.refreshUser(user.id)
    await db.users.update(user.id, { lastUseTime: getTimestamp() })
    toast.success(`已切换到 ${user.name}`)
  }

  function handleShortcut(event: KeyboardEvent): void {
    if (!settings.enabled || event.repeat || event.defaultPrevented) {
      return
    }

    const shortcut = getShortcutFromEvent(event)
    if (!shortcut) {
      return
    }

    if (settings.focusMessageInputEnabled && shortcut === settings.focusMessageInput) {
      event.preventDefault()
      focusMessageInput()
      return
    }

    if (settings.previousUserEnabled && shortcut === settings.previousUser) {
      event.preventDefault()
      void switchUser(-1)
      return
    }

    if (settings.nextUserEnabled && shortcut === settings.nextUser) {
      event.preventDefault()
      void switchUser(1)
    }
  }

  onMounted(() => globalThis.addEventListener('keydown', handleShortcut))
  onBeforeUnmount(() => globalThis.removeEventListener('keydown', handleShortcut))
}
