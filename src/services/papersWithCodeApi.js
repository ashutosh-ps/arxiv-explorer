/**
 * Papers With Code API Service
 * Uses the HuggingFace dataset: pwc-archive/links-between-paper-and-code
 * Contains 300K+ paper-to-code links with arXiv IDs
 */

const DATASET_API_URL = 'https://datasets-server.huggingface.co/filter';
const DATASET_NAME = 'pwc-archive/links-between-paper-and-code';

// Cache for code links to avoid repeated API calls
const codeLinksCache = new Map();

/**
 * Extract arXiv ID from various URL formats or ID strings
 * Handles: "2301.00001", "https://arxiv.org/abs/2301.00001", "http://arxiv.org/abs/2301.00001v2"
 */
export const extractArxivId = (idOrUrl) => {
  if (!idOrUrl) return null;

  // If it's already just an ID (e.g., "2301.00001" or "1706.03762")
  const idMatch = idOrUrl.match(/(\d{4}\.\d{4,5})(v\d+)?/);
  if (idMatch) {
    return idMatch[1]; // Return without version number
  }

  return null;
};

/**
 * Fetch code repositories for a paper by arXiv ID
 * @param {string} arxivId - The arXiv ID (e.g., "1706.03762")
 * @returns {Promise<Array>} - Array of repository objects
 */
export const getCodeLinks = async (arxivId) => {
  const cleanId = extractArxivId(arxivId);
  if (!cleanId) {
    console.warn('Invalid arXiv ID:', arxivId);
    return [];
  }

  // Check cache first
  if (codeLinksCache.has(cleanId)) {
    return codeLinksCache.get(cleanId);
  }

  try {
    const url = `${DATASET_API_URL}?dataset=${encodeURIComponent(DATASET_NAME)}&config=default&split=train&where=paper_arxiv_id%3D%27${cleanId}%27&length=50`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const rows = data.rows || [];

    // Transform the data into a cleaner format
    const repos = rows.map(r => ({
      url: r.row.repo_url,
      isOfficial: r.row.is_official,
      mentionedInPaper: r.row.mentioned_in_paper,
      mentionedInGithub: r.row.mentioned_in_github,
      framework: r.row.framework || 'unknown',
      paperTitle: r.row.paper_title,
    }));

    // Sort: official repos first, then by framework
    repos.sort((a, b) => {
      if (a.isOfficial && !b.isOfficial) return -1;
      if (!a.isOfficial && b.isOfficial) return 1;
      return 0;
    });

    // Cache the results
    codeLinksCache.set(cleanId, repos);

    return repos;
  } catch (error) {
    console.error('Error fetching code links:', error);
    return [];
  }
};

/**
 * Check if a paper has code available (quick check)
 * Returns cached result if available, otherwise fetches
 * @param {string} arxivId - The arXiv ID
 * @returns {Promise<boolean>}
 */
export const hasCode = async (arxivId) => {
  const repos = await getCodeLinks(arxivId);
  return repos.length > 0;
};

/**
 * Get code availability info for multiple papers at once
 * Useful for batch checking on search results
 * @param {Array<string>} arxivIds - Array of arXiv IDs
 * @returns {Promise<Map<string, boolean>>} - Map of arxivId -> hasCode
 */
export const batchCheckCode = async (arxivIds) => {
  const results = new Map();

  // Check cache first for all IDs
  const uncachedIds = [];
  for (const id of arxivIds) {
    const cleanId = extractArxivId(id);
    if (cleanId) {
      if (codeLinksCache.has(cleanId)) {
        results.set(cleanId, codeLinksCache.get(cleanId).length > 0);
      } else {
        uncachedIds.push(cleanId);
      }
    }
  }

  // Fetch uncached IDs (in parallel, with limit)
  const BATCH_SIZE = 5;
  for (let i = 0; i < uncachedIds.length; i += BATCH_SIZE) {
    const batch = uncachedIds.slice(i, i + BATCH_SIZE);
    const promises = batch.map(id => getCodeLinks(id));
    const batchResults = await Promise.all(promises);

    batch.forEach((id, index) => {
      results.set(id, batchResults[index].length > 0);
    });
  }

  return results;
};

/**
 * Get framework icon/color mapping
 */
export const getFrameworkInfo = (framework) => {
  const frameworks = {
    pytorch: { name: 'PyTorch', color: '#EE4C2C' },
    tf: { name: 'TensorFlow', color: '#FF6F00' },
    jax: { name: 'JAX', color: '#A855F7' },
    keras: { name: 'Keras', color: '#D00000' },
    mxnet: { name: 'MXNet', color: '#0080FF' },
    caffe: { name: 'Caffe', color: '#C09853' },
    paddle: { name: 'PaddlePaddle', color: '#2932E1' },
    none: { name: 'Other', color: '#6B7280' },
    unknown: { name: 'Unknown', color: '#6B7280' },
  };

  return frameworks[framework?.toLowerCase()] || frameworks.unknown;
};

/**
 * Extract owner and repo name from GitHub URL
 */
export const parseGitHubUrl = (url) => {
  if (!url) return null;

  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) {
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
      fullName: `${match[1]}/${match[2].replace(/\.git$/, '')}`,
    };
  }

  return null;
};

/**
 * Clear the cache (useful for testing or forcing refresh)
 */
export const clearCache = () => {
  codeLinksCache.clear();
};
