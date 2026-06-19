// Local dev API router. The CRA dev server runs this in Node, so it serves the exact same
// handlers as the production Vercel functions — keeping dev and prod behaviour identical.
const { createArxivHandler } = require('../api/_lib/create-handler');
const { createAuthHandlersFromEnv } = require('../api/_lib/auth-app');

// The dev server doesn't parse request bodies (Vercel does), so populate req.body to match.
function jsonBody(req, res, next) {
  let raw = '';
  req.on('data', (chunk) => { raw += chunk; });
  req.on('end', () => {
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
    next();
  });
}

module.exports = function (app) {
  const arxiv = createArxivHandler();
  app.use('/api/arxiv', (req, res) => arxiv(req, res));

  // One shared auth handler set (one in-memory db) for the whole dev session.
  const auth = createAuthHandlersFromEnv();
  app.post('/api/auth/signup', jsonBody, (req, res) => auth.signup(req, res));
  app.post('/api/auth/login', jsonBody, (req, res) => auth.login(req, res));
  app.post('/api/auth/logout', (req, res) => auth.logout(req, res));
  app.get('/api/auth/me', (req, res) => auth.me(req, res));
};
