import { Request, Response } from 'express';
import { chatService } from '../services/chat.service';

export const chatController = {
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, userId, conversationId } = req.body;

      if (!message || !userId) {
        return res.status(400).json({ error: 'Message and userId are required' });
      }

      const result = await chatService.processMessage(message, userId, conversationId);
      res.json(result);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  },

  async getConversations(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const conversations = await chatService.getConversations(userId as string);
      res.json(conversations);
    } catch (error) {
      console.error('Error in getConversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  },

  async getConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const conversation = await chatService.getConversationById(id as string);

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      res.json(conversation);
    } catch (error) {
      console.error('Error in getConversation:', error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  },

  async deleteConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await chatService.deleteConversation(id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteConversation:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  },
};