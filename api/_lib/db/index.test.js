const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDb } = require('./index');

test('uses the in-memory db when DATABASE_URL is not set', () => {
  assert.equal(createDb({ env: {} }).kind, 'memory');
});

test('uses the postgres db when DATABASE_URL is set', () => {
  const db = createDb({ env: { DATABASE_URL: 'postgresql://user:pass@host.neon.tech/db' } });
  assert.equal(db.kind, 'postgres');
});
