const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHealthHandler } = require('./health');

function makeRes() {
  return {
    statusCode: 200, body: undefined,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

test('health reports ok and the active store/db adapters', async () => {
  const handler = createHealthHandler({ store: { kind: 'memory' }, db: { kind: 'postgres' }, now: () => 0 });
  const res = makeRes();

  await handler({}, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.store, 'memory');
  assert.equal(res.body.db, 'postgres');
  assert.equal(res.body.time, '1970-01-01T00:00:00.000Z');
});
