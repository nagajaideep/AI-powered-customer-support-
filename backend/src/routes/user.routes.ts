// filepath: src/routes/user.routes.ts
import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const router = Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);

export { router as userRoutes };