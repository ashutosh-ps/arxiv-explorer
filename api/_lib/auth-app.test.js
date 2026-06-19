const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createAuthHandlersFromEnv } = require('./auth-app');

function makeRes() {
  return {
    statusCode: 200, headers: {}, body: undefined,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; return this; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

test('createAuthHandlersFromEnv wires a working signup on the in-memory db', async () => {
  const handlers = createAuthHandlersFromEnv({});
  const res = makeRes();
  await handlers.signup({ body: { email: 'a@example.com', password: 'password123' }, headers: {} }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.user.email, 'a@example.com');
});
