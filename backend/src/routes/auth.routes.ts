import { Router } from 'express';
import { signup, login, refresh, logout, getCurrentUser, updateProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh); // Refresh uses cookies, not Bearer token

// Protected routes
router.use(authMiddleware);
router.post('/logout', logout);
router.get('/current-user', getCurrentUser);
router.put('/update-profile', updateProfile);

export default router;
