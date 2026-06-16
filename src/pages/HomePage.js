import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookMarked, Moon, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import { searchByCategory, searchAllFields } from '../services/arxivApi';
import { featuredCategories } from '../data/categories';
import { getFeaturedCategoryForToday } from '../utils/featured';
import PaperCard from '../components/PaperCard';
import PaperModal from '../components/PaperModal';

const HomePage = () => {
  const [featuredPapers, setFeaturedPapers] = useState([]);
  const [featuredTopic, setFeaturedTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);

  const fetchFeaturedPapers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Rotate the spotlight topic daily, then pull that category's newest papers.
      const topic = getFeaturedCategoryForToday();
      setFeaturedTopic(topic);

      let papers = [];
      try {
        if (topic) {
          papers = await searchByCategory(topic.id, 0, 6, 'submittedDate', 'descending');
        }
      } catch (topicError) {
        // A thin or rate-limited category shouldn't blank the homepage — fall through.
        console.warn('Featured topic fetch failed, falling back:', topicError);
        papers = [];
      }

      // Fallback to a broad AI/ML query if the topic returned little or nothing.
      if (papers.length < 6) {
        papers = await searchAllFields('artificial intelligence OR machine learning', 0, 6);
      }

      setFeaturedPapers(papers);
    } catch (error) {
      console.error('Error fetching featured papers:', error);
      setError('Failed to load featured papers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Guard against React StrictMode's double-invoke in dev firing two arXiv requests.
  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchFeaturedPapers();
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Explore Academic Papers</h1>
          <p className="hero-subtitle">
            Modern interface for browsing arXiv research papers
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">2M+</span>
              <span className="stat-label">Papers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Daily</span>
              <span className="stat-label">Updates</span>
            </div>
          </div>
          <Link to="/search" className="cta-button">
            Start Exploring <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <section className="categories-preview">
        <h2 className="section-title">Browse by Category</h2>
        <div className="categories-grid">
          {featuredCategories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="category-card"
              style={{ borderColor: category.color }}
            >
              <span className="category-icon" style={{ backgroundColor: category.color }}>
                {category.id.split('.')[0].toUpperCase()}
              </span>
              <h3 className="category-name">{category.name}</h3>
              <p className="category-desc">{category.description}</p>
            </Link>
          ))}
        </div>
        <div className="view-all-container">
          <Link to="/categories" className="view-all-link">
            View All Categories <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="recent-papers">
        <h2 className="section-title">Featured Papers</h2>
        {featuredTopic && !loading && !error && (
          <p className="section-subtitle">Today's topic: {featuredTopic.name}</p>
        )}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading papers...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="retry-button" onClick={fetchFeaturedPapers}>
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : featuredPapers.length === 0 ? (
          <div className="empty-state">
            <p>No papers found.</p>
            <button className="retry-button" onClick={fetchFeaturedPapers}>
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : (
          <div className="papers-grid">
            {featuredPapers.map((paper, index) => (
              <PaperCard
                key={index}
                paper={paper}
                onPaperClick={setSelectedPaper}
              />
            ))}
          </div>
        )}
      </section>

      <section className="features-section">
        <h2 className="section-title">Why arXiv Explorer?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon"><Search size={32} /></span>
            <h3>Advanced Search</h3>
            <p>Search by title, author, abstract, or category with powerful filters</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon"><BookMarked size={32} /></span>
            <h3>Personal Library</h3>
            <p>Bookmark papers and keep track of your reading history</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon"><Moon size={32} /></span>
            <h3>Dark Mode</h3>
            <p>Comfortable reading experience day or night</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon"><Zap size={32} /></span>
            <h3>Fast & Modern</h3>
            <p>Clean, responsive interface built for researchers</p>
          </div>
        </div>
      </section>

      {selectedPaper && (
        <PaperModal
          paper={selectedPaper}
          onClose={() => setSelectedPaper(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
