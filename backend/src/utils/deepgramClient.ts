import { Deepgram } from '@deepgram/sdk';
import dotenv from 'dotenv';

dotenv.config();

const dgKey = process.env.DEEPGRAM_API_KEY;
if (!dgKey) {
    console.warn('Warning: DEEPGRAM_API_KEY is not set. Add it to .env');
}

const dgClient = new Deepgram(dgKey || '');

/**
 * Transcribe audio buffer using Deepgram preRecorded endpoint.
 * Returns the transcript string (best alternative).
 */
export async function transcribeBuffer(buffer: Buffer, mimetype: string = 'audio/webm'): Promise<string> {
    try {
        const resp = await dgClient.transcription.preRecorded(
            { buffer, mimetype },
            {
                punctuate: true,
                diarize: false,
                model: 'general',
            }
        );

        // Deepgram response structure: results.channels[0].alternatives[0].transcript
        const channel = resp?.results?.channels?.[0];
        const transcript = channel?.alternatives?.[0]?.transcript || '';
        return transcript;
    } catch (err) {
        console.error('Deepgram transcription error:', err);
        throw err;
    }
}
