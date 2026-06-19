const { createDb } = require('./db');
const { createBookmarksHandler } = require('./handlers/bookmarks');

// Assemble the bookmarks handler from environment config. Used by the Vercel function
// (api/bookmarks.js). The dev server builds its own (sharing one db with auth) in setupProxy.
function createBookmarksHandlerFromEnv(env = process.env) {
  return createBookmarksHandler({
    db: createDb({ env }),
    jwtSecret: env.JWT_SECRET || 'dev-insecure-secret-change-me',
  });
}

module.exports = { createBookmarksHandlerFromEnv };
