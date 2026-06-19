// In-memory user store: the default DB adapter for dev and tests (no Postgres needed).
// Same interface as the Postgres adapter so the auth handlers don't know which is active.
// (Note: on serverless this is per-instance; production should set DATABASE_URL.)
function createMemoryDb() {
  const byId = new Map();
  const byEmail = new Map();
  const bookmarksByUser = new Map(); // userId -> [{ paper, savedAt }], newest first
  let seq = 0;

  return {
    kind: 'memory',

    async createUser({ email, passwordHash }) {
      const normalized = email.toLowerCase();
      if (byEmail.has(normalized)) {
        const err = new Error('email already registered');
        err.code = 'EMAIL_EXISTS';
        throw err;
      }
      const user = {
        id: String(++seq),
        email: normalized,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      byId.set(user.id, user);
      byEmail.set(normalized, user);
      return user;
    },

    async findUserByEmail(email) {
      return byEmail.get(email.toLowerCase()) || null;
    },

    async findUserById(id) {
      return byId.get(String(id)) || null;
    },

    async listBookmarks(userId) {
      const list = bookmarksByUser.get(String(userId)) || [];
      return list.map((b) => ({ ...b.paper, savedAt: b.savedAt }));
    },

    async addBookmark(userId, paper) {
      const key = String(userId);
      const list = bookmarksByUser.get(key) || [];
      const existing = list.find((b) => b.paper.id === paper.id);
      if (existing) return existing; // idempotent
      const record = { paper, savedAt: new Date().toISOString() };
      list.unshift(record);
      bookmarksByUser.set(key, list);
      return record;
    },

    async removeBookmark(userId, paperId) {
      const key = String(userId);
      const list = bookmarksByUser.get(key) || [];
      bookmarksByUser.set(key, list.filter((b) => b.paper.id !== paperId));
    },
  };
}

module.exports = { createMemoryDb };
