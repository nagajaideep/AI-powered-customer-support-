import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';

const router = Router();

router.post('/messages', chatController.sendMessage);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getConversation);
router.delete('/conversations/:id', chatController.deleteConversation);

export { router as chatRoutes };