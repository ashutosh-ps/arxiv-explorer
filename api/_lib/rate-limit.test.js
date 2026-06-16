const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createMemoryStore } = require('./store/memory-store');
const { createRateLimiter } = require('./rate-limit');

// Shared clock so the store's TTL and the limiter's refill advance together.
function setup({ capacity, refillPerSec }) {
  let nowMs = 0;
  const now = () => nowMs;
  const store = createMemoryStore({ now });
  const limiter = createRateLimiter(store, { capacity, refillPerSec, now });
  return { limiter, advance: (ms) => { nowMs += ms; } };
}

test('allows a burst up to capacity, then denies the next request', async () => {
  const { limiter } = setup({ capacity: 3, refillPerSec: 1 });

  assert.equal((await limiter.check('ip')).allowed, true);
  assert.equal((await limiter.check('ip')).allowed, true);
  assert.equal((await limiter.check('ip')).allowed, true);

  const denied = await limiter.check('ip');
  assert.equal(denied.allowed, false);
  assert.equal(denied.remaining, 0);
});

test('refills tokens over time', async () => {
  const { limiter, advance } = setup({ capacity: 1, refillPerSec: 1 });

  assert.equal((await limiter.check('ip')).allowed, true);  // consumes the only token
  assert.equal((await limiter.check('ip')).allowed, false); // empty
  advance(1000);                                            // +1 token after 1s
  assert.equal((await limiter.check('ip')).allowed, true);
});

test('reports a positive retryAfter when denied', async () => {
  const { limiter } = setup({ capacity: 1, refillPerSec: 1 });

  await limiter.check('ip');
  const denied = await limiter.check('ip');

  assert.equal(denied.allowed, false);
  assert.equal(denied.retryAfter, 1);
  assert.equal(denied.limit, 1);
});

test('keeps separate buckets per key', async () => {
  const { limiter } = setup({ capacity: 1, refillPerSec: 1 });

  assert.equal((await limiter.check('a')).allowed, true);
  assert.equal((await limiter.check('b')).allowed, true); // independent of 'a'
  assert.equal((await limiter.check('a')).allowed, false);
});

test('fails open when the store errors', async () => {
  const brokenStore = {
    async get() { throw new Error('redis down'); },
    async set() { throw new Error('redis down'); },
  };
  const limiter = createRateLimiter(brokenStore, { capacity: 1, refillPerSec: 1, now: () => 0 });

  const result = await limiter.check('ip');
  assert.equal(result.allowed, true);
});
