const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createPostgresDb } = require('./postgres-db');

// Fake Neon tagged-template `sql`: records the query text + interpolated values.
function fakeSql(rows = []) {
  const calls = [];
  const fn = (strings, ...values) => { calls.push({ text: strings.join('?'), values }); return Promise.resolve(rows); };
  fn.calls = calls;
  return fn;
}

test('createUser issues an INSERT with the email and hash and returns the row', async () => {
  const sql = fakeSql([{ id: '1', email: 'a@example.com' }]);
  const db = createPostgresDb({ sql });

  const user = await db.createUser({ email: 'A@Example.com', passwordHash: 'h' });

  assert.equal(user.id, '1');
  assert.match(sql.calls[0].text, /INSERT INTO users/i);
  assert.deepEqual(sql.calls[0].values, ['a@example.com', 'h']);
});

test('findUserByEmail selects by lowercased email', async () => {
  const sql = fakeSql([{ id: '1', email: 'a@example.com' }]);
  const db = createPostgresDb({ sql });

  await db.findUserByEmail('A@Example.com');

  assert.match(sql.calls[0].text, /SELECT[\s\S]*FROM users WHERE email/i);
  assert.deepEqual(sql.calls[0].values, ['a@example.com']);
});

test('findUserById casts the id to bigint to match the schema', async () => {
  const sql = fakeSql([]);
  await createPostgresDb({ sql }).findUserById('1');
  assert.match(sql.calls[0].text, /WHERE id = \?::bigint/i);
});

test('findUserByEmail returns null when no row matches', async () => {
  const db = createPostgresDb({ sql: fakeSql([]) });
  assert.equal(await db.findUserByEmail('x@example.com'), null);
});

test('findUserByEmail aliases columns to camelCase to match the memory adapter', async () => {
  const sql = fakeSql([]);
  await createPostgresDb({ sql }).findUserByEmail('a@example.com');
  assert.match(sql.calls[0].text, /password_hash AS "passwordHash"/i);
});

test('listBookmarks selects the user\'s bookmarks newest-first and flattens paper + savedAt', async () => {
  const sql = fakeSql([{ paper: { id: 'p1', title: 'T' }, savedAt: '2020-01-01' }]);
  const list = await createPostgresDb({ sql }).listBookmarks('7');
  assert.deepEqual(list, [{ id: 'p1', title: 'T', savedAt: '2020-01-01' }]);
  assert.match(sql.calls[0].text, /SELECT[\s\S]*FROM bookmarks[\s\S]*WHERE user_id = \?::bigint[\s\S]*ORDER BY created_at DESC/i);
  assert.deepEqual(sql.calls[0].values, ['7']);
});

test('addBookmark inserts scoped to the user with ON CONFLICT DO NOTHING (idempotent)', async () => {
  const sql = fakeSql([]);
  const paper = { id: 'p1', title: 'T' };
  await createPostgresDb({ sql }).addBookmark('7', paper);
  assert.match(sql.calls[0].text, /INSERT INTO bookmarks[\s\S]*ON CONFLICT[\s\S]*DO NOTHING/i);
  assert.deepEqual(sql.calls[0].values, ['7', 'p1', JSON.stringify(paper)]);
});

test('removeBookmark deletes scoped to the user and the paper', async () => {
  const sql = fakeSql([]);
  await createPostgresDb({ sql }).removeBookmark('7', 'p1');
  assert.match(sql.calls[0].text, /DELETE FROM bookmarks WHERE user_id = \?::bigint AND paper_id = \?/i);
  assert.deepEqual(sql.calls[0].values, ['7', 'p1']);
});

test('createUser maps a unique-violation to EMAIL_EXISTS', async () => {
  const sql = () => Promise.reject(new Error('duplicate key value violates unique constraint "users_email_key"'));
  const db = createPostgresDb({ sql });
  await assert.rejects(
    () => db.createUser({ email: 'a@example.com', passwordHash: 'h' }),
    (e) => e.code === 'EMAIL_EXISTS'
  );
});
