import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/chalkmind.db');

import fs from 'fs';

let db = null;

export function getDatabase() {
  if (!db) {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL'); // Concurrent read performance

    db.pragma('foreign_keys = ON');   // Enforce cascading deletes
    runMigrations(db);
  }
  return db;
}

/**
 * Runs relational database migrations.
 */
function runMigrations(db) {
  // Create tables in order of dependencies
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      guest_id TEXT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      segments_json TEXT DEFAULT '[]',
      bloom_level TEXT DEFAULT 'understand',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER NOT NULL,
      role TEXT NOT NULL, -- 'user' or 'ai'
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_guest_id ON projects(guest_id);
    CREATE INDEX IF NOT EXISTS idx_chats_project_id ON chats(project_id);
    CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
  `);

  console.log('[DB] SQLite migrations complete (projects/chats/messages initialized)');
}

// --- Projects CRUD ---

export function createProject(userId, guestId, name) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO projects (user_id, guest_id, name)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(userId || null, userId ? null : (guestId || ''), name);
  return result.lastInsertRowid;
}

export function getProjectsForUser(userId, guestId) {
  const db = getDatabase();
  if (!userId) {
    const stmt = db.prepare(`
      SELECT * FROM projects
      WHERE user_id IS NULL AND guest_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(guestId || '');
  }
  const stmt = db.prepare(`
    SELECT * FROM projects
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(userId);
}

export function deleteProjectFromDb(projectId, userId, guestId) {
  const db = getDatabase();
  if (userId) {
    const stmt = db.prepare(`DELETE FROM projects WHERE id = ? AND user_id = ?`);
    return stmt.run(projectId, userId);
  }
  const stmt = db.prepare(`DELETE FROM projects WHERE id = ? AND user_id IS NULL AND guest_id = ?`);
  return stmt.run(projectId, guestId || '');
}

export function getProjectById(projectId) {
  const db = getDatabase();
  const stmt = db.prepare(`SELECT * FROM projects WHERE id = ?`);
  return stmt.get(projectId);
}

// --- Chats CRUD ---

export function createChatInDb(projectId, title) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO chats (project_id, title)
    VALUES (?, ?)
  `);
  const result = stmt.run(projectId, title);
  return result.lastInsertRowid;
}

export function getChatsForProject(projectId) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, project_id, title, bloom_level, created_at, updated_at
    FROM chats
    WHERE project_id = ?
    ORDER BY updated_at DESC
  `);
  return stmt.all(projectId);
}

export function getChatById(chatId) {
  const db = getDatabase();
  const stmt = db.prepare(`SELECT * FROM chats WHERE id = ?`);
  const row = stmt.get(chatId);
  if (row) {
    row.segments = JSON.parse(row.segments_json || '[]');
    delete row.segments_json;
  }
  return row;
}

export function updateChatWhiteboard(chatId, segments, bloomLevel) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE chats
    SET segments_json = ?, bloom_level = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  return stmt.run(JSON.stringify(segments), bloomLevel || 'understand', chatId);
}

export function deleteChatFromDb(chatId) {
  const db = getDatabase();
  const stmt = db.prepare(`DELETE FROM chats WHERE id = ?`);
  return stmt.run(chatId);
}

// --- Messages CRUD ---

export function saveMessageToDb(chatId, role, content) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO messages (chat_id, role, content)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(chatId, role, content);
  return result.lastInsertRowid;
}

export function getMessagesForChat(chatId) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT role, content, created_at
    FROM messages
    WHERE chat_id = ?
    ORDER BY created_at ASC
  `);
  return stmt.all(chatId);
}

// --- User CRUD ---

export function createUser(username, passwordHash, displayName) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash, display_name)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(username, passwordHash, displayName || username);
  return result.lastInsertRowid;
}

export function getUserByUsername(username) {
  const db = getDatabase();
  const stmt = db.prepare(`SELECT * FROM users WHERE username = ?`);
  return stmt.get(username);
}

export function getUserById(id) {
  const db = getDatabase();
  const stmt = db.prepare(`SELECT id, username, display_name, created_at FROM users WHERE id = ?`);
  return stmt.get(id);
}

/**
 * Closes the database.
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('[DB] Database connection closed');
  }
}
