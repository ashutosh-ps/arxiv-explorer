const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createUpstashStore } = require('./upstash-store');

// Records the commands sent and returns a canned GET result.
function recordingFetch(getResult) {
  const calls = [];
  const impl = async (url, opts) => {
    const body = JSON.parse(opts.body);
    calls.push({ url, opts, body });
    const result = body[0] === 'GET' ? getResult : 'OK';
    return { ok: true, status: 200, json: async () => ({ result }) };
  };
  return { impl, calls };
}

test('get sends a GET command, authenticates, and JSON-parses the result', async () => {
  const { impl, calls } = recordingFetch(JSON.stringify({ a: 1 }));
  const store = createUpstashStore({ url: 'https://x', token: 't', fetchImpl: impl });

  const value = await store.get('k');

  assert.deepEqual(value, { a: 1 });
  assert.deepEqual(calls[0].body, ['GET', 'k']);
  assert.equal(calls[0].opts.headers.Authorization, 'Bearer t');
});

test('get returns undefined for a missing key (null result)', async () => {
  const { impl } = recordingFetch(null);
  const store = createUpstashStore({ url: 'https://x', token: 't', fetchImpl: impl });
  assert.equal(await store.get('missing'), undefined);
});

test('set sends a SET command with a JSON value and EX ttl', async () => {
  const { impl, calls } = recordingFetch(null);
  const store = createUpstashStore({ url: 'https://x', token: 't', fetchImpl: impl });

  await store.set('k', { a: 1 }, 60);

  assert.deepEqual(calls[0].body, ['SET', 'k', JSON.stringify({ a: 1 }), 'EX', '60']);
});

test('set omits EX when no ttl is given', async () => {
  const { impl, calls } = recordingFetch(null);
  const store = createUpstashStore({ url: 'https://x', token: 't', fetchImpl: impl });

  await store.set('k', { a: 1 });

  assert.deepEqual(calls[0].body, ['SET', 'k', JSON.stringify({ a: 1 })]);
});

test('throws on a non-ok response so callers fail open', async () => {
  const impl = async () => ({ ok: false, status: 500, json: async () => ({}) });
  const store = createUpstashStore({ url: 'https://x', token: 't', fetchImpl: impl });
  await assert.rejects(() => store.get('k'));
});
