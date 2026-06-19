import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as defaultApi from '../services/bookmarksApi';
import { useAuth } from './AuthContext';

const BookmarksContext = createContext(null);

// Holds the authenticated user's bookmarks in memory: loads once on login (cleared on logout),
// exposes a sync isBookmarked() over an id set, and applies add/remove optimistically (rolling
// back if the API call fails). `api` is injectable for testing.
export const BookmarksProvider = ({ children, api = defaultApi }) => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      setIds(new Set());
      return undefined;
    }
    let active = true;
    api.listBookmarks()
      .then((data) => {
        if (!active) return;
        setBookmarks(data.bookmarks);
        setIds(new Set(data.bookmarks.map((b) => b.id)));
      })
      .catch(() => { /* leave empty on failure */ });
    return () => { active = false; };
  }, [user, api]);

  const isBookmarked = useCallback((id) => ids.has(id), [ids]);

  const addBookmark = useCallback(async (paper) => {
    setIds((prev) => new Set(prev).add(paper.id));
    setBookmarks((prev) => (prev.some((b) => b.id === paper.id) ? prev : [{ ...paper }, ...prev]));
    try {
      await api.addBookmark(paper);
    } catch (err) {
      setIds((prev) => { const next = new Set(prev); next.delete(paper.id); return next; });
      setBookmarks((prev) => prev.filter((b) => b.id !== paper.id));
      throw err;
    }
  }, [api]);

  const removeBookmark = useCallback(async (paperId) => {
    const prevIds = ids;
    const prevList = bookmarks;
    setIds((prev) => { const next = new Set(prev); next.delete(paperId); return next; });
    setBookmarks((prev) => prev.filter((b) => b.id !== paperId));
    try {
      await api.removeBookmark(paperId);
    } catch (err) {
      setIds(prevIds);
      setBookmarks(prevList);
      throw err;
    }
  }, [api, ids, bookmarks]);

  return (
    <BookmarksContext.Provider value={{ bookmarks, isBookmarked, addBookmark, removeBookmark }}>
      {children}
    </BookmarksContext.Provider>
  );
};

export const useBookmarks = () => {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used within a BookmarksProvider');
  return ctx;
};
