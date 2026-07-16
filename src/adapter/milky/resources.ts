import type { Messages } from './message'

export interface ForwardedMessage {
  message_seq: number
  sender_name: string
  avatar_url: string
  time: number
  segments: Messages[]
}

const forwardedMessages = new Map<string, ForwardedMessage[]>()

export function saveForwardedMessages(forwardId: string, messages: ForwardedMessage[]): void {
  forwardedMessages.set(forwardId, messages)
}

export function getForwardedMessages(forwardId: string): ForwardedMessage[] | undefined {
  return forwardedMessages.get(forwardId)
}
