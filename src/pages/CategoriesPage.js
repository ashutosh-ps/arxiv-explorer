import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { categoryGroups, getCategoryById } from '../data/categories';
import { searchByCategory } from '../services/arxivApi';
import PaperCard from '../components/PaperCard';
import PaperModal from '../components/PaperModal';

// Group colors
const GROUP_COLORS = {
  'Computer Science': '#FF6B6B',
  'Economics': '#FDCB6E',
  'Electrical Engineering and Systems Science': '#00CEC9',
  'Mathematics': '#A29BFE',
  'Astrophysics': '#6C5CE7',
  'Condensed Matter': '#74B9FF',
  'General Relativity and Quantum Cosmology': '#636E72',
  'High Energy Physics': '#FD79A8',
  'Mathematical Physics': '#00B894',
  'Nonlinear Sciences': '#E17055',
  'Nuclear Physics': '#D63031',
  'Physics': '#0984E3',
  'Quantum Physics': '#9B59B6',
  'Quantitative Biology': '#55EFC4',
  'Quantitative Finance': '#F39C12',
  'Statistics': '#1ABC9C'
};

const RESULTS_PER_PAGE = 20;

const CategoriesPage = () => {
  const { categoryId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const loaderRef = useRef(null);

  useEffect(() => {
    if (categoryId) {
      const category = getCategoryById(categoryId);
      setSelectedCategory(category);
      // Reset state for new category
      setPapers([]);
      setCurrentPage(0);
      setHasMore(true);
      setError(null);
      fetchCategoryPapers(categoryId, 0, true);
    } else {
      setSelectedCategory(null);
      setPapers([]);
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const fetchCategoryPapers = async (catId, page = 0, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const start = page * RESULTS_PER_PAGE;
      const results = await searchByCategory(catId, start, RESULTS_PER_PAGE);

      if (isInitial) {
        setPapers(results);
      } else {
        setPapers(prev => [...prev, ...results]);
      }

      setHasMore(results.length === RESULTS_PER_PAGE);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching category papers:', err);
      setError('Failed to load papers. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || !categoryId) return;
    fetchCategoryPapers(categoryId, currentPage + 1, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, hasMore, categoryId, currentPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loading, loadingMore, loadMore]);

  const handleRetry = () => {
    if (categoryId) {
      setPapers([]);
      setCurrentPage(0);
      setHasMore(true);
      fetchCategoryPapers(categoryId, 0, true);
    }
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  if (selectedCategory) {
    const groupColor = GROUP_COLORS[selectedCategory.group] || '#667eea';
    return (
      <div className="category-detail-page">
        <div className="category-header">
          <Link to="/categories" className="back-link">
            <ArrowLeft size={20} /> All Categories
          </Link>
          <div className="category-header-content">
            <span className="category-icon-large" style={{ backgroundColor: groupColor }}>
              {selectedCategory.id.split('.')[0].toUpperCase()}
            </span>
            <div>
              <h1>{selectedCategory.name}</h1>
              <p className="category-description">{selectedCategory.description}</p>
              <div className="category-badges">
                <span className="category-id-badge">{selectedCategory.id}</span>
                <span className="category-group-badge" style={{ borderColor: groupColor }}>
                  {selectedCategory.group}
                </span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading papers...</p>
          </div>
        ) : error && papers.length === 0 ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="retry-button" onClick={handleRetry}>
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : papers.length === 0 ? (
          <div className="empty-state">
            <p>No papers found in this category.</p>
            <button className="retry-button" onClick={handleRetry}>
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : (
          <div className="category-papers">
            <h2>Recent Papers ({papers.length}{hasMore ? '+' : ''})</h2>
            <div className="papers-grid">
              {papers.map((paper, index) => (
                <PaperCard
                  key={`${paper.id}-${index}`}
                  paper={paper}
                  onPaperClick={setSelectedPaper}
                />
              ))}
            </div>

            {/* Infinite scroll loader */}
            <div ref={loaderRef} className="infinite-scroll-loader">
              {loadingMore && (
                <div className="loading-more">
                  <div className="spinner-small"></div>
                  <p>Loading more papers...</p>
                </div>
              )}
              {!hasMore && papers.length > 0 && (
                <div className="no-more-results">
                  <p>No more papers to load</p>
                </div>
              )}
              {error && papers.length > 0 && (
                <div className="error-state">
                  <p>{error}</p>
                  <button className="retry-button" onClick={loadMore}>
                    <RefreshCw size={16} />
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedPaper && (
          <PaperModal
            paper={selectedPaper}
            onClose={() => setSelectedPaper(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Browse by Category</h1>
        <p>Explore {Object.values(categoryGroups).flat().length} categories across {Object.keys(categoryGroups).length} fields</p>
      </div>

      <div className="category-groups">
        {Object.entries(categoryGroups).map(([groupName, cats]) => {
          const isExpanded = expandedGroups[groupName] === true; // Default to expanded
          const groupColor = GROUP_COLORS[groupName] || '#667eea';

          return (
            <div key={groupName} className="category-group">
              <button
                className="category-group-header"
                onClick={() => toggleGroup(groupName)}
                style={{ borderLeftColor: groupColor }}
              >
                <div className="group-header-left">
                  <span className="group-icon" style={{ backgroundColor: groupColor }}>
                    {groupName.charAt(0)}
                  </span>
                  <div>
                    <h2>{groupName}</h2>
                    <span className="group-count">{cats.length} categories</span>
                  </div>
                </div>
                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>

              {isExpanded && (
                <div className="category-group-items">
                  {cats.map((category) => (
                    <Link
                      key={category.id}
                      to={`/categories/${category.id}`}
                      className="category-item"
                    >
                      <div className="category-item-main">
                        <span className="category-item-id">{category.id}</span>
                        <span className="category-item-name">{category.name}</span>
                      </div>
                      <p className="category-item-desc">{category.description}</p>
                      <ArrowRight size={16} className="category-item-arrow" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesPage;
