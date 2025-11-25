import React from 'react';
import { Star, FileText, ExternalLink, Share2, X } from 'lucide-react';
import { isBookmarked, addBookmark, removeBookmark, addToHistory } from '../services/storageService';
import { getCategoryColor } from '../data/categories';

const PaperModal = ({ paper, onClose }) => {
  const [bookmarked, setBookmarked] = React.useState(isBookmarked(paper.id));
  const [showFullAbstract, setShowFullAbstract] = React.useState(false);

  React.useEffect(() => {
    addToHistory(paper);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [paper]);

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(paper.id);
      setBookmarked(false);
    } else {
      addBookmark(paper);
      setBookmarked(true);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const extractArxivId = (url) => {
    const match = url.match(/arxiv\.org\/abs\/([\d.]+)/);
    return match ? match[1] : null;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="paper-modal-backdrop" onClick={handleBackdropClick}>
      <div className="paper-modal">
        <div className="paper-modal-header">
          <h2 className="paper-modal-title">{paper.title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="paper-modal-content">
          <div className="paper-modal-meta">
            <div className="meta-item">
              <strong>arXiv ID:</strong> {extractArxivId(paper.id) || 'N/A'}
            </div>
            <div className="meta-item">
              <strong>Published:</strong> {formatDate(paper.published)}
            </div>
            {paper.updated && paper.updated !== paper.published && (
              <div className="meta-item">
                <strong>Updated:</strong> {formatDate(paper.updated)}
              </div>
            )}
          </div>

          <div className="paper-modal-authors">
            <strong>Authors:</strong>
            <div className="authors-list">
              {paper.authors.map((author, i) => (
                <span key={i} className="author-chip">
                  {author}
                </span>
              ))}
            </div>
          </div>

          {paper.categories && paper.categories.length > 0 && (
            <div className="paper-modal-categories">
              <strong>Categories:</strong>
              <div className="categories-list">
                {paper.categories.map((cat, i) => (
                  <span
                    key={i}
                    className="category-chip"
                    style={{
                      backgroundColor: getCategoryColor(cat) + '20',
                      color: getCategoryColor(cat),
                      border: `1px solid ${getCategoryColor(cat)}`
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="paper-modal-abstract">
            <strong>Abstract:</strong>
            <p className={showFullAbstract ? 'full-abstract' : 'truncated-abstract'}>
              {paper.summary}
            </p>
            {paper.summary && paper.summary.length > 500 && (
              <button
                className="show-more-btn"
                onClick={() => setShowFullAbstract(!showFullAbstract)}
              >
                {showFullAbstract ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>

          <div className="paper-modal-actions">
            <button className={`modal-action-btn bookmark-action ${bookmarked ? 'active' : ''}`} onClick={handleBookmark}>
              <Star size={18} fill={bookmarked ? "currentColor" : "none"} />
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>

            {paper.links?.pdf && (
              <a
                href={paper.links.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-action-btn pdf-action"
              >
                <FileText size={18} />
                Download PDF
              </a>
            )}

            {paper.links?.abstract && (
              <a
                href={paper.links.abstract}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-action-btn arxiv-action"
              >
                <ExternalLink size={18} />
                View on arXiv
              </a>
            )}

            <button
              className="modal-action-btn share-action"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: paper.title,
                    text: paper.summary.substring(0, 200) + '...',
                    url: paper.links?.abstract || paper.id
                  });
                } else {
                  navigator.clipboard.writeText(paper.links?.abstract || paper.id);
                  alert('Link copied to clipboard!');
                }
              }}
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperModal;
