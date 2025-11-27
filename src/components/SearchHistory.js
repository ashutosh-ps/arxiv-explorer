import React from 'react';
import { Clock, X, Trash2, Search } from 'lucide-react';
import { getSearchHistory, removeSearchFromHistory, clearSearchHistory } from '../services/storageService';

const SearchHistory = ({ onSelectSearch, onClose, visible }) => {
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    if (visible) {
      setHistory(getSearchHistory());
    }
  }, [visible]);

  const handleRemove = (e, timestamp) => {
    e.stopPropagation();
    removeSearchFromHistory(timestamp);
    setHistory(getSearchHistory());
  };

  const handleClearAll = () => {
    clearSearchHistory();
    setHistory([]);
  };

  const handleSelect = (item) => {
    onSelectSearch(item.query, item.searchType);
    onClose();
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (!visible || history.length === 0) return null;

  return (
    <div className="search-history-dropdown">
      <div className="search-history-header">
        <span><Clock size={14} /> Recent Searches</span>
        <button className="clear-history-btn" onClick={handleClearAll}>
          <Trash2 size={14} /> Clear All
        </button>
      </div>
      <ul className="search-history-list">
        {history.map((item) => (
          <li
            key={item.timestamp}
            className="search-history-item"
            onClick={() => handleSelect(item)}
          >
            <div className="search-history-content">
              <Search size={14} className="search-history-icon" />
              <span className="search-history-query">{item.query}</span>
              <span className="search-history-meta">
                <span className="search-history-type">{item.searchType}</span>
                <span className="search-history-results">{item.resultCount} results</span>
                <span className="search-history-time">{formatTimeAgo(item.timestamp)}</span>
              </span>
            </div>
            <button
              className="remove-history-btn"
              onClick={(e) => handleRemove(e, item.timestamp)}
              aria-label="Remove from history"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchHistory;
