// Thin client for the auth API. `credentials: 'include'` makes the browser send/receive the
// httpOnly auth cookie (same-origin on Vercel and in dev).
const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function request(path, options = {}) {
  const res = await fetch(path, { credentials: 'include', ...options });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* no/!json body */
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const signup = (email, password) =>
  request('/api/auth/signup', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ email, password }) });

export const login = (email, password) =>
  request('/api/auth/login', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ email, password }) });

export const logout = () => request('/api/auth/logout', { method: 'POST' });

export const me = () => request('/api/auth/me');
