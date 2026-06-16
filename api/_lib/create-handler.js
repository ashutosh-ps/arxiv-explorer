const { createStore } = require('./store');
const { createRateLimiter } = require('./rate-limit');
const { createGateway } = require('./gateway');

// Assembles the full arXiv gateway handler from environment configuration. Both entry
// points — the Vercel function (api/arxiv.js) and the dev proxy (src/setupProxy.js) —
// call this so dev and prod run identical code.
//
// Config (all optional, with sane defaults):
//   UPSTASH_REDIS_REST_URL / _TOKEN  -> use Redis instead of in-memory store
//   RATE_LIMIT_CAPACITY              -> burst size per client      (default 20)
//   RATE_LIMIT_REFILL_PER_SEC        -> sustained rate per client  (default 5)
//   ARXIV_CACHE_TTL_SECONDS          -> cache lifetime             (default 3600)
function createArxivHandler({ env = process.env, fetchImpl } = {}) {
  const store = createStore({ env });
  const rateLimiter = createRateLimiter(store, {
    capacity: Number(env.RATE_LIMIT_CAPACITY) || 20,
    refillPerSec: Number(env.RATE_LIMIT_REFILL_PER_SEC) || 5,
  });

  return createGateway({
    store,
    rateLimiter,
    fetchImpl,
    cacheTtlSeconds: Number(env.ARXIV_CACHE_TTL_SECONDS) || 3600,
  });
}

module.exports = { createArxivHandler };
