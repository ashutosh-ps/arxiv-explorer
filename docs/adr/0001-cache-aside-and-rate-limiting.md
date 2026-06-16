# ADR 0001 — A shared API gateway with cache-aside and rate limiting

- **Status:** Accepted
- **Date:** 2026-06-17

## Context

The frontend calls `/api/arxiv?...`, which is served by two *different* handlers:
`src/setupProxy.js` in local dev and the Vercel function `api/arxiv.js` in production.
That divergence already caused a bug (a dev-only proxy misconfiguration that returned
arXiv's HTML homepage instead of the Atom API). The endpoint also has no caching beyond
CDN headers and no protection against abusive request rates, and it hammered arXiv hard
enough to draw `429`s.

## Decision

Extract a single, framework-agnostic **gateway** that both entry points call, and put two
cross-cutting concerns in front of the upstream fetch:

1. **Cache-aside** — look up a normalized cache key; on a miss, fetch arXiv, store the
   response with a TTL, and return it. Adds an `X-Cache: HIT|MISS` header.
2. **Per-client rate limiting** — a **token bucket** keyed by client IP. Over budget returns
   `429` with `Retry-After` and `X-RateLimit-*` headers.

### Storage abstraction

A small `Store` interface (`get`, `set` with TTL) with two adapters selected at runtime:

- `MemoryStore` — `Map` + TTL. Default; used in dev and tests. No external accounts.
- `UpstashStore` — same interface over the Upstash Redis REST API (raw `fetch`, no SDK).
  Selected automatically when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set.

Gateway code depends only on the interface, never on which adapter is active.

### Module layout

```
api/_lib/store/memory-store.js   # Map + TTL store (pure)
api/_lib/store/upstash-store.js  # Upstash REST adapter
api/_lib/store/index.js          # createStore() — picks adapter from env
api/_lib/cache.js                # cached(store, key, ttl, producer)
api/_lib/rate-limit.js           # token bucket -> { allowed, remaining, retryAfter }
api/_lib/gateway.js              # orchestrates ratelimit -> cache -> fetch -> respond
api/arxiv.js                     # prod adapter (Vercel) -> gateway
src/setupProxy.js                # dev adapter -> same gateway
```

Files under `api/_lib/` are not deployed as endpoints (Vercel ignores `_`-prefixed paths).

## Consequences

- **Single source of truth.** Dev and prod run identical gateway code, eliminating the
  divergence that caused the original bug.
- **Testable without infrastructure.** All logic is unit-tested against `MemoryStore` via
  Node's built-in test runner (`npm run test:api`), separate from the CRA/Jest frontend tests.
- **Production-ready when credentials arrive.** Adding `UPSTASH_*` env vars switches the
  store with no code change.
- **Known limitation:** the token bucket is read-modify-write over a generic KV store, so it
  has a TOCTOU race across concurrent serverless instances. Acceptable for this scope; a
  production hardening would use an atomic Lua script or `@upstash/ratelimit`.
- **Fail-open:** if the store errors, the cache degrades to a direct fetch and the limiter
  allows the request, so a Redis outage never takes the API down.

## Out of scope (later work)

Auth, Postgres-backed user data, a retry + circuit-breaker resilience layer, and an
upstream "1 request / 3s" politeness throttle.
