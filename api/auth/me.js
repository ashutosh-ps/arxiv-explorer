// Production entry point (Vercel) for GET /api/auth/me.
const { createAuthHandlersFromEnv } = require('../_lib/auth-app');

const handlers = createAuthHandlersFromEnv();

module.exports = (req, res) => handlers.me(req, res);
