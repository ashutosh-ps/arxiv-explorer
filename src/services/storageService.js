// LocalStorage service for managing saved papers, history, and preferences

const STORAGE_KEYS = {
  BOOKMARKS: 'arxiv_bookmarks',
  HISTORY: 'arxiv_history',
  DARK_MODE: 'arxiv_dark_mode',
  COLLECTIONS: 'arxiv_collections'
};

// Bookmarks
export const getBookmarks = () => {
  try {
    const bookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Error reading bookmarks:', error);
    return [];
  }
};

export const addBookmark = (paper) => {
  try {
    const bookmarks = getBookmarks();
    const exists = bookmarks.find(p => p.id === paper.id);
    if (!exists) {
      const newBookmarks = [{ ...paper, savedAt: new Date().toISOString() }, ...bookmarks];
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(newBookmarks));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

export const removeBookmark = (paperId) => {
  try {
    const bookmarks = getBookmarks();
    const filtered = bookmarks.filter(p => p.id !== paperId);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

export const isBookmarked = (paperId) => {
  const bookmarks = getBookmarks();
  return bookmarks.some(p => p.id === paperId);
};

// History
export const getHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
};

export const addToHistory = (paper) => {
  try {
    let history = getHistory();
    // Remove if already exists
    history = history.filter(p => p.id !== paper.id);
    // Add to beginning with timestamp
    history.unshift({ ...paper, viewedAt: new Date().toISOString() });
    // Keep only last 100 items
    history = history.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Error adding to history:', error);
    return false;
  }
};

export const clearHistory = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
};

// Dark Mode
export const getDarkMode = () => {
  try {
    const darkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return darkMode === 'true';
  } catch (error) {
    return false;
  }
};

export const setDarkMode = (enabled) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, enabled.toString());
    return true;
  } catch (error) {
    console.error('Error setting dark mode:', error);
    return false;
  }
};

// Collections
export const getCollections = () => {
  try {
    const collections = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    return collections ? JSON.parse(collections) : [];
  } catch (error) {
    console.error('Error reading collections:', error);
    return [];
  }
};

export const createCollection = (name) => {
  try {
    const collections = getCollections();
    const newCollection = {
      id: Date.now().toString(),
      name,
      papers: [],
      createdAt: new Date().toISOString()
    };
    collections.push(newCollection);
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    return newCollection;
  } catch (error) {
    console.error('Error creating collection:', error);
    return null;
  }
};

export const addToCollection = (collectionId, paper) => {
  try {
    const collections = getCollections();
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      const exists = collection.papers.find(p => p.id === paper.id);
      if (!exists) {
        collection.papers.push(paper);
        localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error adding to collection:', error);
    return false;
  }
};
