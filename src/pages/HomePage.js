import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookMarked, Moon, Zap, ArrowRight } from 'lucide-react';
import { searchAllFields } from '../services/arxivApi';
import { categories } from '../data/categories';
import PaperCard from '../components/PaperCard';
import PaperModal from '../components/PaperModal';

const HomePage = () => {
  const [recentPapers, setRecentPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    const fetchRecentPapers = async () => {
      try {
        setLoading(true);
        // Fetch recent papers in AI/ML
        const papers = await searchAllFields('artificial intelligence OR machine learning', 0, 6);
        setRecentPapers(papers);
      } catch (error) {
        console.error('Error fetching recent papers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPapers();
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
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="category-card"
              style={{ borderColor: category.color }}
            >
              <span className="category-icon">{category.icon}</span>
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
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading papers...</p>
          </div>
        ) : (
          <div className="papers-grid">
            {recentPapers.map((paper, index) => (
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
