import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { categories, getCategoryById } from '../data/categories';
import { searchByCategory } from '../services/arxivApi';
import PaperCard from '../components/PaperCard';
import PaperModal from '../components/PaperModal';

const CategoriesPage = () => {
  const { categoryId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    if (categoryId) {
      const category = getCategoryById(categoryId);
      setSelectedCategory(category);
      fetchCategoryPapers(categoryId);
    } else {
      setSelectedCategory(null);
      setPapers([]);
    }
  }, [categoryId]);

  const fetchCategoryPapers = async (catId) => {
    setLoading(true);
    try {
      const results = await searchByCategory(catId, 0, 20);
      setPapers(results);
    } catch (error) {
      console.error('Error fetching category papers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedCategory) {
    return (
      <div className="category-detail-page">
        <div className="category-header">
          <Link to="/categories" className="back-link">
            <ArrowLeft size={20} /> All Categories
          </Link>
          <div className="category-header-content">
            <span className="category-icon-large">{selectedCategory.icon}</span>
            <div>
              <h1>{selectedCategory.name}</h1>
              <p className="category-description">{selectedCategory.description}</p>
              <span className="category-id-badge">{selectedCategory.id}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading papers...</p>
          </div>
        ) : (
          <div className="category-papers">
            <h2>Recent Papers ({papers.length})</h2>
            <div className="papers-grid">
              {papers.map((paper, index) => (
                <PaperCard
                  key={index}
                  paper={paper}
                  onPaperClick={setSelectedPaper}
                />
              ))}
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
        <p>Explore research papers across different fields</p>
      </div>

      <div className="categories-grid-full">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categories/${category.id}`}
            className="category-card-full"
            style={{ borderLeft: `4px solid ${category.color}` }}
          >
            <div className="category-card-header">
              <span className="category-icon">{category.icon}</span>
              <div>
                <h3>{category.name}</h3>
                <span className="category-id">{category.id}</span>
              </div>
            </div>
            <p className="category-description">{category.description}</p>
            <span className="explore-link">
              Explore <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
