const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createMemoryStore } = require('./memory-store');

test('set then get returns the stored value', async () => {
  const store = createMemoryStore();
  await store.set('k', 'v');
  assert.equal(await store.get('k'), 'v');
});

test('get returns undefined for an unknown key', async () => {
  const store = createMemoryStore();
  assert.equal(await store.get('missing'), undefined);
});

test('value is still present just before its ttl expires', async () => {
  let nowMs = 1000;
  const store = createMemoryStore({ now: () => nowMs });
  await store.set('k', 'v', 10); // expires at 11000ms
  nowMs = 10999;
  assert.equal(await store.get('k'), 'v');
});

test('value is gone once its ttl has elapsed', async () => {
  let nowMs = 1000;
  const store = createMemoryStore({ now: () => nowMs });
  await store.set('k', 'v', 10);
  nowMs = 11000;
  assert.equal(await store.get('k'), undefined);
});

test('value without a ttl never expires', async () => {
  let nowMs = 0;
  const store = createMemoryStore({ now: () => nowMs });
  await store.set('k', 'v');
  nowMs = Number.MAX_SAFE_INTEGER;
  assert.equal(await store.get('k'), 'v');
});

test('round-trips object values', async () => {
  const store = createMemoryStore();
  await store.set('k', { a: 1, b: [2, 3] }, 60);
  assert.deepEqual(await store.get('k'), { a: 1, b: [2, 3] });
});
