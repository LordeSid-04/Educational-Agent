import { Router } from 'express';
import multer from 'multer';
import OpenAI, { toFile } from 'openai';
import { optionalAuth } from '../middleware/auth.js';
import fs from 'fs';

const router = Router();
let openaiInstance = null;

function getOpenAI() {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

// Configure multer for memory storage (keep file buffer in memory)
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/audio/transcribe
 * Accepts an audio file (multipart/form-data) and returns transcribed text using Whisper.
 */
router.post('/transcribe', optionalAuth, upload.single('audio'), async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Session context (User or Guest ID) is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log(`[Audio Transcribe] Processing audio buffer of size ${req.file.size} bytes`);
    
    // Determine file extension from mimetype or default to webm
    let ext = 'webm';
    if (req.file.mimetype === 'audio/wav' || req.file.mimetype === 'audio/x-wav') ext = 'wav';
    if (req.file.mimetype === 'audio/mp4') ext = 'm4a';

    // Convert memory buffer to OpenAI File object
    const file = await toFile(req.file.buffer, `audio.${ext}`, { type: req.file.mimetype });

    const response = await getOpenAI().audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en', // Can be removed for auto-detect or customized
    });

    console.log(`[Audio Transcribe] Success: "${response.text.slice(0, 50)}..."`);
    res.json({ text: response.text });
  } catch (error) {
    console.error('[Audio Transcribe Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to transcribe audio' });
  }
});

/**
 * POST /api/audio/synthesize
 * Accepts text and returns an audio file buffer (TTS)
 */
router.post('/synthesize', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Session context (User or Guest ID) is required' });
    }

    const { text, voice = 'alloy' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    console.log(`[Audio Synthesize] Generating speech for text: "${text.slice(0, 50)}..."`);

    const mp3Response = await getOpenAI().audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text.trim(),
    });

    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('[Audio Synthesize Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to synthesize speech' });
  }
});

export default router;
