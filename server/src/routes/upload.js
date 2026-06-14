import { Router } from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { optionalAuth } from '../middleware/auth.js';
import { createDocument, updateDocumentStatus } from '../db/database.js';
import { processDocument } from '../agent/ingestionAgent.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/upload
 * Upload a study material file (PDF or Text).
 */
router.post('/', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const guestId = req.guestId;
    const projectId = req.body.projectId;

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Session context (User or Guest ID) is required' });
    }
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    let rawText = '';

    // Extract text based on file type
    if (file.mimetype === 'application/pdf') {
      const data = await pdf(file.buffer);
      rawText = data.text;
    } else if (file.mimetype === 'text/plain') {
      rawText = file.buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or TXT file.' });
    }

    // Insert Document into DB
    const documentId = createDocument(parseInt(projectId), file.originalname, 'processing');

    // Respond immediately to the client
    res.json({ success: true, documentId, status: 'processing', message: 'Document is being ingested in the background.' });

    // Kick off asynchronous ingestion pipeline
    processDocument(documentId, rawText).catch(err => {
      console.error('[UploadRoute] Ingestion failed:', err);
      updateDocumentStatus(documentId, 'error');
    });

  } catch (error) {
    console.error('[UploadRoute] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
