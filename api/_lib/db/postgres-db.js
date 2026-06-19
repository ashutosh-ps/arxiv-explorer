// Postgres user store over a Neon tagged-template `sql` function (injected, so query
// construction is unit-testable without a database). Same interface as the memory adapter.
function createPostgresDb({ sql }) {
  return {
    kind: 'postgres',

    async createUser({ email, passwordHash }) {
      const normalized = email.toLowerCase();
      try {
        const rows = await sql`
          INSERT INTO users (email, password_hash) VALUES (${normalized}, ${passwordHash})
          RETURNING id, email, created_at`;
        return rows[0];
      } catch (err) {
        if (/duplicate|unique/i.test(err.message || '')) {
          const e = new Error('email already registered');
          e.code = 'EMAIL_EXISTS';
          throw e;
        }
        throw err;
      }
    },

    async findUserByEmail(email) {
      const rows = await sql`
        SELECT id, email, password_hash AS "passwordHash", created_at AS "createdAt"
        FROM users WHERE email = ${email.toLowerCase()}`;
      return rows[0] || null;
    },

    async findUserById(id) {
      // id arrives as a string (JWT subject); cast so it matches the bigint column.
      const rows = await sql`
        SELECT id, email, password_hash AS "passwordHash", created_at AS "createdAt"
        FROM users WHERE id = ${id}::bigint`;
      return rows[0] || null;
    },
  };
}

module.exports = { createPostgresDb };
