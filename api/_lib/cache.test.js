const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createMemoryStore } = require('./store/memory-store');
const { cached } = require('./cache');

test('on a miss it calls the producer, stores the result, and reports hit=false', async () => {
  const store = createMemoryStore();
  let calls = 0;
  const producer = async () => { calls++; return 'value'; };

  const result = await cached(store, 'key', 60, producer);

  assert.deepEqual(result, { value: 'value', hit: false });
  assert.equal(calls, 1);
  assert.equal(await store.get('key'), 'value');
});

test('on a hit it returns the cached value without calling the producer again', async () => {
  const store = createMemoryStore();
  let calls = 0;
  const producer = async () => { calls++; return calls; };

  await cached(store, 'key', 60, producer); // miss -> stores 1
  const second = await cached(store, 'key', 60, producer);

  assert.deepEqual(second, { value: 1, hit: true });
  assert.equal(calls, 1);
});

test('fails open: a store error falls through to the producer instead of throwing', async () => {
  const brokenStore = {
    async get() { throw new Error('redis down'); },
    async set() { throw new Error('redis down'); },
  };
  let calls = 0;
  const producer = async () => { calls++; return 'fresh'; };

  const result = await cached(brokenStore, 'key', 60, producer);

  assert.equal(result.value, 'fresh');
  assert.equal(result.hit, false);
  assert.equal(calls, 1);
});
