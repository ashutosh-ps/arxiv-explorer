const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createMemoryDb } = require('../db/memory-db');
const { createBookmarksHandler } = require('./bookmarks');
const { sign } = require('../auth/jwt');

const SECRET = 'test-secret';

function makeRes() {
  return {
    statusCode: 200, body: undefined,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

function req({ method = 'GET', body = {}, query = {}, userId }) {
  const headers = userId ? { cookie: `token=${sign({ sub: userId }, SECRET)}` } : {};
  return { method, body, query, headers };
}

const build = (db) => createBookmarksHandler({ db, jwtSecret: SECRET });

test('returns 401 when not authenticated', async () => {
  const res = makeRes();
  await build(createMemoryDb())(req({ method: 'GET' }), res);
  assert.equal(res.statusCode, 401);
});

test('POST adds a bookmark for the authenticated user', async () => {
  const db = createMemoryDb();
  const res = makeRes();
  await build(db)(req({ method: 'POST', body: { paper: { id: 'p1', title: 'T' } }, userId: '1' }), res);
  assert.equal(res.statusCode, 201);
  assert.equal((await db.listBookmarks('1')).length, 1);
});

test('GET lists only the caller\'s bookmarks', async () => {
  const db = createMemoryDb();
  await db.addBookmark('1', { id: 'p1' });
  await db.addBookmark('2', { id: 'p2' });
  const res = makeRes();
  await build(db)(req({ method: 'GET', userId: '1' }), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.bookmarks.map((b) => b.id), ['p1']);
});

test('DELETE removes the caller\'s bookmark', async () => {
  const db = createMemoryDb();
  await db.addBookmark('1', { id: 'p1' });
  const res = makeRes();
  await build(db)(req({ method: 'DELETE', query: { paperId: 'p1' }, userId: '1' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal((await db.listBookmarks('1')).length, 0);
});

test('a user cannot delete another user\'s bookmark', async () => {
  const db = createMemoryDb();
  await db.addBookmark('1', { id: 'p1' });
  const res = makeRes();
  await build(db)(req({ method: 'DELETE', query: { paperId: 'p1' }, userId: '2' }), res);
  assert.equal((await db.listBookmarks('1')).length, 1); // user 1's bookmark untouched
});

test('POST without a paper returns 400', async () => {
  const res = makeRes();
  await build(createMemoryDb())(req({ method: 'POST', body: {}, userId: '1' }), res);
  assert.equal(res.statusCode, 400);
});

test('an unsupported method returns 405', async () => {
  const res = makeRes();
  await build(createMemoryDb())(req({ method: 'PUT', userId: '1' }), res);
  assert.equal(res.statusCode, 405);
});
