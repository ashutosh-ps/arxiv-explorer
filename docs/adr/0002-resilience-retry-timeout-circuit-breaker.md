# ADR 0002 — Resilience: retry, timeout, and circuit breaker around external calls

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

The app makes two outbound calls that can fail:

1. **Backend → arXiv** (gateway miss-path fetch). arXiv can be slow, return transient
   `5xx`, or drop connections. Today a miss waits indefinitely and a downstream outage
   would let every request hang or hammer a struggling upstream.
2. **Frontend → HuggingFace** (`getCodeLinks`). The archived Papers-with-Code dataset now
   returns `422` for every query. The code degrades (returns `[]`) but never caches the
   failure, so every `PaperCard` re-requests a known-dead endpoint, flooding the console.

## Decision

Add small, composable resilience primitives and apply the right ones to each call.

### Backend — `api/_lib/resilience.js`

- `retry(fn, opts)` — exponential backoff with jitter. Retries only when `isRetryable(err)`
  is true (network errors and `5xx`); never retries `4xx`. `sleep` is injectable for tests.
- `withTimeout(fn, ms)` — invokes `fn(signal)` and aborts + rejects if it exceeds `ms`,
  using a real `AbortController` so the arXiv fetch is genuinely cancelled.
- `createCircuitBreaker({ failureThreshold, cooldownMs, now })` — closed → open (after
  `failureThreshold` consecutive failures) → half-open (after `cooldownMs`) → closed on a
  probe success, or back to open on failure. While open, calls short-circuit immediately.

Composed in the gateway miss path:
`breaker.exec(() => retry(() => withTimeout(signal => fetch(url, { signal }), ms)))`.
On exhausted retries or an open circuit the producer throws, so the gateway returns `502`
and the failure is not cached.

### Frontend — `src/lib/circuit-breaker.js`

The same circuit-breaker concept (ESM, Jest-tested), used inside `getCodeLinks`: once open,
return `[]` immediately with no network call. Retry is intentionally omitted — a `422` is a
permanent rejection, so retrying is pointless.

### Configuration (env, with defaults)

`ARXIV_RETRY_ATTEMPTS=3`, `ARXIV_TIMEOUT_MS=8000`, `ARXIV_BREAKER_THRESHOLD=5`,
`ARXIV_BREAKER_COOLDOWN_MS=30000`, threaded through `create-handler.js`. The frontend breaker
uses inline defaults (threshold 3, 60s cooldown).

## Consequences

- A transient arXiv blip is ridden out by retries; a sustained outage fails fast (`502`)
  instead of hanging or hammering, and recovers automatically via the half-open probe.
- The `getCodeLinks` storm stops after a few failures; papers render without code links.
- The circuit breaker is duplicated across runtimes (CommonJS backend, ESM frontend) because
  the CRA build cannot import from `api/`. Each copy is ~30 lines and independently tested.

## Out of scope

Bulkheads, serving stale cache when the circuit is open, and metrics/dashboards (the latter
belongs with the future observability work).
