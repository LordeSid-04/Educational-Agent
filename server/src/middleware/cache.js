import crypto from 'crypto';

/**
 * In-Memory LRU Cache for identical lesson prompts.
 *
 * - Reduces OpenAI API costs for repeated/identical queries.
 * - TTL-based expiry (default 30 minutes).
 * - Max entries cap to prevent memory bloat.
 *
 * Cache key = sha256(prompt + bloomLevel)
 * Cache value = full lesson JSON
 */

const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes
const DEFAULT_MAX_ENTRIES = 50;

class LRUCache {
  constructor({ maxEntries = DEFAULT_MAX_ENTRIES, ttl = DEFAULT_TTL } = {}) {
    this.maxEntries = maxEntries;
    this.ttl = ttl;
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0 };
  }

  _makeKey(prompt, bloomLevel) {
    const raw = `${prompt.trim().toLowerCase()}::${bloomLevel}`;
    return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
  }

  get(prompt, bloomLevel) {
    const key = this._makeKey(prompt, bloomLevel);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.stats.hits++;

    return entry.data;
  }

  set(prompt, bloomLevel, data) {
    const key = this._makeKey(prompt, bloomLevel);

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      total,
      hitRate: total > 0 ? ((this.stats.hits / total) * 100).toFixed(1) + '%' : '0%',
      entries: this.cache.size,
    };
  }

  clear() {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }
}

// Singleton instance
export const lessonCache = new LRUCache();
