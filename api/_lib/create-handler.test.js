const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createArxivHandler } = require('./create-handler');

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

function makeReq(query, ip = '9.9.9.9') {
  return { query, headers: { 'x-forwarded-for': ip } };
}

function countingFetch() {
  const state = { calls: 0 };
  const impl = async () => {
    state.calls++;
    return { ok: true, status: 200, text: async () => '<feed><entry/></feed>' };
  };
  return { impl, state };
}

test('assembles a working cache-aside handler backed by the in-memory store', async () => {
  const { impl, state } = countingFetch();
  const handle = createArxivHandler({ env: {}, fetchImpl: impl });
  const q = { search_query: 'all:test' };

  const r1 = makeRes();
  await handle(makeReq(q), r1);
  assert.equal(r1.headers['x-cache'], 'MISS');

  const r2 = makeRes();
  await handle(makeReq(q), r2);
  assert.equal(r2.headers['x-cache'], 'HIT');
  assert.equal(state.calls, 1);
});

test('applies rate-limit configuration from env', async () => {
  const { impl } = countingFetch();
  const handle = createArxivHandler({
    env: { RATE_LIMIT_CAPACITY: '1', RATE_LIMIT_REFILL_PER_SEC: '1' },
    fetchImpl: impl,
  });
  const q = { search_query: 'all:x' };

  const ok = makeRes();
  await handle(makeReq(q), ok);
  assert.equal(ok.statusCode, 200);

  const limited = makeRes();
  await handle(makeReq(q), limited);
  assert.equal(limited.statusCode, 429);
});
