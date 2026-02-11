import { prisma } from '../db/prisma';
import { routerAgent } from '../agents/router.agent';

export const chatService = {
  async processMessage(message: string, userId: string, conversationId?: string) {
    // Create or get conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          title: message.substring(0, 50),
        },
        include: { messages: true },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation!.id,
        role: 'user',
        content: message,
      },
    });

    // Get conversation history
    const history = conversation!.messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Process with router agent
    const response = await routerAgent.route(message, history, userId);

    // Save assistant message
    await prisma.message.create({
      data: {
        conversationId: conversation!.id,
        role: 'assistant',
        content: response.reply,
        agentType: response.agentType,
      },
    });

    return {
      response: response.reply,
      agentType: response.agentType,
      conversationId: conversation!.id,
    };
  },

  async getConversations(userId: string) {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
    });
  },

  async getConversationById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });
  },

  async deleteConversation(id: string) {
    return prisma.conversation.delete({
      where: { id },
    });
  },
};