const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createMemoryStore } = require('./store/memory-store');
const { createRateLimiter } = require('./rate-limit');
const { createCircuitBreaker } = require('./resilience');
const { createGateway } = require('./gateway');

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    status(code) { this.statusCode = code; return this; },
    send(b) { this.body = b; return this; },
  };
}

function makeReq(query, ip = '1.1.1.1') {
  return { query, headers: { 'x-forwarded-for': ip } };
}

// fetch stub that counts calls and returns canned arXiv XML (or an error status).
function countingFetch(opts = {}) {
  const state = { calls: 0 };
  const impl = async () => {
    state.calls++;
    return { ok: opts.ok !== false, status: opts.status || 200, text: async () => opts.body || '<feed><entry/></feed>' };
  };
  return { impl, state };
}

function buildGateway({ fetch, capacity = 100, breaker, retryOptions, timeoutMs, logger }) {
  const store = createMemoryStore();
  const rateLimiter = createRateLimiter(store, { capacity, refillPerSec: capacity, now: () => 0 });
  return createGateway({ store, rateLimiter, fetchImpl: fetch, cacheTtlSeconds: 3600, breaker, retryOptions, timeoutMs, logger });
}

test('first request misses the cache and fetches; second hits and does not fetch', async () => {
  const { impl, state } = countingFetch();
  const handle = buildGateway({ fetch: impl });
  const q = { search_query: 'all:test', max_results: '2' };

  const res1 = makeRes();
  await handle(makeReq(q), res1);
  assert.equal(res1.statusCode, 200);
  assert.equal(res1.headers['x-cache'], 'MISS');
  assert.equal(state.calls, 1);

  const res2 = makeRes();
  await handle(makeReq(q), res2);
  assert.equal(res2.headers['x-cache'], 'HIT');
  assert.equal(state.calls, 1); // served from cache
});

test('cache key ignores param order', async () => {
  const { impl, state } = countingFetch();
  const handle = buildGateway({ fetch: impl });

  await handle(makeReq({ search_query: 'all:x', max_results: '2' }), makeRes());
  await handle(makeReq({ max_results: '2', search_query: 'all:x' }), makeRes());

  assert.equal(state.calls, 1); // same normalized key
});

test('different queries are cached independently', async () => {
  const { impl, state } = countingFetch();
  const handle = buildGateway({ fetch: impl });

  await handle(makeReq({ search_query: 'all:a' }), makeRes());
  await handle(makeReq({ search_query: 'all:b' }), makeRes());

  assert.equal(state.calls, 2);
});

test('returns 429 with Retry-After when the client exceeds its budget', async () => {
  const { impl } = countingFetch();
  const handle = buildGateway({ fetch: impl, capacity: 1 });

  const ok = makeRes();
  await handle(makeReq({ search_query: 'all:x' }), ok);
  assert.equal(ok.statusCode, 200);

  const limited = makeRes();
  await handle(makeReq({ search_query: 'all:x' }), limited);
  assert.equal(limited.statusCode, 429);
  assert.ok(limited.headers['retry-after'] >= 1);
});

test('rate limit is per-client', async () => {
  const { impl } = countingFetch();
  const handle = buildGateway({ fetch: impl, capacity: 1 });

  await handle(makeReq({ search_query: 'all:x' }, '1.1.1.1'), makeRes());
  const other = makeRes();
  await handle(makeReq({ search_query: 'all:x' }, '2.2.2.2'), other);
  assert.equal(other.statusCode, 200); // different IP, own bucket
});

test('upstream failure returns 502 and is not cached', async () => {
  const { impl, state } = countingFetch({ ok: false, status: 500 });
  const handle = buildGateway({ fetch: impl });

  const res1 = makeRes();
  await handle(makeReq({ search_query: 'all:x' }), res1);
  assert.equal(res1.statusCode, 502);

  const res2 = makeRes();
  await handle(makeReq({ search_query: 'all:x' }), res2);
  assert.equal(res2.statusCode, 502);
  assert.equal(state.calls, 2); // failure was not cached; retried
});

test('rides out a flaky upstream via retry and returns 200', async () => {
  let calls = 0;
  const impl = async () => {
    calls++;
    if (calls < 3) return { ok: false, status: 500, text: async () => '' };
    return { ok: true, status: 200, text: async () => '<feed><entry/></feed>' };
  };
  const handle = buildGateway({ fetch: impl, retryOptions: { attempts: 3, jitter: false, sleep: async () => {} } });

  const res = makeRes();
  await handle(makeReq({ search_query: 'all:x' }), res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['x-cache'], 'MISS');
  assert.equal(calls, 3); // failed twice, succeeded on the third
});

test('logs each request with its cache outcome and status', async () => {
  const { impl } = countingFetch();
  const events = [];
  const handle = buildGateway({ fetch: impl, logger: { event: (e) => events.push(e) } });

  await handle(makeReq({ search_query: 'all:x' }), makeRes());

  assert.equal(events.length, 1);
  assert.equal(events[0].cache, 'MISS');
  assert.equal(events[0].status, 200);
});

test('opens the circuit after repeated upstream failures and stops calling', async () => {
  let calls = 0;
  const impl = async () => { calls++; return { ok: false, status: 500, text: async () => '' }; };
  const breaker = createCircuitBreaker({ failureThreshold: 2, cooldownMs: 60000, now: () => 0 });
  const handle = buildGateway({ fetch: impl, breaker, retryOptions: { attempts: 1 } });
  const q = { search_query: 'all:x' };

  for (let i = 0; i < 3; i++) {
    const res = makeRes();
    await handle(makeReq(q), res);
    assert.equal(res.statusCode, 502);
  }

  assert.equal(calls, 2); // 3rd request short-circuited by the open breaker
});
