const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createBookmarksHandlerFromEnv } = require('./bookmarks-app');

function makeRes() {
  return {
    statusCode: 200, body: undefined,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

test('createBookmarksHandlerFromEnv returns an auth-guarded handler', async () => {
  const handler = createBookmarksHandlerFromEnv({});
  const res = makeRes();
  await handler({ method: 'GET', headers: {}, query: {}, body: {} }, res);
  assert.equal(res.statusCode, 401);
});
