import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Settings, Loader, FileSearch, FileEdit, Calendar } from 'lucide-react';
import {
  searchAllFields,
  searchByTitle,
  searchByAuthor,
  searchByCategory,
  searchByAbstract,
  advancedSearch,
  searchByDateRange
} from '../services/arxivApi';
import { addSearchToHistory } from '../services/storageService';
import PaperCard from '../components/PaperCard';
import PaperModal from '../components/PaperModal';
import SearchHistory from '../components/SearchHistory';

const RESULTS_PER_PAGE = 20;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchType, setSearchType] = useState('all');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('descending');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const loaderRef = useRef(null);
  const currentQueryRef = useRef('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q, searchType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Close search history when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date for arXiv API (YYYYMMDDHHMMSS)
  const formatDateForApi = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}0000`;
  };

  // Validate date range
  const isValidDateRange = () => {
    if (!useDateRange) return true;
    if (!startDate || !endDate) return false;
    return new Date(startDate) <= new Date(endDate);
  };

  // Fetch results based on search type
  const fetchResults = async (searchQuery, type, start, limit) => {
    if (useDateRange && startDate && endDate) {
      const formattedStartDate = formatDateForApi(startDate);
      const formattedEndDate = formatDateForApi(endDate);
      return await searchByDateRange(searchQuery, formattedStartDate, formattedEndDate, limit);
    }

    switch (type) {
      case 'all':
        return await searchAllFields(searchQuery, start, limit);
      case 'title':
        return await searchByTitle(searchQuery, start, limit);
      case 'author':
        return await searchByAuthor(searchQuery, start, limit);
      case 'category':
        return await searchByCategory(searchQuery, start, limit);
      case 'abstract':
        return await searchByAbstract(searchQuery, start, limit);
      case 'advanced':
        return await advancedSearch(searchQuery, sortBy, sortOrder, start, limit);
      default:
        return await searchAllFields(searchQuery, start, limit);
    }
  };

  const performSearch = async (searchQuery, type = searchType) => {
    if (!searchQuery.trim()) return;

    // Validate date range if enabled
    if (useDateRange && !isValidDateRange()) {
      setError('Invalid date range. End date must be after start date.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setCurrentPage(0);
    setHasMore(true);
    currentQueryRef.current = searchQuery;

    try {
      const data = await fetchResults(searchQuery, type, 0, RESULTS_PER_PAGE);
      setResults(data);
      setHasMore(data.length === RESULTS_PER_PAGE);
      // Save to search history
      addSearchToHistory(searchQuery, type, data.length);
    } catch (err) {
      setError('Failed to fetch results. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setShowHistory(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !currentQueryRef.current) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const start = nextPage * RESULTS_PER_PAGE;

    try {
      const data = await fetchResults(currentQueryRef.current, searchType, start, RESULTS_PER_PAGE);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setResults(prev => [...prev, ...data]);
        setCurrentPage(nextPage);
        setHasMore(data.length === RESULTS_PER_PAGE);
      }
    } catch (err) {
      console.error('Error loading more results:', err);
    } finally {
      setLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, hasMore, currentPage, searchType, useDateRange, startDate, endDate, sortBy, sortOrder]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      performSearch(query);
    }
  };

  const handleSelectFromHistory = (historyQuery, historySearchType) => {
    setQuery(historyQuery);
    setSearchType(historySearchType);
    setSearchParams({ q: historyQuery });
    performSearch(historyQuery, historySearchType);
  };

  return (
    <div className="search-page">
      <div className="search-page-header">
        <h1>Search Papers</h1>
        <p>Search across millions of academic papers</p>
      </div>

      <div className="search-container" ref={searchContainerRef}>
        <div className="search-type-tabs">
          {['all', 'title', 'author', 'category', 'abstract', 'advanced'].map((type) => (
            <button
              key={type}
              className={`tab-btn ${searchType === type ? 'active' : ''}`}
              onClick={() => setSearchType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <form className="search-form-main" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              ref={searchInputRef}
              type="text"
              className="search-input-main"
              placeholder={
                searchType === 'category'
                  ? 'e.g., cs.AI, math.NT'
                  : searchType === 'advanced'
                  ? 'e.g., ti:quantum AND au:Einstein'
                  : `Search by ${searchType}...`
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
            />
            <SearchHistory
              visible={showHistory}
              onSelectSearch={handleSelectFromHistory}
              onClose={() => setShowHistory(false)}
            />
          </div>
          <button type="submit" className="search-btn-main" disabled={loading}>
            {loading ? <Loader size={18} className="spinner-icon" /> : <Search size={18} />} Search
          </button>
          <button
            type="button"
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Settings size={18} /> Filters
          </button>
        </form>

        {showFilters && (
          <div className="search-filters">
            {searchType === 'advanced' && (
              <>
                <div className="filter-group">
                  <label>Sort by:</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="relevance">Relevance</option>
                    <option value="lastUpdatedDate">Last Updated</option>
                    <option value="submittedDate">Submitted Date</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Order:</label>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="descending">Descending</option>
                    <option value="ascending">Ascending</option>
                  </select>
                </div>
              </>
            )}

            <div className="filter-divider"></div>

            <div className="date-range-section">
              <div className="filter-group">
                <label className="date-range-toggle">
                  <input
                    type="checkbox"
                    checked={useDateRange}
                    onChange={(e) => setUseDateRange(e.target.checked)}
                  />
                  <Calendar size={16} />
                  Filter by Date Range
                </label>
              </div>

              {useDateRange && (
                <div className="date-range-inputs">
                  <div className="filter-group">
                    <label>From:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="date-input"
                      max={endDate || undefined}
                    />
                  </div>
                  <div className="filter-group">
                    <label>To:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="date-input"
                      min={startDate || undefined}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {startDate && endDate && (
                    <button
                      type="button"
                      className="clear-dates-btn"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                    >
                      Clear Dates
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Searching papers...</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <h2>Found {results.length}+ papers</h2>
          </div>
          <div className="papers-grid">
            {results.map((paper, index) => (
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
            {!hasMore && results.length > 0 && (
              <div className="no-more-results">
                <p>No more papers to load</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="empty-state">
          <span className="empty-icon"><FileSearch size={48} /></span>
          <h3>No results found</h3>
          <p>Try different keywords or search type</p>
        </div>
      )}

      {!loading && results.length === 0 && !query && (
        <div className="empty-state">
          <span className="empty-icon"><FileEdit size={48} /></span>
          <h3>Start your search</h3>
          <p>Enter keywords above to find papers</p>
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
};

export default SearchPage;
