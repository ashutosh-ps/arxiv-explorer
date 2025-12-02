import React from 'react';
import { Star, FileText, ExternalLink, Share2, X, Quote, Download, Copy, Check, ChevronDown, Code, Github, Loader } from 'lucide-react';
import { isBookmarked, addBookmark, removeBookmark, addToHistory } from '../services/storageService';
import { getCategoryColor } from '../data/categories';
import {
  generateCitation,
  exportPaperAsBibtex,
  copyToClipboard,
  CITATION_FORMATS
} from '../services/citationService';
import {
  getCodeLinks,
  getFrameworkInfo,
  parseGitHubUrl,
  extractArxivId as extractArxivIdFromUrl
} from '../services/papersWithCodeApi';

const PaperModal = ({ paper, onClose }) => {
  const [bookmarked, setBookmarked] = React.useState(isBookmarked(paper.id));
  const [showFullAbstract, setShowFullAbstract] = React.useState(false);
  const [showCitationDropdown, setShowCitationDropdown] = React.useState(false);
  const [selectedCitationFormat, setSelectedCitationFormat] = React.useState('bibtex');
  const [copiedCitation, setCopiedCitation] = React.useState(false);
  const [showCitationPreview, setShowCitationPreview] = React.useState(false);
  const [codeLinks, setCodeLinks] = React.useState([]);
  const [loadingCode, setLoadingCode] = React.useState(true);
  const [showAllRepos, setShowAllRepos] = React.useState(false);

  React.useEffect(() => {
    addToHistory(paper);
    document.body.style.overflow = 'hidden';

    // Fetch code links
    const arxivId = extractArxivIdFromUrl(paper.id);
    if (arxivId) {
      setLoadingCode(true);
      getCodeLinks(arxivId)
        .then(links => {
          setCodeLinks(links);
          setLoadingCode(false);
        })
        .catch(() => {
          setLoadingCode(false);
        });
    } else {
      setLoadingCode(false);
    }

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

  const handleCopyCitation = async (format) => {
    const citation = generateCitation(paper, format);
    const success = await copyToClipboard(citation);
    if (success) {
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    }
    setShowCitationDropdown(false);
  };

  const handleDownloadBibtex = () => {
    exportPaperAsBibtex(paper);
    setShowCitationDropdown(false);
  };

  const currentCitation = generateCitation(paper, selectedCitationFormat);

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

            <div className="citation-dropdown-container">
              <button
                className="modal-action-btn cite-action"
                onClick={() => setShowCitationDropdown(!showCitationDropdown)}
              >
                <Quote size={18} />
                Cite
                <ChevronDown size={14} className={showCitationDropdown ? 'rotated' : ''} />
              </button>

              {showCitationDropdown && (
                <div className="citation-dropdown">
                  <div className="citation-dropdown-header">
                    <span>Copy Citation</span>
                  </div>
                  {CITATION_FORMATS.map((format) => (
                    <button
                      key={format.id}
                      className="citation-format-btn"
                      onClick={() => handleCopyCitation(format.id)}
                    >
                      <Copy size={14} />
                      <span className="format-name">{format.name}</span>
                      <span className="format-desc">{format.description}</span>
                    </button>
                  ))}
                  <div className="citation-dropdown-divider"></div>
                  <button
                    className="citation-format-btn download-btn"
                    onClick={handleDownloadBibtex}
                  >
                    <Download size={14} />
                    <span className="format-name">Download BibTeX</span>
                    <span className="format-desc">.bib file</span>
                  </button>
                </div>
              )}
            </div>

            {copiedCitation && (
              <div className="citation-copied-toast">
                <Check size={16} />
                Citation copied!
              </div>
            )}
          </div>

          <div className="citation-preview-section">
            <button
              className="citation-preview-toggle"
              onClick={() => setShowCitationPreview(!showCitationPreview)}
            >
              <Quote size={16} />
              {showCitationPreview ? 'Hide Citation Preview' : 'Show Citation Preview'}
              <ChevronDown size={14} className={showCitationPreview ? 'rotated' : ''} />
            </button>

            {showCitationPreview && (
              <div className="citation-preview">
                <div className="citation-format-selector">
                  {CITATION_FORMATS.map((format) => (
                    <button
                      key={format.id}
                      className={`format-tab ${selectedCitationFormat === format.id ? 'active' : ''}`}
                      onClick={() => setSelectedCitationFormat(format.id)}
                    >
                      {format.name}
                    </button>
                  ))}
                </div>
                <pre className="citation-text">{currentCitation}</pre>
                <div className="citation-preview-actions">
                  <button
                    className="copy-citation-btn"
                    onClick={() => handleCopyCitation(selectedCitationFormat)}
                  >
                    {copiedCitation ? <Check size={16} /> : <Copy size={16} />}
                    {copiedCitation ? 'Copied!' : 'Copy'}
                  </button>
                  {selectedCitationFormat === 'bibtex' && (
                    <button className="download-citation-btn" onClick={handleDownloadBibtex}>
                      <Download size={16} />
                      Download .bib
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="code-links-section">
            <div className="code-links-header">
              <Code size={18} />
              <span>Code Implementations</span>
              {!loadingCode && codeLinks.length > 0 && (
                <span className="code-count-badge">{codeLinks.length}</span>
              )}
            </div>

            {loadingCode ? (
              <div className="code-links-loading">
                <Loader size={20} className="spinning" />
                <span>Checking for code...</span>
              </div>
            ) : codeLinks.length === 0 ? (
              <div className="code-links-empty">
                <span>No code implementations found for this paper.</span>
              </div>
            ) : (
              <div className="code-links-list">
                {(showAllRepos ? codeLinks : codeLinks.slice(0, 5)).map((repo, index) => {
                  const githubInfo = parseGitHubUrl(repo.url);
                  const frameworkInfo = getFrameworkInfo(repo.framework);

                  return (
                    <a
                      key={index}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`code-link-item ${repo.isOfficial ? 'official' : ''}`}
                    >
                      <Github size={18} className="repo-icon" />
                      <div className="repo-info">
                        <span className="repo-name">
                          {githubInfo ? githubInfo.fullName : repo.url.split('/').slice(-2).join('/')}
                        </span>
                        <div className="repo-meta">
                          {repo.isOfficial && (
                            <span className="official-badge">Official</span>
                          )}
                          <span
                            className="framework-badge"
                            style={{
                              backgroundColor: frameworkInfo.color + '20',
                              color: frameworkInfo.color,
                              borderColor: frameworkInfo.color
                            }}
                          >
                            {frameworkInfo.name}
                          </span>
                        </div>
                      </div>
                      <ExternalLink size={14} className="link-icon" />
                    </a>
                  );
                })}

                {codeLinks.length > 5 && (
                  <button
                    className="show-more-repos-btn"
                    onClick={() => setShowAllRepos(!showAllRepos)}
                  >
                    {showAllRepos
                      ? 'Show Less'
                      : `Show ${codeLinks.length - 5} More Repositories`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperModal;
