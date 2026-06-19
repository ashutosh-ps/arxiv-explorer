const { createDb } = require('./db');
const { createAuthHandlers } = require('./handlers/auth');

// Assemble the auth handlers from environment configuration. Both the Vercel functions
// (api/auth/*.js) and the dev server (src/setupProxy.js) build them this way.
//   JWT_SECRET    -> HMAC secret for signing tokens (set in production!)
//   DATABASE_URL  -> use Postgres instead of the in-memory store
//   NODE_ENV      -> 'production' marks the cookie Secure (https only)
function createAuthHandlersFromEnv(env = process.env) {
  return createAuthHandlers({
    db: createDb({ env }),
    jwtSecret: env.JWT_SECRET || 'dev-insecure-secret-change-me',
    secure: env.NODE_ENV === 'production',
  });
}

module.exports = { createAuthHandlersFromEnv };
