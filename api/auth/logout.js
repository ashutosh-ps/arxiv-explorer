// Production entry point (Vercel) for POST /api/auth/logout.
const { createAuthHandlersFromEnv } = require('../_lib/auth-app');

const handlers = createAuthHandlersFromEnv();

module.exports = (req, res) => handlers.logout(req, res);
