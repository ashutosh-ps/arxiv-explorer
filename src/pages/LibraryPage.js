import React, { useState, useEffect } from 'react';
import { Star, ScrollText, Trash2, FileText, Download, FileCode } from 'lucide-react';
import { getBookmarks, getHistory, clearHistory } from '../services/storageService';
import { exportPapersAsBibtex } from '../services/citationService';
import PaperCard from '../components/PaperCard';
import PaperModal from '../components/PaperModal';

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBookmarks(getBookmarks());
    setHistory(getHistory());
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleExportBookmarks = () => {
    if (bookmarks.length === 0) {
      alert('No bookmarks to export');
      return;
    }
    exportPapersAsBibtex(bookmarks, 'arxiv-bookmarks.bib');
  };

  const handleExportHistory = () => {
    if (history.length === 0) {
      alert('No history to export');
      return;
    }
    exportPapersAsBibtex(history, 'arxiv-history.bib');
  };

  const handlePaperClick = (paper) => {
    setSelectedPaper(paper);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="library-page">
      <div className="library-header">
        <h1>My Library</h1>
        <p>Your saved papers and reading history</p>
      </div>

      <div className="library-tabs">
        <button
          className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarks')}
        >
          <Star size={18} /> Bookmarks ({bookmarks.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <ScrollText size={18} /> History ({history.length})
        </button>
      </div>

      {activeTab === 'bookmarks' && (
        <div className="library-content">
          {bookmarks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><Star size={48} /></span>
              <h3>No bookmarks yet</h3>
              <p>Start bookmarking papers to see them here</p>
            </div>
          ) : (
            <>
              <div className="content-header">
                <h2>Saved Papers</h2>
                <div className="content-header-actions">
                  <span className="count-badge">{bookmarks.length} papers</span>
                  <button className="export-btn" onClick={handleExportBookmarks}>
                    <FileCode size={18} />
                    Export BibTeX
                  </button>
                </div>
              </div>
              <div className="papers-grid">
                {bookmarks.map((paper, index) => (
                  <PaperCard
                    key={index}
                    paper={paper}
                    onPaperClick={handlePaperClick}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="library-content">
          {history.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><ScrollText size={48} /></span>
              <h3>No history yet</h3>
              <p>Papers you view will appear here</p>
            </div>
          ) : (
            <>
              <div className="content-header">
                <h2>Reading History</h2>
                <div className="content-header-actions">
                  <button className="export-btn" onClick={handleExportHistory}>
                    <FileCode size={18} />
                    Export BibTeX
                  </button>
                  <button className="clear-history-btn" onClick={handleClearHistory}>
                    <Trash2 size={18} /> Clear History
                  </button>
                </div>
              </div>
              <div className="history-list">
                {history.map((paper, index) => (
                  <div key={index} className="history-item" onClick={() => handlePaperClick(paper)}>
                    <div className="history-item-content">
                      <h3 className="history-item-title">{paper.title}</h3>
                      <div className="history-item-meta">
                        <span className="history-authors">
                          {paper.authors.slice(0, 2).join(', ')}
                          {paper.authors.length > 2 && ` +${paper.authors.length - 2}`}
                        </span>
                        <span className="history-date">
                          Viewed {formatDate(paper.viewedAt)}
                        </span>
                      </div>
                      <p className="history-item-summary">
                        {paper.summary.substring(0, 150)}...
                      </p>
                    </div>
                    <div className="history-item-actions">
                      {paper.links?.pdf && (
                        <a
                          href={paper.links.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="history-action-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText size={16} /> PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {selectedPaper && (
        <PaperModal
          paper={selectedPaper}
          onClose={() => {
            setSelectedPaper(null);
            loadData(); // Reload data in case bookmarks changed
          }}
        />
      )}
    </div>
  );
};

export default LibraryPage;
