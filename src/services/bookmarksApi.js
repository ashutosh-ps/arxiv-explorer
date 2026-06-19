// Client for the per-user bookmarks API. `credentials: 'include'` sends the auth cookie.
const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function request(path, options = {}) {
  const res = await fetch(path, { credentials: 'include', ...options });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const listBookmarks = () => request('/api/bookmarks');

export const addBookmark = (paper) =>
  request('/api/bookmarks', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ paper }) });

export const removeBookmark = (paperId) =>
  request(`/api/bookmarks?paperId=${encodeURIComponent(paperId)}`, { method: 'DELETE' });
