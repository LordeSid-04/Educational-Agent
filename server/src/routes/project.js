import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { 
  createProject, 
  getProjectsForUser, 
  deleteProjectFromDb,
  getChatsForProject,
  createChatInDb
} from '../db/database.js';

const router = Router();

/**
 * GET /api/projects
 * List all projects folders for the current user or guest session.
 */
router.get('/', optionalAuth, (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Session context (User or Guest ID) is required' });
    }

    const projects = getProjectsForUser(userId, guestId);
    res.json({ projects });
  } catch (error) {
    console.error('[Project List] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects
 * Create a new project folder.
 */
router.post('/', optionalAuth, (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const userId = req.user?.userId || null;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Session context (User or Guest ID) is required' });
    }

    const projectId = createProject(userId, guestId, name.trim());
    res.json({ id: projectId, name: name.trim() });
  } catch (error) {
    console.error('[Project Create] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project folder and all its chats.
 */
router.delete('/:id', optionalAuth, (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user?.userId || null;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Session context (User or Guest ID) is required' });
    }

    const result = deleteProjectFromDb(projectId, userId, guestId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found or not authorized' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Project Delete] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:id/chats
 * List all chats within a specific project.
 */
router.get('/:id/chats', optionalAuth, (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user?.userId || null;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Session context (User or Guest ID) is required' });
    }
    
    const projects = getProjectsForUser(userId, guestId);
    const isOwner = projects.some(p => p.id === projectId);
    
    if (!isOwner) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }

    const chats = getChatsForProject(projectId);
    res.json({ chats });
  } catch (error) {
    console.error('[Project Chats] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects/:id/chats
 * Create a new chat conversation thread in this project.
 */
router.post('/:id/chats', optionalAuth, (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { title } = req.body;
    
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Chat title is required' });
    }

    const userId = req.user?.userId || null;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Session context (User or Guest ID) is required' });
    }
    
    const projects = getProjectsForUser(userId, guestId);
    const isOwner = projects.some(p => p.id === projectId);
    
    if (!isOwner) {
      return res.status(403).json({ error: 'Not authorized to modify this project' });
    }

    const chatId = createChatInDb(projectId, title.trim());
    res.json({ id: chatId, project_id: projectId, title: title.trim(), segments: [], bloom_level: 'understand' });
  } catch (error) {
    console.error('[Project Chat Create] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;

