// Serialize / read the auth cookie. httpOnly + SameSite=Lax keeps the JWT out of reach of
// JS (XSS-safe) and covers most CSRF. Secure is set in production (https) but omitted on
// local http, where browsers would otherwise drop a Secure cookie.
const COOKIE_NAME = 'token';
const DEFAULT_MAX_AGE = 604800; // 7 days

function serializeAuthCookie(token, { maxAgeSec = DEFAULT_MAX_AGE, secure = true } = {}) {
  const parts = [`${COOKIE_NAME}=${token}`, 'HttpOnly', 'SameSite=Lax', 'Path=/', `Max-Age=${maxAgeSec}`];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function clearAuthCookie({ secure = true } = {}) {
  const parts = [`${COOKIE_NAME}=`, 'HttpOnly', 'SameSite=Lax', 'Path=/', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function readToken(req) {
  const header = req.headers && req.headers.cookie;
  if (!header) return null;
  const match = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return match ? match.slice(COOKIE_NAME.length + 1) : null;
}

module.exports = { serializeAuthCookie, clearAuthCookie, readToken, COOKIE_NAME };
