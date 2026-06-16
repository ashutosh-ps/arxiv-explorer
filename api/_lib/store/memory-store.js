// In-process store with TTL expiry. The default Store adapter: used in dev and tests,
// and as a fail-safe when no Upstash credentials are configured. Implements the same
// async interface as the Upstash adapter so callers never know which one they hold.
function createMemoryStore({ now = () => Date.now() } = {}) {
  const map = new Map();

  return {
    kind: 'memory',

    async get(key) {
      const entry = map.get(key);
      if (!entry) return undefined;
      if (now() >= entry.expiresAt) {
        map.delete(key);
        return undefined;
      }
      return entry.value;
    },

    async set(key, value, ttlSeconds) {
      const expiresAt = ttlSeconds ? now() + ttlSeconds * 1000 : Infinity;
      map.set(key, { value, expiresAt });
    },
  };
}

module.exports = { createMemoryStore };
