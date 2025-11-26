/**
 * Citation Service - Generate citations in various formats
 * Supports: BibTeX, APA, MLA, IEEE, Chicago
 */

/**
 * Extract arXiv ID from paper URL or ID field
 */
const extractArxivId = (paper) => {
  const id = paper.id || '';
  const match = id.match(/arxiv\.org\/abs\/([\d.]+v?\d*)/i) || id.match(/([\d.]+v?\d*)/);
  return match ? match[1] : 'unknown';
};

/**
 * Extract year from date string
 */
const extractYear = (dateString) => {
  if (!dateString) return new Date().getFullYear();
  return new Date(dateString).getFullYear();
};

/**
 * Format authors for BibTeX (Author One and Author Two and Author Three)
 */
const formatAuthorsBibtex = (authors) => {
  if (!authors || authors.length === 0) return 'Unknown Author';
  return authors.join(' and ');
};

/**
 * Format authors for APA (Last, F. M., & Last, F. M.)
 */
const formatAuthorsAPA = (authors) => {
  if (!authors || authors.length === 0) return 'Unknown Author';

  const formatSingleAuthor = (author) => {
    const parts = author.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(p => p[0] + '.').join(' ');
    return `${lastName}, ${initials}`;
  };

  if (authors.length === 1) {
    return formatSingleAuthor(authors[0]);
  } else if (authors.length === 2) {
    return `${formatSingleAuthor(authors[0])}, & ${formatSingleAuthor(authors[1])}`;
  } else if (authors.length <= 20) {
    const formattedAuthors = authors.slice(0, -1).map(formatSingleAuthor).join(', ');
    return `${formattedAuthors}, & ${formatSingleAuthor(authors[authors.length - 1])}`;
  } else {
    const first19 = authors.slice(0, 19).map(formatSingleAuthor).join(', ');
    return `${first19}, ... ${formatSingleAuthor(authors[authors.length - 1])}`;
  }
};

/**
 * Format authors for MLA (Last, First, and First Last)
 */
const formatAuthorsMLA = (authors) => {
  if (!authors || authors.length === 0) return 'Unknown Author';

  const formatFirstAuthor = (author) => {
    const parts = author.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const lastName = parts[parts.length - 1];
    const firstName = parts.slice(0, -1).join(' ');
    return `${lastName}, ${firstName}`;
  };

  if (authors.length === 1) {
    return formatFirstAuthor(authors[0]);
  } else if (authors.length === 2) {
    return `${formatFirstAuthor(authors[0])}, and ${authors[1]}`;
  } else if (authors.length === 3) {
    return `${formatFirstAuthor(authors[0])}, ${authors[1]}, and ${authors[2]}`;
  } else {
    return `${formatFirstAuthor(authors[0])}, et al.`;
  }
};

/**
 * Format authors for IEEE (F. M. Last, F. M. Last, and F. M. Last)
 */
const formatAuthorsIEEE = (authors) => {
  if (!authors || authors.length === 0) return 'Unknown Author';

  const formatSingleAuthor = (author) => {
    const parts = author.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(p => p[0] + '.').join(' ');
    return `${initials} ${lastName}`;
  };

  if (authors.length === 1) {
    return formatSingleAuthor(authors[0]);
  } else if (authors.length === 2) {
    return `${formatSingleAuthor(authors[0])} and ${formatSingleAuthor(authors[1])}`;
  } else {
    const allButLast = authors.slice(0, -1).map(formatSingleAuthor).join(', ');
    return `${allButLast}, and ${formatSingleAuthor(authors[authors.length - 1])}`;
  }
};

/**
 * Format authors for Chicago (Last, First, First Last, and First Last)
 */
const formatAuthorsChicago = (authors) => {
  if (!authors || authors.length === 0) return 'Unknown Author';

  const formatFirstAuthor = (author) => {
    const parts = author.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const lastName = parts[parts.length - 1];
    const firstName = parts.slice(0, -1).join(' ');
    return `${lastName}, ${firstName}`;
  };

  if (authors.length === 1) {
    return formatFirstAuthor(authors[0]);
  } else if (authors.length === 2) {
    return `${formatFirstAuthor(authors[0])}, and ${authors[1]}`;
  } else if (authors.length === 3) {
    return `${formatFirstAuthor(authors[0])}, ${authors[1]}, and ${authors[2]}`;
  } else if (authors.length <= 10) {
    const allButLast = [formatFirstAuthor(authors[0]), ...authors.slice(1, -1)].join(', ');
    return `${allButLast}, and ${authors[authors.length - 1]}`;
  } else {
    return `${formatFirstAuthor(authors[0])}, et al.`;
  }
};

/**
 * Clean title for BibTeX (escape special characters)
 */
const cleanTitleBibtex = (title) => {
  if (!title) return 'Untitled';
  return title
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Generate BibTeX citation
 */
export const generateBibtex = (paper) => {
  const arxivId = extractArxivId(paper);
  const year = extractYear(paper.published);
  const authors = formatAuthorsBibtex(paper.authors);
  const title = cleanTitleBibtex(paper.title);
  const abstractUrl = paper.links?.abstract || `https://arxiv.org/abs/${arxivId}`;
  const pdfUrl = paper.links?.pdf || `https://arxiv.org/pdf/${arxivId}.pdf`;
  const primaryCategory = paper.categories?.[0] || 'cs';

  return `@article{arxiv:${arxivId},
  title     = {${title}},
  author    = {${authors}},
  journal   = {arXiv preprint arXiv:${arxivId}},
  year      = {${year}},
  eprint    = {${arxivId}},
  archivePrefix = {arXiv},
  primaryClass = {${primaryCategory}},
  url       = {${abstractUrl}},
  pdf       = {${pdfUrl}}
}`;
};

/**
 * Generate APA citation (7th edition)
 */
export const generateAPA = (paper) => {
  const arxivId = extractArxivId(paper);
  const year = extractYear(paper.published);
  const authors = formatAuthorsAPA(paper.authors);
  const title = paper.title?.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() || 'Untitled';
  const url = paper.links?.abstract || `https://arxiv.org/abs/${arxivId}`;

  return `${authors} (${year}). ${title}. arXiv. ${url}`;
};

/**
 * Generate MLA citation (9th edition)
 */
export const generateMLA = (paper) => {
  const arxivId = extractArxivId(paper);
  const year = extractYear(paper.published);
  const authors = formatAuthorsMLA(paper.authors);
  const title = paper.title?.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() || 'Untitled';
  const url = paper.links?.abstract || `https://arxiv.org/abs/${arxivId}`;

  return `${authors}. "${title}." arXiv, ${year}, ${url}.`;
};

/**
 * Generate IEEE citation
 */
export const generateIEEE = (paper) => {
  const arxivId = extractArxivId(paper);
  const year = extractYear(paper.published);
  const authors = formatAuthorsIEEE(paper.authors);
  const title = paper.title?.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() || 'Untitled';

  return `${authors}, "${title}," arXiv:${arxivId}, ${year}.`;
};

/**
 * Generate Chicago citation (17th edition)
 */
export const generateChicago = (paper) => {
  const arxivId = extractArxivId(paper);
  const year = extractYear(paper.published);
  const authors = formatAuthorsChicago(paper.authors);
  const title = paper.title?.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() || 'Untitled';
  const url = paper.links?.abstract || `https://arxiv.org/abs/${arxivId}`;

  return `${authors}. "${title}." arXiv preprint arXiv:${arxivId} (${year}). ${url}.`;
};

/**
 * Generate citation in specified format
 */
export const generateCitation = (paper, format) => {
  switch (format.toLowerCase()) {
    case 'bibtex':
      return generateBibtex(paper);
    case 'apa':
      return generateAPA(paper);
    case 'mla':
      return generateMLA(paper);
    case 'ieee':
      return generateIEEE(paper);
    case 'chicago':
      return generateChicago(paper);
    default:
      return generateBibtex(paper);
  }
};

/**
 * Generate BibTeX for multiple papers (bulk export)
 */
export const generateBulkBibtex = (papers) => {
  if (!papers || papers.length === 0) return '';
  return papers.map(paper => generateBibtex(paper)).join('\n\n');
};

/**
 * Download text content as a file
 */
export const downloadAsFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export single paper as BibTeX file
 */
export const exportPaperAsBibtex = (paper) => {
  const bibtex = generateBibtex(paper);
  const arxivId = extractArxivId(paper);
  downloadAsFile(bibtex, `arxiv-${arxivId}.bib`, 'application/x-bibtex');
};

/**
 * Export multiple papers as BibTeX file
 */
export const exportPapersAsBibtex = (papers, filename = 'arxiv-papers.bib') => {
  const bibtex = generateBulkBibtex(papers);
  downloadAsFile(bibtex, filename, 'application/x-bibtex');
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Available citation formats
 */
export const CITATION_FORMATS = [
  { id: 'bibtex', name: 'BibTeX', description: 'For LaTeX documents' },
  { id: 'apa', name: 'APA', description: 'APA 7th Edition' },
  { id: 'mla', name: 'MLA', description: 'MLA 9th Edition' },
  { id: 'ieee', name: 'IEEE', description: 'IEEE Style' },
  { id: 'chicago', name: 'Chicago', description: 'Chicago 17th Edition' }
];
