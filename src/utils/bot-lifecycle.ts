export type BotLifecycleAction = 'startup' | 'shutdown' | undefined

export function getBotLifecycleAction(previousBotId?: string, currentBotId?: string): BotLifecycleAction {
  if (!previousBotId && currentBotId) {
    return 'startup'
  }
  if (previousBotId && !currentBotId) {
    return 'shutdown'
  }
}
