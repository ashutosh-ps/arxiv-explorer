const { getUserId } = require('../auth/require-auth');

// Per-user bookmarks API: GET (list), POST {paper} (add), DELETE ?paperId (remove).
// Every operation is scoped to the user id derived from the auth cookie — the handler never
// trusts a client-supplied user id, so one user can't read or mutate another's bookmarks.
function createBookmarksHandler({ db, jwtSecret }) {
  return async function handle(req, res) {
    const userId = getUserId(req, jwtSecret);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ bookmarks: await db.listBookmarks(userId) });
    }

    if (req.method === 'POST') {
      const paper = req.body && req.body.paper;
      if (!paper || !paper.id) {
        return res.status(400).json({ error: 'A paper with an id is required.' });
      }
      await db.addBookmark(userId, paper);
      return res.status(201).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const paperId = req.query && req.query.paperId;
      if (!paperId) {
        return res.status(400).json({ error: 'paperId is required.' });
      }
      await db.removeBookmark(userId, paperId);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  };
}

module.exports = { createBookmarksHandler };
