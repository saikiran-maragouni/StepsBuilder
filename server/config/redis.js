/**
 * config/redis.js
 *
 * Initializes an ioredis client.
 * If REDIS_URL is not set (e.g. during local dev before Railway setup),
 * returns a no-op cache so the rest of the app works without Redis.
 */

const Redis = require('ioredis');

let redisClient = null;
let isConnected = false;

// ── In-memory fallback cache (used when Redis is unavailable) ─────────────────
// Simple Map-based TTL store — keeps AI responses fast on the same server process.
const memCache = new Map(); // key → { value, expiresAt }

const memGet = (key) => {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { memCache.delete(key); return null; }
  return entry.value;
};

const memSet = (key, value, ttlSeconds) => {
  memCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};

const memDel = (key) => memCache.delete(key);

const connectRedis = () => {
  if (!process.env.REDIS_URL) {
    console.warn('⚠️  REDIS_URL not set — caching disabled. AI responses will not be cached.');
    return null;
  }

  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: false,
      // Stop retrying forever if the host can't be resolved (bad URL)
      retryStrategy: (times) => (times > 2 ? null : Math.min(times * 500, 2000)),
    });

    redisClient.on('connect', () => {
      isConnected = true;
      console.log('✅ Redis connected');
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      console.error('⚠️  Redis error (caching disabled):', err.message);
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    return redisClient;
  } catch (err) {
    console.error('⚠️  Redis init failed (caching disabled):', err.message);
    return null;
  }
};

// ── Cache helpers (no-op safe when Redis is unavailable) ──────────────────────

/**
 * Get a value from cache. Returns null if miss or Redis unavailable.
 */
const cacheGet = async (key) => {
  // 1. Try Redis
  if (redisClient && isConnected) {
    try {
      const data = await redisClient.get(key);
      if (data) return JSON.parse(data);
    } catch { /* fall through */ }
  }
  // 2. Fall back to in-memory cache
  return memGet(key);
};

/**
 * Set a value in cache with optional TTL in seconds (default 1 hour).
 */
const cacheSet = async (key, value, ttlSeconds = 3600) => {
  // Always write to in-memory cache (instant, zero-dependency)
  memSet(key, value, ttlSeconds);
  // Also write to Redis if available
  if (redisClient && isConnected) {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch { /* Silently swallow */ }
  }
};

/**
 * Delete a cache key (call this when roadmap is regenerated).
 */
const cacheDel = async (key) => {
  memDel(key);
  if (redisClient && isConnected) {
    try { await redisClient.del(key); } catch { /* Silently swallow */ }
  }
};

module.exports = { connectRedis, cacheGet, cacheSet, cacheDel };
