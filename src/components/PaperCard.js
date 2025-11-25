import React from 'react';
import { Star, Calendar, Eye, FileText, ExternalLink } from 'lucide-react';
import { isBookmarked, addBookmark, removeBookmark } from '../services/storageService';
import { getCategoryColor } from '../data/categories';

const PaperCard = ({ paper, onPaperClick }) => {
  const [bookmarked, setBookmarked] = React.useState(isBookmarked(paper.id));

  const handleBookmark = (e) => {
    e.stopPropagation();
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
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateSummary = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="paper-card-modern" onClick={() => onPaperClick(paper)}>
      <div className="paper-card-header">
        <h3 className="paper-title-modern">{paper.title}</h3>
        <button
          className={`bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
          onClick={handleBookmark}
          title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <Star size={18} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="paper-authors-modern">
        {paper.authors.slice(0, 3).join(', ')}
        {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
      </div>

      <div className="paper-meta-modern">
        <span className="paper-date"><Calendar size={14} /> {formatDate(paper.published)}</span>
        {paper.updated && paper.updated !== paper.published && (
          <span className="paper-updated">Updated: {formatDate(paper.updated)}</span>
        )}
      </div>

      {paper.categories && paper.categories.length > 0 && (
        <div className="paper-categories-modern">
          {paper.categories.slice(0, 3).map((cat, i) => (
            <span
              key={i}
              className="category-tag-modern"
              style={{ backgroundColor: getCategoryColor(cat) + '20', color: getCategoryColor(cat) }}
            >
              {cat}
            </span>
          ))}
          {paper.categories.length > 3 && (
            <span className="category-tag-modern more-tag">+{paper.categories.length - 3}</span>
          )}
        </div>
      )}

      <p className="paper-summary-modern">{truncateSummary(paper.summary)}</p>

      <div className="paper-actions">
        <button className="action-btn view-btn" onClick={(e) => { e.stopPropagation(); onPaperClick(paper); }}>
          <Eye size={16} /> View
        </button>
        {paper.links?.pdf && (
          <a
            href={paper.links.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn pdf-btn"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText size={16} /> PDF
          </a>
        )}
        {paper.links?.abstract && (
          <a
            href={paper.links.abstract}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn abstract-btn"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={16} /> arXiv
          </a>
        )}
      </div>
    </div>
  );
};

export default PaperCard;
