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

    async listBookmarks(userId) {
      const rows = await sql`
        SELECT paper, created_at AS "savedAt" FROM bookmarks
        WHERE user_id = ${userId}::bigint
        ORDER BY created_at DESC`;
      return rows.map((r) => ({ ...r.paper, savedAt: r.savedAt }));
    },

    async addBookmark(userId, paper) {
      await sql`
        INSERT INTO bookmarks (user_id, paper_id, paper)
        VALUES (${userId}::bigint, ${paper.id}, ${JSON.stringify(paper)}::jsonb)
        ON CONFLICT (user_id, paper_id) DO NOTHING`;
    },

    async removeBookmark(userId, paperId) {
      await sql`
        DELETE FROM bookmarks WHERE user_id = ${userId}::bigint AND paper_id = ${paperId}`;
    },
  };
}

module.exports = { createPostgresDb };
