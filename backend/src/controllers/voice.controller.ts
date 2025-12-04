import { Request, Response } from 'express';
import { transcribeBuffer } from '../utils/deepgramClient';
import parseTask from '../utils/parseTask';

export const transcribeVoice = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    // Send buffer to Deepgram
    const mimetype = req.file.mimetype || 'audio/webm';
    const buffer = req.file.buffer;

    const transcript = await transcribeBuffer(buffer, mimetype);

    if (!transcript || transcript.trim().length === 0) {
      return res.status(200).json({
        transcript: '',
        title: '',
        dueDate: null,
        priority: 'Medium',
        status: 'To Do',
        message: 'No transcript detected.'
      });
    }

    // Parse
    const parsed = parseTask(transcript);

    // Return structured JSON
    return res.json({
      transcript,
      ...parsed
    });
  } catch (err: any) {
    console.error('Error in /api/voice/transcribe:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};
