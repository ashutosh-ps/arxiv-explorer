// Token-bucket rate limiter over the Store interface.
//
// Each key owns a bucket of `capacity` tokens that refills at `refillPerSec`. A request
// spends one token; when the bucket is empty the request is denied with a `retryAfter`.
// This gives a burst allowance (capacity) plus a sustained rate (refill).
//
// Known limitation: the read-modify-write is not atomic across concurrent serverless
// instances (a TOCTOU race). Acceptable for this scope; production hardening would use a
// Redis Lua script or @upstash/ratelimit. See docs/adr/0001.
function createRateLimiter(store, { capacity, refillPerSec, now = () => Date.now(), keyPrefix = 'rl:' }) {
  // Seconds to refill an empty bucket — used as the TTL so idle keys expire.
  const fullRefillSeconds = Math.ceil(capacity / refillPerSec);

  return {
    async check(key) {
      const storeKey = keyPrefix + key;

      let state;
      try {
        state = (await store.get(storeKey)) || { tokens: capacity, ts: now() };
      } catch {
        // Fail open: never block traffic because the limiter's store is down.
        return { allowed: true, remaining: capacity, retryAfter: 0, limit: capacity };
      }

      const elapsedSec = (now() - state.ts) / 1000;
      let tokens = Math.min(capacity, state.tokens + elapsedSec * refillPerSec);

      const allowed = tokens >= 1;
      if (allowed) tokens -= 1;

      try {
        await store.set(storeKey, { tokens, ts: now() }, fullRefillSeconds);
      } catch {
        // Best-effort persistence; ignore.
      }

      return {
        allowed,
        remaining: Math.floor(tokens),
        retryAfter: allowed ? 0 : Math.ceil((1 - tokens) / refillPerSec),
        limit: capacity,
      };
    },
  };
}

module.exports = { createRateLimiter };
