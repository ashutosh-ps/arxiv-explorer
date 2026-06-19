const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getUserId } = require('./require-auth');
const { sign } = require('./jwt');

const SECRET = 'test-secret';
const reqWithToken = (token) => ({ headers: { cookie: `token=${token}` } });

test('getUserId returns the subject from a valid auth cookie', () => {
  assert.equal(getUserId(reqWithToken(sign({ sub: 'user-42' }, SECRET)), SECRET), 'user-42');
});

test('getUserId returns null when there is no cookie', () => {
  assert.equal(getUserId({ headers: {} }, SECRET), null);
});

test('getUserId returns null for a token signed with a different secret', () => {
  assert.equal(getUserId(reqWithToken(sign({ sub: 'user-42' }, 'other-secret')), SECRET), null);
});
