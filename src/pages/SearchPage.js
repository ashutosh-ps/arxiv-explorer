import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Settings, Loader, FileSearch, FileEdit } from 'lucide-react';
import {
  searchAllFields,
  searchByTitle,
  searchByAuthor,
  searchByCategory,
  searchByAbstract,
  advancedSearch
} from '../services/arxivApi';
import PaperCard from '../components/PaperCard';
import PaperModal from '../components/PaperModal';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchType, setSearchType] = useState('all');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('descending');
  const [maxResults, setMaxResults] = useState(20);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q, searchType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = async (searchQuery, type = searchType) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let data;
      switch (type) {
        case 'all':
          data = await searchAllFields(searchQuery, 0, maxResults);
          break;
        case 'title':
          data = await searchByTitle(searchQuery, 0, maxResults);
          break;
        case 'author':
          data = await searchByAuthor(searchQuery, 0, maxResults);
          break;
        case 'category':
          data = await searchByCategory(searchQuery, 0, maxResults);
          break;
        case 'abstract':
          data = await searchByAbstract(searchQuery, 0, maxResults);
          break;
        case 'advanced':
          data = await advancedSearch(searchQuery, sortBy, sortOrder, 0, maxResults);
          break;
        default:
          data = await searchAllFields(searchQuery, 0, maxResults);
      }
      setResults(data);
    } catch (err) {
      setError('Failed to fetch results. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      performSearch(query);
    }
  };

  return (
    <div className="search-page">
      <div className="search-page-header">
        <h1>Search Papers</h1>
        <p>Search across millions of academic papers</p>
      </div>

      <div className="search-container">
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
          <input
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
          />
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
            <div className="filter-group">
              <label>Results per page:</label>
              <select value={maxResults} onChange={(e) => setMaxResults(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

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
            <h2>Found {results.length} papers</h2>
          </div>
          <div className="papers-grid">
            {results.map((paper, index) => (
              <PaperCard
                key={index}
                paper={paper}
                onPaperClick={setSelectedPaper}
              />
            ))}
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
