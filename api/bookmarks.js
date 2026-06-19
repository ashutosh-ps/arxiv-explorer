// Production entry point (Vercel) for /api/bookmarks (GET / POST / DELETE).
const { createBookmarksHandlerFromEnv } = require('./_lib/bookmarks-app');

const handler = createBookmarksHandlerFromEnv();

module.exports = (req, res) => handler(req, res);
