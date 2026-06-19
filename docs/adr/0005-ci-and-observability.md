# ADR 0005 — CI/CD and observability

- **Status:** Accepted
- **Date:** 2026-06-20

## Context

The project has grown a real backend (gateway, auth, per-user data) and a two-runner test
setup (`node:test` for the API, Jest for the frontend), but nothing runs them automatically,
there is no liveness probe, and request behaviour isn't logged in a machine-readable way. The
README also predates the backend work and still describes bookmarks as localStorage-only.

## Decision

Add continuous integration, lightweight account-free observability, and bring the docs up to
date. Managed services (Sentry, Grafana) are intentionally out of scope — disproportionate for
a low-traffic serverless app; the same signals come from structured stdout logs (which Vercel
captures) plus a one-off load test.

### CI — GitHub Actions (`.github/workflows/ci.yml`)

On push and pull request: Node 22 → `npm ci` → `npm run test:api` → `npm test` (CI mode) →
`npm run build`. The build step also runs ESLint, which CI treats as errors.

The default CRA `src/App.test.js` is removed: it is dead boilerplate that cannot run (Jest
can't resolve `react-router-dom` v7's ESM entry) and tests nothing real. Removing it makes the
frontend suite green and CI meaningful.

### Observability (account-free)

- `api/health.js` → `GET /api/health` returns `{ status, store, db, time }`, reporting which
  store/db adapters are active (memory vs upstash/postgres) — a standard readiness probe.
- `createLogger()` emits one JSON line per event to stdout. The gateway logs each request
  (`method`, `cache: HIT|MISS`, `status`, `durationMs`), giving SLI-style structured logs with
  no external infrastructure. The writer and clock are injectable for testing.

### Documentation

- The target architecture diagram is saved to `docs/architecture.svg` (it now matches what is
  built) and linked from the README.
- The README is rewritten to describe the real system (server-backed per-user bookmarks, JWT
  auth, the cached/rate-limited/resilient gateway), with Architecture (+ the five ADRs),
  Backend/API, Testing, and Deployment sections.
- `.env.example` documents `DATABASE_URL`, `JWT_SECRET`, and the optional Upstash/tuning vars.

## Consequences

- Every push/PR is linted, tested (121 tests across both runners), and built automatically.
- A health endpoint and structured request logs exist with zero external accounts; wiring
  Sentry or a metrics backend later is additive.
- The docs reflect reality, and reviewers get an architecture diagram and decision records.

## Out of scope

Sentry error tracking, Grafana/Prometheus metrics dashboards, distributed tracing, and metrics
aggregation.
