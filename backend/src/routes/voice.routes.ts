import { Router } from 'express';
import { voiceTaskHandler } from '../controllers/voice.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protect voice routes
router.use(authMiddleware);

router.post('/voice-task', voiceTaskHandler);

export default router;
