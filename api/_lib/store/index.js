const { createMemoryStore } = require('./memory-store');
const { createUpstashStore } = require('./upstash-store');

// Selects the store adapter at runtime. If both Upstash REST credentials are present we use
// Redis; otherwise we fall back to the in-process store. Callers (cache, rate limiter)
// depend only on the shared interface, so nothing else changes when credentials appear.
function createStore({ env = process.env } = {}) {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    return createUpstashStore({ url, token });
  }
  return createMemoryStore();
}

module.exports = { createStore };
