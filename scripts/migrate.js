// Applies api/_lib/db/schema.sql to the database in DATABASE_URL.
// Usage: DATABASE_URL=postgresql://... npm run db:migrate
const fs = require('node:fs');
const path = require('node:path');
const { neon } = require('@neondatabase/serverless');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set. Export it (your Neon connection string) and retry.');
    process.exit(1);
  }
  const sql = neon(url);
  const schema = fs.readFileSync(path.join(__dirname, '..', 'api', '_lib', 'db', 'schema.sql'), 'utf8');
  await sql.query(schema);
  console.log('Migration applied: users table is ready.');
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
