import { Router } from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

router.post('/', createTask);
router.get('/', getTasks);
router.put('/', updateTask);
router.delete('/', deleteTask);

export default router;
