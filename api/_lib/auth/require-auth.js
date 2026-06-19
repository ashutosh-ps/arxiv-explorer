const { readToken } = require('./cookie');
const { verify } = require('./jwt');

// Resolve the authenticated user id from the request's auth cookie, or null if absent,
// invalid, or expired. Never throws — callers treat null as "not authenticated".
function getUserId(req, secret) {
  const token = readToken(req);
  if (!token) return null;
  try {
    return verify(token, secret).sub || null;
  } catch {
    return null;
  }
}

module.exports = { getUserId };
