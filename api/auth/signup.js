// Production entry point (Vercel) for POST /api/auth/signup.
const { createAuthHandlersFromEnv } = require('../_lib/auth-app');

const handlers = createAuthHandlersFromEnv();

module.exports = (req, res) => handlers.signup(req, res);
