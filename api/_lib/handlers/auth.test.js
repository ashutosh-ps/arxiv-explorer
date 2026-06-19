const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createMemoryDb } = require('../db/memory-db');
const { createAuthHandlers } = require('./auth');

const SECRET = 'test-secret';

function makeRes() {
  return {
    statusCode: 200, headers: {}, body: undefined,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; return this; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}
const makeReq = (body = {}, headers = {}) => ({ body, headers });
const build = () => createAuthHandlers({ db: createMemoryDb(), jwtSecret: SECRET, secure: false });
const tokenFromRes = (res) => res.headers['set-cookie'].split(';')[0].slice('token='.length);

test('signup creates a user, returns 201, sets the cookie, and never leaks the hash', async () => {
  const res = makeRes();
  await build().signup(makeReq({ email: 'a@example.com', password: 'password123' }), res);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.user.email, 'a@example.com');
  assert.equal(res.body.user.passwordHash, undefined);
  assert.match(res.headers['set-cookie'], /token=.+HttpOnly/);
});

test('signup rejects a short password with 400', async () => {
  const res = makeRes();
  await build().signup(makeReq({ email: 'a@example.com', password: 'short' }), res);
  assert.equal(res.statusCode, 400);
});

test('signup rejects an invalid email with 400', async () => {
  const res = makeRes();
  await build().signup(makeReq({ email: 'notanemail', password: 'password123' }), res);
  assert.equal(res.statusCode, 400);
});

test('signup rejects a duplicate email with 409', async () => {
  const handlers = build();
  await handlers.signup(makeReq({ email: 'dup@example.com', password: 'password123' }), makeRes());
  const res = makeRes();
  await handlers.signup(makeReq({ email: 'dup@example.com', password: 'password123' }), res);
  assert.equal(res.statusCode, 409);
});

test('login succeeds with correct credentials', async () => {
  const handlers = build();
  await handlers.signup(makeReq({ email: 'a@example.com', password: 'password123' }), makeRes());
  const res = makeRes();
  await handlers.login(makeReq({ email: 'a@example.com', password: 'password123' }), res);
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['set-cookie'], /token=/);
});

test('login rejects a wrong password with 401', async () => {
  const handlers = build();
  await handlers.signup(makeReq({ email: 'a@example.com', password: 'password123' }), makeRes());
  const res = makeRes();
  await handlers.login(makeReq({ email: 'a@example.com', password: 'wrong-password' }), res);
  assert.equal(res.statusCode, 401);
});

test('login rejects an unknown email with 401', async () => {
  const res = makeRes();
  await build().login(makeReq({ email: 'ghost@example.com', password: 'password123' }), res);
  assert.equal(res.statusCode, 401);
});

test('me returns the current user for a valid cookie', async () => {
  const handlers = build();
  const signupRes = makeRes();
  await handlers.signup(makeReq({ email: 'a@example.com', password: 'password123' }), signupRes);
  const res = makeRes();
  await handlers.me(makeReq({}, { cookie: `token=${tokenFromRes(signupRes)}` }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.user.email, 'a@example.com');
});

test('me returns 401 without a cookie', async () => {
  const res = makeRes();
  await build().me(makeReq({}, {}), res);
  assert.equal(res.statusCode, 401);
});

test('logout clears the auth cookie', async () => {
  const res = makeRes();
  await build().logout(makeReq(), res);
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['set-cookie'], /Max-Age=0/);
});
