const { test } = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword } = require('./password');

test('hashPassword produces a hash different from the plaintext', async () => {
  const hash = await hashPassword('s3cret-pass');
  assert.notEqual(hash, 's3cret-pass');
  assert.ok(hash.length > 20);
});

test('verifyPassword returns true for the correct password', async () => {
  const hash = await hashPassword('s3cret-pass');
  assert.equal(await verifyPassword('s3cret-pass', hash), true);
});

test('verifyPassword returns false for a wrong password', async () => {
  const hash = await hashPassword('s3cret-pass');
  assert.equal(await verifyPassword('wrong-pass', hash), false);
});
