import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

router.get('/getProfile', getProfile);
router.put('/updateProfile', updateProfile);

export default router;
