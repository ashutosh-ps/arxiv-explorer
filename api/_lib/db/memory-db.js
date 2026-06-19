// In-memory user store: the default DB adapter for dev and tests (no Postgres needed).
// Same interface as the Postgres adapter so the auth handlers don't know which is active.
// (Note: on serverless this is per-instance; production should set DATABASE_URL.)
function createMemoryDb() {
  const byId = new Map();
  const byEmail = new Map();
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
  };
}

module.exports = { createMemoryDb };
