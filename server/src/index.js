import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import lessonRoutes from './routes/lesson.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/project.js';
import chatRoutes from './routes/chat.js';
import uploadRoutes from './routes/upload.js';
import { requestLogger, errorHandler } from './middleware/logger.js';
import { lessonCache } from './middleware/cache.js';
import { getDatabase, closeDatabase } from './db/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// --- Security ---
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API server
  crossOriginEmbedderPolicy: false,
}));

// --- CORS ---
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev; tighten for prod
    }
  },
  credentials: true,
}));

// --- Compression ---
app.use(compression());

// --- Body Parsing ---
app.use(express.json({ limit: '1mb' }));

// --- Structured Logging ---
app.use(requestLogger);

// --- Rate Limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// --- Initialize Database on startup ---
try {
  getDatabase();
  console.log(`[Server] Database initialized`);
} catch (err) {
  console.error('[Server] Database initialization failed:', err.message);
  // Non-fatal — app can still serve lessons without persistence
}

// --- Routes ---
import audioRoutes from './routes/audio.js';

// Serve static tester UI
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/lesson', lessonRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/upload', uploadRoutes);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ChalkMind Server Running',
    version: '2.0.0',
    environment: NODE_ENV,
    cache: lessonCache.getStats(),
    uptime: Math.floor(process.uptime()),
  });
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// --- Error Handler (must be last) ---
app.use(errorHandler);

// --- Start Server ---
const server = app.listen(PORT, () => {
  console.log(`[Server] ChalkMind v2.0.0 running on http://localhost:${PORT} (${NODE_ENV})`);
});

// --- Graceful Shutdown ---
function shutdown(signal) {
  console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    closeDatabase();
    console.log('[Server] Shutdown complete');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
