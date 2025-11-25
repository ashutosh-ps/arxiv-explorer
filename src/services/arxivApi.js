const BASE_URL = 'https://export.arxiv.org/api/query';

/**
 * Parse XML response from arXiv API
 */
const parseArxivResponse = (xmlString) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, "application/xml");
  const entries = xml.querySelectorAll('entry');

  const results = [];
  entries.forEach(entry => {
    const title = entry.querySelector('title')?.textContent.trim();
    const summary = entry.querySelector('summary')?.textContent.trim();
    const id = entry.querySelector('id')?.textContent;
    const published = entry.querySelector('published')?.textContent;
    const updated = entry.querySelector('updated')?.textContent;

    // Get authors
    const authorNodes = entry.querySelectorAll('author name');
    const authors = Array.from(authorNodes).map(node => node.textContent);

    // Get categories
    const categoryNodes = entry.querySelectorAll('category');
    const categories = Array.from(categoryNodes).map(node => node.getAttribute('term'));

    // Get links
    const linkNodes = entry.querySelectorAll('link');
    const links = {};
    linkNodes.forEach(link => {
      const rel = link.getAttribute('rel');
      const href = link.getAttribute('href');
      const type = link.getAttribute('type');
      if (rel === 'alternate') {
        links.abstract = href;
      } else if (type === 'application/pdf') {
        links.pdf = href;
      }
    });

    results.push({
      title,
      summary,
      id,
      published,
      updated,
      authors,
      categories,
      links
    });
  });

  return results;
};

/**
 * Fetch with CORS proxy
 */
const fetchWithProxy = async (url) => {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  return response.text();
};

/**
 * Search all fields
 */
export const searchAllFields = async (query, start = 0, maxResults = 10) => {
  // For multi-word queries, wrap in quotes for better phrase matching
  const searchTerm = query.includes(' ') && !query.includes('AND') && !query.includes('OR')
    ? `"${query}"`
    : query;
  const url = `${BASE_URL}?search_query=all:${encodeURIComponent(searchTerm)}&start=${start}&max_results=${maxResults}`;

  try {
    const text = await fetchWithProxy(url);
    return parseArxivResponse(text);
  } catch (error) {
    console.error('Error fetching from arXiv:', error);
    throw error;
  }
};

/**
 * Search by title
 */
export const searchByTitle = async (title, start = 0, maxResults = 10) => {
  // Wrap multi-word titles in quotes for exact phrase matching
  const searchTerm = title.includes(' ') ? `"${title}"` : title;
  const url = `${BASE_URL}?search_query=ti:${encodeURIComponent(searchTerm)}&start=${start}&max_results=${maxResults}`;

  try {
    const text = await fetchWithProxy(url);
    return parseArxivResponse(text);
  } catch (error) {
    console.error('Error fetching from arXiv:', error);
    throw error;
  }
};

/**
 * Search by author
 */
export const searchByAuthor = async (author, start = 0, maxResults = 10) => {
  // Wrap multi-word author names in quotes
  const searchTerm = author.includes(' ') ? `"${author}"` : author;
  const url = `${BASE_URL}?search_query=au:${encodeURIComponent(searchTerm)}&start=${start}&max_results=${maxResults}`;

  try {
    const text = await fetchWithProxy(url);
    return parseArxivResponse(text);
  } catch (error) {
    console.error('Error fetching from arXiv:', error);
    throw error;
  }
};

/**
 * Search by category
 */
export const searchByCategory = async (category, start = 0, maxResults = 10) => {
  const url = `${BASE_URL}?search_query=cat:${encodeURIComponent(category)}&start=${start}&max_results=${maxResults}`;

  try {
    const text = await fetchWithProxy(url);
    return parseArxivResponse(text);
  } catch (error) {
    console.error('Error fetching from arXiv:', error);
    throw error;
  }
};

/**
 * Search by abstract
 */
export const searchByAbstract = async (abstractText, start = 0, maxResults = 10) => {
  // Wrap multi-word abstract queries in quotes for better phrase matching
  const searchTerm = abstractText.includes(' ') && !abstractText.includes('AND') && !abstractText.includes('OR')
    ? `"${abstractText}"`
    : abstractText;
  const url = `${BASE_URL}?search_query=abs:${encodeURIComponent(searchTerm)}&start=${start}&max_results=${maxResults}`;

  try {
    const text = await fetchWithProxy(url);
    return parseArxivResponse(text);
  } catch (error) {
    console.error('Error fetching from arXiv:', error);
    throw error;
  }
};

/**
 * Advanced search with boolean operators
 */
export const advancedSearch = async (query, sortBy = 'relevance', sortOrder = 'descending', start = 0, maxResults = 10) => {
  const url = `${BASE_URL}?search_query=${encodeURIComponent(query)}&sortBy=${sortBy}&sortOrder=${sortOrder}&start=${start}&max_results=${maxResults}`;

  try {
    const text = await fetchWithProxy(url);
    return parseArxivResponse(text);
  } catch (error) {
    console.error('Error fetching from arXiv:', error);
    throw error;
  }
};

/**
 * Get papers by arXiv IDs
 */
export const getByIds = async (ids) => {
  const idList = Array.isArray(ids) ? ids.join(',') : ids;
  const url = `${BASE_URL}?id_list=${idList}`;

  try {
    const text = await fetchWithProxy(url);
    return parseArxivResponse(text);
  } catch (error) {
    console.error('Error fetching from arXiv:', error);
    throw error;
  }
};

/**
 * Search with date range
 */
export const searchByDateRange = async (query, startDate, endDate, maxResults = 10) => {
  const dateQuery = `submittedDate:[${startDate}+TO+${endDate}]`;
  const fullQuery = query ? `${query}+AND+${dateQuery}` : dateQuery;
  const url = `${BASE_URL}?search_query=${fullQuery}&start=0&max_results=${maxResults}`;

  try {
    const text = await fetchWithProxy(url);
    return parseArxivResponse(text);
  } catch (error) {
    console.error('Error fetching from arXiv:', error);
    throw error;
  }
};
