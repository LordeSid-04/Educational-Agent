import { Router } from 'express';
import { TeachingAgent } from '../agent/teachingAgent.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
const agent = new TeachingAgent();

/**
 * POST /api/lesson
 * Generate a new lesson from a prompt.
 * Stubbed version (no DB persistence, use /api/chats instead).
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { prompt, conversationHistory, bloomLevel } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A prompt string is required' });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({ error: 'Prompt must be under 2000 characters' });
    }

    const userId = req.user?.userId || null;
    console.log(`[Lesson] Generating for: "${prompt.slice(0, 80)}..." (Bloom: ${bloomLevel || 'understand'}, User: ${userId || 'guest'})`);
    const startTime = Date.now();

    const lesson = await agent.generateLesson(prompt, {
      conversationHistory: conversationHistory || [],
      bloomLevel: bloomLevel || 'understand',
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Lesson] Generated "${lesson.title}" (${lesson.segments.length} segments) in ${elapsed}ms`);

    res.json(lesson);
  } catch (error) {
    console.error('[Lesson] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/lesson/history
 * Get the user's lesson history (Stubbed).
 */
router.get('/history', optionalAuth, (req, res) => {
  try {
    res.json({ lessons: [] });
  } catch (error) {
    console.error('[Lesson History] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/lesson/:id
 * Get a specific lesson by ID (Stubbed).
 */
router.get('/:id', optionalAuth, (req, res) => {
  try {
    res.status(404).json({ error: 'Lesson not found' });
  } catch (error) {
    console.error('[Lesson Get] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/lesson/:id
 * Delete a lesson (Stubbed).
 */
router.delete('/:id', optionalAuth, (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    console.error('[Lesson Delete] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/lesson/continue
 * Continue after a checkpoint.
 */
router.post('/continue', optionalAuth, async (req, res) => {
  try {
    const { checkpointResult, conversationHistory, bloomLevel } = req.body;

    if (!checkpointResult) {
      return res.status(400).json({ error: 'checkpointResult is required' });
    }

    console.log(`[Lesson] Continuing after checkpoint (correct: ${checkpointResult.isCorrect})`);

    const lesson = await agent.continueAfterCheckpoint(checkpointResult, {
      conversationHistory: conversationHistory || [],
      bloomLevel: bloomLevel || 'understand',
    });

    res.json(lesson);
  } catch (error) {
    console.error('[Lesson Continue] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/lesson/clarify
 * Re-explain a topic differently.
 */
router.post('/clarify', optionalAuth, async (req, res) => {
  try {
    const { topic, conversationHistory, bloomLevel } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'topic is required' });
    }

    console.log(`[Lesson] Clarifying: "${topic.slice(0, 80)}..."`);

    const lesson = await agent.clarify(topic, {
      conversationHistory: conversationHistory || [],
      bloomLevel: bloomLevel || 'understand',
    });

    res.json(lesson);
  } catch (error) {
    console.error('[Lesson Clarify] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
