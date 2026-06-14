// CommonJS to match your root package.json (no "type": "module")
module.exports = async function handler(req, res) {
  // Whitelist params and hardcode the host so this can't be abused as an open proxy
  const allowed = ['search_query', 'id_list', 'start', 'max_results', 'sortBy', 'sortOrder'];
  const params = new URLSearchParams();
  for (const key of allowed) {
    if (req.query[key] !== undefined) params.set(key, req.query[key]);
  }

  const upstream = `https://export.arxiv.org/api/query?${params.toString()}`;

  try {
    const r = await fetch(upstream, {
      headers: { 'User-Agent': 'arxiv-explorer/1.0 (+https://arxiv-explorer-chi.vercel.app)' },
    });
    const xml = await r.text();
    res.setHeader('Content-Type', 'application/atom+xml; charset=utf-8');
    // arXiv updates daily — cache hard at the edge so repeat queries never hit upstream
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(r.status).send(xml);
  } catch (e) {
    return res.status(502).send('<error>upstream fetch failed</error>');
  }
};
