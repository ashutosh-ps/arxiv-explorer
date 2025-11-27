# arXiv Explorer

A modern, brutalist-style web application for exploring and searching academic papers from arXiv.org. Built with React.js, featuring a clean black & white design, advanced search capabilities, and seamless user experience.

![arXiv Explorer](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Active-success)

## 🚀 Features

### Core Functionality
- **7 Search Types**: All fields, Title, Author, Category, Abstract, Advanced queries, and Direct ID lookup
- **Phrase-Matching Optimization**: Intelligent query parsing with automatic quote wrapping for exact phrase searches
- **155 Academic Categories**: Complete arXiv taxonomy across 16 fields (Computer Science, Physics, Mathematics, Economics, Biology, and more)
- **Personal Library**: Bookmark papers and track reading history with LocalStorage persistence
- **Dark/Light Mode**: Full theme support with instant toggle and system preference detection

### Search & Discovery
- **Infinite Scroll**: Seamlessly load more results as you scroll - no pagination clicks needed
- **Search History**: Recent searches saved locally with quick re-run functionality
- **Date Range Filter**: Filter papers by publication date range
- **Advanced Filters**: Sort by relevance/date, ascending/descending order

### Citation & Export
- **BibTeX Export**: Export single papers or bulk export all bookmarks as `.bib` files
- **Citation Formats**: Copy citations in APA, MLA, IEEE, Chicago, or BibTeX format
- **Citation Preview**: Preview formatted citations before copying

### Modern UI/UX
- **Brutalist Design**: Clean black & white aesthetic with sharp corners and 3D hover effects
- **80+ Lucide Icons**: Professional icon library replacing traditional emojis
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **3D Interactions**: Cuboid hover effects using CSS transforms and box-shadow
- **Smooth Animations**: Polished transitions throughout the interface
- **Error Recovery**: Retry buttons on failed API calls for better reliability

### Technical Highlights
- **CORS Solution**: Integrated proxy service for seamless cross-origin API requests
- **XML Parsing**: Efficient DOMParser implementation for arXiv's Atom feed format
- **Client-Side Storage**: No backend required - all data persisted in browser
- **Component Architecture**: 15+ reusable React components with clean separation of concerns
- **Intersection Observer**: Native browser API for efficient infinite scroll detection

## 🛠️ Tech Stack

- **Frontend**: React 18.x, React Router v6
- **Styling**: CSS3 with CSS Variables, CSS Transforms
- **Icons**: Lucide React
- **API**: arXiv API (export.arxiv.org)
- **State Management**: React Context API, LocalStorage
- **Build Tool**: Create React App
- **Proxy**: AllOrigins API for CORS handling

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/arxiv-explorer.git
cd arxiv-explorer
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

4. **Build for production**
```bash
npm run build
```

## 🎯 Usage

### Search for Papers
1. Navigate to the **Search** page
2. Select your search type (Title, Author, Category, etc.)
3. Enter your query (e.g., "Attention Is All You Need")
4. Apply filters for results per page and sorting options
5. Click on any paper to view full details

### Browse Categories
1. Visit the **Categories** page
2. Categories are organized by field (Computer Science, Physics, Mathematics, etc.)
3. Click any group header to expand/collapse categories
4. Click a category to view papers with infinite scroll support
5. Each category shows the full arXiv taxonomy (155 categories across 16 fields)

### Manage Your Library
1. Bookmark papers by clicking the star icon
2. View all bookmarked papers in **My Library** → Bookmarks
3. Check your reading history in **My Library** → History
4. Export all bookmarks as BibTeX file for citation managers
5. Clear history anytime with one click

### Copy Citations
1. Open any paper by clicking on it
2. Click the **Cite** button in the paper modal
3. Select your preferred format (APA, MLA, IEEE, Chicago, BibTeX)
4. Preview the formatted citation
5. Click **Copy** to copy to clipboard

### Dark Mode
- Toggle dark/light mode using the moon/sun icon in the header
- Theme preference is automatically saved

## 🏗️ Project Structure

```
arxiv-explorer/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Header.js          # Navigation header with search and theme toggle
│   │   ├── PaperCard.js       # Paper preview card component
│   │   ├── PaperModal.js      # Full paper details modal with citations
│   │   └── SearchHistory.js   # Recent searches dropdown component
│   ├── context/
│   │   └── DarkModeContext.js # Theme state management
│   ├── data/
│   │   └── categories.js      # Complete arXiv taxonomy (155 categories)
│   ├── pages/
│   │   ├── HomePage.js        # Landing page with featured papers
│   │   ├── SearchPage.js      # Advanced search with infinite scroll
│   │   ├── CategoriesPage.js  # Category browser with collapsible groups
│   │   └── LibraryPage.js     # Bookmarks, history, and BibTeX export
│   ├── services/
│   │   ├── arxivApi.js        # arXiv API integration layer
│   │   ├── citationService.js # Citation formatting (APA, MLA, IEEE, etc.)
│   │   └── storageService.js  # LocalStorage for bookmarks, history, search history
│   ├── App.js                 # Main app component with routing
│   ├── styles.css             # Global brutalist design system
│   └── index.js               # App entry point
├── package.json
└── README.md
```

## 🔑 Key Features Explained

### Phrase-Matching Search
The app intelligently wraps multi-word queries in quotes to ensure exact phrase matching:
- Query: `Attention Is All You Need`
- API: `ti:"Attention Is All You Need"`
- Result: Exact title match instead of OR-separated terms

### Infinite Scroll
Uses Intersection Observer API for efficient scroll detection:
```javascript
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && hasMore) {
    loadMore();
  }
}, { threshold: 0.1 });
```

### Citation Formats
Generate citations in multiple academic formats:
- **APA**: Author, A. A. (Year). Title. *arXiv preprint*. https://arxiv.org/abs/ID
- **MLA**: Author. "Title." *arXiv*, Year, arxiv.org/abs/ID.
- **IEEE**: A. Author, "Title," *arXiv:ID*, Year.
- **Chicago**: Author. "Title." arXiv preprint arXiv:ID (Year). URL.
- **BibTeX**: Full `@article{}` entry for LaTeX

### 3D Hover Effects
Using CSS transforms and box-shadow to create cuboid depth:
```css
.card:hover {
  transform: translate(4px, 4px);
  box-shadow: -4px -4px 0 var(--border-color);
}
```

### CORS Proxy Solution
Since arXiv API doesn't support CORS, we use AllOrigins:
```javascript
const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(arxivUrl)}`;
```

### Complete arXiv Taxonomy
All 155 categories organized into 16 groups:
- Computer Science (40 categories)
- Mathematics (32 categories)
- Physics (22 categories)
- Astrophysics (6 categories)
- Condensed Matter (9 categories)
- And 11 more fields...

## 🎨 Design System

### Color Scheme
- **Light Mode**: White background (#ffffff), Black text (#000000)
- **Dark Mode**: Black background (#000000), White text (#ffffff)
- **Borders**: 2px solid, 0 border-radius for sharp corners

### Typography
- System font stack for optimal performance
- Clear hierarchy with size and weight variations

### Icons
- Lucide React icons throughout
- Consistent 16px-48px sizing based on context

## 🚧 Development

### Available Scripts

- `npm start` - Run development server
- `npm run build` - Create production build
- `npm test` - Run test suite (when configured)

### Code Style
- Functional React components with Hooks
- Component-based architecture
- CSS Variables for theming
- Clean, commented code

## 📝 API Reference

The app uses the [arXiv API](https://arxiv.org/help/api/index):

**Base URL**: `https://export.arxiv.org/api/query`

**Search Query Prefixes**:
- `all:` - Search all fields
- `ti:` - Search titles
- `au:` - Search authors
- `abs:` - Search abstracts
- `cat:` - Search categories

**Example Query**:
```
https://export.arxiv.org/api/query?search_query=ti:"Machine Learning"&start=0&max_results=10
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [arXiv.org](https://arxiv.org) for providing the free API and academic paper archive
- [Lucide Icons](https://lucide.dev/) for the beautiful icon library
- [AllOrigins](https://allorigins.win/) for CORS proxy service
- [Create React App](https://create-react-app.dev/) for the project setup

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Note**: This is a frontend-only application. All data is fetched from arXiv's public API and stored locally in your browser. No backend server is required.
