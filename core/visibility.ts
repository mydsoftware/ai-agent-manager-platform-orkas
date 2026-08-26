import type { AgentMessage } from './types'

/**
 * فقط پیام‌هایی را به Agent می‌دهد که برای آن Agent قابل مشاهده‌اند.
 * این همان اصل Context/Visibility Slicing در معماری Orkas-inspired است.
 */
export function visibleMessages(messages: AgentMessage[], recipientId: string): AgentMessage[] {
  return messages.filter((message) => {
    if (message.recipientId === recipientId || message.senderId === recipientId) return true
    if (!message.visibility?.length) return false
    return message.visibility.includes(recipientId)
  })
}

export function sliceContext(messages: AgentMessage[], recipientId: string): string {
  return visibleMessages(messages, recipientId)
    .map((message) => `[${message.senderId} -> ${message.recipientId}] ${message.text}`)
    .join('\n')
}
