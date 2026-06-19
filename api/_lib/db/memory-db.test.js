const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createMemoryDb } = require('./memory-db');

test('createUser stores and returns a user with an id and lowercased email', async () => {
  const db = createMemoryDb();
  const user = await db.createUser({ email: 'Alice@Example.com', passwordHash: 'h' });
  assert.ok(user.id);
  assert.equal(user.email, 'alice@example.com');
});

test('findUserByEmail finds a user case-insensitively', async () => {
  const db = createMemoryDb();
  await db.createUser({ email: 'bob@example.com', passwordHash: 'h' });
  assert.equal((await db.findUserByEmail('BOB@example.com')).email, 'bob@example.com');
});

test('createUser throws EMAIL_EXISTS on a duplicate email', async () => {
  const db = createMemoryDb();
  await db.createUser({ email: 'dup@example.com', passwordHash: 'h' });
  await assert.rejects(
    () => db.createUser({ email: 'dup@example.com', passwordHash: 'h' }),
    (e) => e.code === 'EMAIL_EXISTS'
  );
});

test('findUserById returns the user, or null when missing', async () => {
  const db = createMemoryDb();
  const user = await db.createUser({ email: 'c@example.com', passwordHash: 'h' });
  assert.equal((await db.findUserById(user.id)).email, 'c@example.com');
  assert.equal(await db.findUserById('nope'), null);
});

test('findUserByEmail returns null when not found', async () => {
  const db = createMemoryDb();
  assert.equal(await db.findUserByEmail('ghost@example.com'), null);
});

test('addBookmark then listBookmarks returns the paper with savedAt', async () => {
  const db = createMemoryDb();
  await db.addBookmark('u1', { id: 'p1', title: 'Paper One' });
  const list = await db.listBookmarks('u1');
  assert.equal(list.length, 1);
  assert.equal(list[0].id, 'p1');
  assert.equal(list[0].title, 'Paper One');
  assert.ok(list[0].savedAt);
});

test('addBookmark is idempotent for the same paper', async () => {
  const db = createMemoryDb();
  await db.addBookmark('u1', { id: 'p1', title: 'One' });
  await db.addBookmark('u1', { id: 'p1', title: 'One' });
  assert.equal((await db.listBookmarks('u1')).length, 1);
});

test('removeBookmark removes the paper', async () => {
  const db = createMemoryDb();
  await db.addBookmark('u1', { id: 'p1' });
  await db.removeBookmark('u1', 'p1');
  assert.equal((await db.listBookmarks('u1')).length, 0);
});

test('bookmarks are isolated per user', async () => {
  const db = createMemoryDb();
  await db.addBookmark('u1', { id: 'p1' });
  assert.equal((await db.listBookmarks('u2')).length, 0);
});

test('listBookmarks returns newest first', async () => {
  const db = createMemoryDb();
  await db.addBookmark('u1', { id: 'p1' });
  await db.addBookmark('u1', { id: 'p2' });
  assert.deepEqual((await db.listBookmarks('u1')).map((b) => b.id), ['p2', 'p1']);
});
