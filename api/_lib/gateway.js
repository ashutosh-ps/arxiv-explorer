const { cached } = require('./cache');
const { retry, withTimeout } = require('./resilience');

// No-op breaker used when the caller doesn't supply one (e.g. the gateway's own tests).
const passthroughBreaker = { exec: (fn) => fn(), getState: () => 'closed' };

// Transient failures worth retrying: network/timeout errors (no status) and upstream 5xx.
// A 4xx is the client's fault and won't improve on retry, so it fails fast.
const isTransient = (err) => err.status === undefined || err.status >= 500;

// Params arXiv's query API accepts. Whitelisted so the gateway can't be abused as an
// open proxy and so the cache key is built from a known, normalized set.
const ALLOWED_PARAMS = ['search_query', 'id_list', 'start', 'max_results', 'sortBy', 'sortOrder'];

const UPSTREAM_BASE = 'https://export.arxiv.org/api/query';
const USER_AGENT = 'arxiv-explorer/1.0 (+https://github.com/ashutosh-ps/arxiv-explorer)';
const CONTENT_TYPE = 'application/atom+xml; charset=utf-8';
const EDGE_CACHE = 's-maxage=3600, stale-while-revalidate=86400';

// Identify the caller for rate limiting: first hop of X-Forwarded-For, else socket addr.
function clientKey(req) {
  const xff = req.headers && (req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']);
  if (xff) return String(xff).split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'local';
}

// Normalize the request into a stable querystring (sorted keys → order-independent key).
function normalizedQuery(query = {}) {
  const params = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    if (query[key] !== undefined) params.set(key, query[key]);
  }
  params.sort();
  return params.toString();
}

// Wire up a request handler. Dependencies are injected so the whole gateway is unit-testable
// without a network or a real Redis: pass a MemoryStore, a limiter, and a fetch stub.
function createGateway({
  store,
  rateLimiter,
  fetchImpl = fetch,
  cacheTtlSeconds = 3600,
  upstreamBase = UPSTREAM_BASE,
  breaker = passthroughBreaker,
  retryOptions = { attempts: 1 },
  timeoutMs = 8000,
}) {
  return async function handle(req, res) {
    // 1. Rate limit per client.
    const rl = await rateLimiter.check(clientKey(req));
    res.setHeader('X-RateLimit-Limit', rl.limit);
    res.setHeader('X-RateLimit-Remaining', rl.remaining);
    if (!rl.allowed) {
      res.setHeader('Retry-After', rl.retryAfter);
      return res.status(429).send('Too many requests. Please retry shortly.');
    }

    // 2. Cache-aside over the upstream fetch.
    const qs = normalizedQuery(req.query);
    const upstream = `${upstreamBase}?${qs}`;

    // One upstream attempt: fetch (cancellable via the timeout's signal) + status check.
    const fetchOnce = async (signal) => {
      const upstreamRes = await fetchImpl(upstream, { headers: { 'User-Agent': USER_AGENT }, signal });
      if (!upstreamRes.ok) {
        const err = new Error(`upstream responded ${upstreamRes.status}`);
        err.status = upstreamRes.status;
        throw err;
      }
      return { body: await upstreamRes.text() };
    };

    // Compose resilience: circuit breaker around ret(ry + per-attempt timeout).
    const producer = () =>
      breaker.exec(() =>
        retry(() => withTimeout(fetchOnce, timeoutMs), { ...retryOptions, isRetryable: isTransient })
      );

    try {
      const { value, hit } = await cached(store, `arxiv:${qs}`, cacheTtlSeconds, producer);
      res.setHeader('Content-Type', CONTENT_TYPE);
      res.setHeader('Cache-Control', EDGE_CACHE);
      res.setHeader('X-Cache', hit ? 'HIT' : 'MISS');
      return res.status(200).send(value.body);
    } catch {
      res.setHeader('Content-Type', CONTENT_TYPE);
      return res.status(502).send('<error>upstream fetch failed</error>');
    }
  };
}

module.exports = { createGateway, normalizedQuery, clientKey, ALLOWED_PARAMS };
