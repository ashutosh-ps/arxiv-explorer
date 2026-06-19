const { createStore } = require('./store');
const { createRateLimiter } = require('./rate-limit');
const { createCircuitBreaker } = require('./resilience');
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
//   ARXIV_RETRY_ATTEMPTS             -> upstream attempts          (default 3)
//   ARXIV_TIMEOUT_MS                 -> per-attempt timeout        (default 8000)
//   ARXIV_BREAKER_THRESHOLD          -> failures before opening    (default 5)
//   ARXIV_BREAKER_COOLDOWN_MS        -> open -> half-open delay     (default 30000)
function createArxivHandler({ env = process.env, fetchImpl } = {}) {
  const store = createStore({ env });
  const rateLimiter = createRateLimiter(store, {
    capacity: Number(env.RATE_LIMIT_CAPACITY) || 20,
    refillPerSec: Number(env.RATE_LIMIT_REFILL_PER_SEC) || 5,
  });
  const breaker = createCircuitBreaker({
    failureThreshold: Number(env.ARXIV_BREAKER_THRESHOLD) || 5,
    cooldownMs: Number(env.ARXIV_BREAKER_COOLDOWN_MS) || 30000,
  });

  return createGateway({
    store,
    rateLimiter,
    fetchImpl,
    cacheTtlSeconds: Number(env.ARXIV_CACHE_TTL_SECONDS) || 3600,
    breaker,
    retryOptions: { attempts: Number(env.ARXIV_RETRY_ATTEMPTS) || 3 },
    timeoutMs: Number(env.ARXIV_TIMEOUT_MS) || 8000,
  });
}

module.exports = { createArxivHandler };
