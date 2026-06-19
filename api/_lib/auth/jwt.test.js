const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sign, verify } = require('./jwt');

const SECRET = 'test-secret';

test('verify returns the payload for a token signed with the same secret', () => {
  const token = sign({ sub: 'user-1' }, SECRET);
  assert.equal(verify(token, SECRET).sub, 'user-1');
});

test('verify rejects a token signed with a different secret', () => {
  const token = sign({ sub: 'user-1' }, SECRET);
  assert.throws(() => verify(token, 'other-secret'));
});

test('verify rejects a tampered payload', () => {
  const token = sign({ sub: 'user-1' }, SECRET);
  const [h, , s] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ sub: 'admin', exp: 9999999999 })).toString('base64url');
  assert.throws(() => verify(`${h}.${forged}.${s}`, SECRET));
});

test('verify rejects an expired token', () => {
  let nowMs = 1_000_000_000_000;
  const token = sign({ sub: 'user-1' }, SECRET, { expiresInSec: 60, now: () => nowMs });
  nowMs += 61_000;
  assert.throws(() => verify(token, SECRET, { now: () => nowMs }), /expired/);
});

test('verify rejects a malformed token', () => {
  assert.throws(() => verify('garbage', SECRET));
});
