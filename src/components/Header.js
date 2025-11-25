import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const Header = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = React.useState('');
  const navigate = useNavigate();

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <BookOpen className="logo-icon" />
          <span className="logo-text">arXiv Explorer</span>
        </Link>

        <form className="header-search" onSubmit={handleQuickSearch}>
          <input
            type="text"
            placeholder="Quick search papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="header-search-input"
          />
          <button type="submit" className="header-search-btn">
            <Search size={20} />
          </button>
        </form>

        <nav className="main-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/search" className="nav-link">Search</Link>
          <Link to="/categories" className="nav-link">Categories</Link>
          <Link to="/library" className="nav-link">My Library</Link>
          <button className="dark-mode-toggle" onClick={toggleDarkMode} title="Toggle dark mode">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
