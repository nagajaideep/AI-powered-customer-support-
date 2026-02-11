import { Router } from 'express';
import { chatRoutes } from '../routes/chat.routes';
import { agentRoutes } from '../routes/agent.routes';
import { healthRoutes } from '../routes/health.routes';
import { userRoutes } from '../routes/user.routes';

const router = Router();

router.use('/chat', chatRoutes);
router.use('/agents', agentRoutes);
router.use('/health', healthRoutes);
router.use('/users', userRoutes);

export default router;