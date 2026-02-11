import { prisma } from '../db/prisma'

/**
 * Get message history for a conversation
 * @param conversationId - Conversation UUID
 * @param limit - Maximum messages to fetch (default 10)
 * @returns Array of messages ordered by most recent first
 */
export async function getConversationHistory(
  conversationId: string,
  limit = 10
) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      role: true,
      content: true,
      agentType: true,
      createdAt: true
    }
  })
}

/**
 * Get all conversations for a user
 * @param userId - User UUID
 * @returns Array of conversations with message counts
 */
export async function getUserConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { userId },
    include: {
      _count: {
        select: { messages: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Create a new conversation
 * @param userId - User UUID
 * @returns New conversation object
 */
export async function createConversation(userId: string) {
  return prisma.conversation.create({
    data: {
      userId
    }
  })
}