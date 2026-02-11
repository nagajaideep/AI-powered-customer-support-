import { Router } from 'express';
import { agentController } from '../controllers/agent.controller';

const router = Router();

router.get('/', agentController.getAgents);
router.get('/:type/capabilities', agentController.getAgentCapabilities);

export { router as agentRoutes };