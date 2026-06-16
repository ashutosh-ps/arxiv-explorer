const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createStore } = require('./index');

test('uses the in-memory store when no Upstash credentials are present', () => {
  assert.equal(createStore({ env: {} }).kind, 'memory');
});

test('uses the Upstash store when both credentials are present', () => {
  const store = createStore({
    env: { UPSTASH_REDIS_REST_URL: 'https://x', UPSTASH_REDIS_REST_TOKEN: 't' },
  });
  assert.equal(store.kind, 'upstash');
});

test('falls back to memory when only one credential is set', () => {
  assert.equal(createStore({ env: { UPSTASH_REDIS_REST_URL: 'https://x' } }).kind, 'memory');
});
