import { Router } from 'express';
import { signup, login, refresh, logout, getCurrentUser } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

router.post('/signup', signup);
router.post('/login', login);

// Protected routes – need a valid refresh‑token cookie
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/current-user', getCurrentUser);

export default router;
