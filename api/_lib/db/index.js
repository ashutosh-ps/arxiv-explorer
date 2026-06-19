const { createMemoryDb } = require('./memory-db');

// Select the DB adapter at runtime. With DATABASE_URL set we use Neon Postgres; otherwise the
// in-memory store. The Neon driver is lazy-required so the memory path needs no native deps.
function createDb({ env = process.env } = {}) {
  const url = env.DATABASE_URL;
  if (url) {
    const { neon } = require('@neondatabase/serverless');
    const { createPostgresDb } = require('./postgres-db');
    return createPostgresDb({ sql: neon(url) });
  }
  return createMemoryDb();
}

module.exports = { createDb };
