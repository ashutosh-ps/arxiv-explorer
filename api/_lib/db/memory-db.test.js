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
