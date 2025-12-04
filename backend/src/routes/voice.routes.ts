import { Router } from 'express';
import multer from 'multer';
import { transcribeVoice } from '../controllers/voice.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protect voice routes
router.use(authMiddleware);

router.post('/transcribe', upload.single('file'), transcribeVoice);

export default router;
