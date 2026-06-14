import { Router } from 'express';
import { TeachingAgent } from '../agent/teachingAgent.js';
import { optionalAuth } from '../middleware/auth.js';
import {
  getChatById,
  deleteChatFromDb,
  getProjectsForUser,
  saveMessageToDb,
  getMessagesForChat,
  updateChatWhiteboard,
  getDatabase
} from '../db/database.js';

const router = Router();
const agent = new TeachingAgent();

/**
 * Helper: Verify that the current user/guest owns the chat.
 */
function verifyChatOwnership(chatId, userId, guestId) {
  const chat = getChatById(chatId);
  if (!chat) return null;

  if (!userId && !guestId) return null;

  // Find project owner
  const db = getDatabase();
  const stmt = db.prepare('SELECT user_id, guest_id FROM projects WHERE id = ?');
  const project = stmt.get(chat.project_id);
  if (!project) return null;

  if (userId) {
    if (project.user_id !== userId) return null;
  } else {
    if (project.user_id !== null || project.guest_id !== guestId) return null;
  }

  return { chat, project };
}

/**
 * GET /api/chats/:id
 * Retrieve a specific chat's message history and whiteboard segments.
 */
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const userId = req.user?.userId || null;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Session context (User or Guest ID) is required' });
    }

    const ownership = verifyChatOwnership(chatId, userId, guestId);
    if (!ownership) {
      return res.status(403).json({ error: 'Chat not found or not authorized' });
    }

    const messages = getMessagesForChat(chatId);
    res.json({
      ...ownership.chat,
      messages
    });
  } catch (error) {
    console.error('[Chat Get] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/chats/:id
 * Delete a chat conversation thread.
 */
router.delete('/:id', optionalAuth, (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const userId = req.user?.userId || null;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Session context (User or Guest ID) is required' });
    }

    const ownership = verifyChatOwnership(chatId, userId, guestId);
    if (!ownership) {
      return res.status(403).json({ error: 'Chat not found or not authorized' });
    }

    deleteChatFromDb(chatId);
    res.json({ success: true });
  } catch (error) {
    console.error('[Chat Delete] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chats/:id/message
 * Send a message within a chat thread.
 * Generates visual whiteboard segments via TeachingAgent, updates the chat context,
 * and saves both messages to the database.
 */
router.post('/:id/message', optionalAuth, async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const { prompt, bloomLevel } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const userId = req.user?.userId || null;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Session context (User or Guest ID) is required' });
    }

    const ownership = verifyChatOwnership(chatId, userId, guestId);
    if (!ownership) {
      return res.status(403).json({ error: 'Chat not found or not authorized' });
    }

    const { chat } = ownership;

    // Fetch conversation history
    const history = getMessagesForChat(chatId);
    const conversationHistory = history.map(h => ({
      role: h.role,
      content: h.content
    }));

    console.log(`[Chat Msg] Generating explanation in Chat ${chatId} for prompt: "${prompt.slice(0, 60)}..."`);
    const startTime = Date.now();

    // Call OpenAI agent
    const activeBloomLevel = bloomLevel || chat.bloom_level || 'understand';
    const lesson = await agent.generateLesson(prompt, {
      conversationHistory,
      bloomLevel: activeBloomLevel
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Chat Msg] Generated segments in ${elapsed}ms`);

    // Save messages
    saveMessageToDb(chatId, 'user', prompt.trim());
    saveMessageToDb(chatId, 'ai', lesson.title);

    // Append visual segments to the chat's existing whiteboard with a 2D quadrant turn index
    const turnIndex = Math.floor(conversationHistory.length / 2);
    const positionedSegments = (lesson.segments || []).map(seg => ({
      ...seg,
      turnIndex
    }));
    const updatedSegments = [...(chat.segments || []), ...positionedSegments];
    updateChatWhiteboard(chatId, updatedSegments, activeBloomLevel);

    // Auto-update chat title if it was a default placeholder
    const isDefaultTitle = chat.title.toLowerCase().startsWith('new chat') || 
                           chat.title.toLowerCase().startsWith('untitled');
    if (isDefaultTitle) {
      const db = getDatabase();
      const newTitle = lesson.title.slice(0, 50);
      db.prepare('UPDATE chats SET title = ? WHERE id = ?').run(newTitle, chatId);
      chat.title = newTitle;
    }

    res.json({
      title: chat.title,
      bloom_level: activeBloomLevel,
      newMessages: [
        { role: 'user', content: prompt.trim() },
        { role: 'ai', content: lesson.title }
      ],
      newSegments: positionedSegments,
      allSegments: updatedSegments
    });

  } catch (error) {
    console.error('[Chat Message Error]:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;

