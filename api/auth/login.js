// Production entry point (Vercel) for POST /api/auth/login.
const { createAuthHandlersFromEnv } = require('../_lib/auth-app');

const handlers = createAuthHandlersFromEnv();

module.exports = (req, res) => handlers.login(req, res);
