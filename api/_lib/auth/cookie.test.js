const { test } = require('node:test');
const assert = require('node:assert/strict');
const { serializeAuthCookie, clearAuthCookie, readToken } = require('./cookie');

test('serializeAuthCookie sets HttpOnly, SameSite, Secure, and the token', () => {
  const c = serializeAuthCookie('abc.def.ghi', { secure: true });
  assert.match(c, /^token=abc\.def\.ghi/);
  assert.match(c, /HttpOnly/);
  assert.match(c, /SameSite=Lax/);
  assert.match(c, /Secure/);
});

test('serializeAuthCookie omits Secure when secure is false (local http)', () => {
  assert.doesNotMatch(serializeAuthCookie('t', { secure: false }), /Secure/);
});

test('clearAuthCookie expires the cookie', () => {
  assert.match(clearAuthCookie({ secure: false }), /Max-Age=0/);
});

test('readToken extracts the token from the cookie header', () => {
  const req = { headers: { cookie: 'foo=bar; token=abc.def.ghi; baz=qux' } };
  assert.equal(readToken(req), 'abc.def.ghi');
});

test('readToken returns null when there is no cookie', () => {
  assert.equal(readToken({ headers: {} }), null);
});
