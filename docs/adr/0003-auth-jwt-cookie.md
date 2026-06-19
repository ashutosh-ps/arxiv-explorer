# ADR 0003 — Authentication: email/password with a JWT in an httpOnly cookie

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

The app has no concept of users. The "library", history, and search history live in the
browser's `localStorage` (`storageService.js`) — per-device, anonymous, and lost on a new
device or a cleared cache. To make data per-user and portable we need identity (auth) and
server-side persistence.

This ADR covers **4a — the auth foundation only**. Per-user bookmarks (4b) build on top.

## Decision

Build email/password authentication ourselves (no managed provider), issue a JWT, and carry
it in an httpOnly cookie.

### Persistence — pluggable, env-selected (mirrors the store/cache adapters)

- `api/_lib/db/memory-db.js` — in-memory users; default for dev and tests, no account needed.
- `api/_lib/db/postgres-db.js` — Neon Postgres; used when `DATABASE_URL` is set. The `sql`
  tagged-template function is injectable so query construction is unit-tested without a DB.
- `api/_lib/db/index.js` — `createDb({ env })` chooses the adapter.
- `api/_lib/db/schema.sql` + `npm run db:migrate` — a `users` table.

### Auth primitives — `api/_lib/auth/`

- `password.js` — hash/verify via **bcryptjs** (pure JS; no native build on Vercel).
- `jwt.js` — hand-rolled **HS256** with `node:crypto` (base64url + HMAC + `timingSafeEqual` +
  `exp`). No dependency. *(Production would typically use `jose`/`jsonwebtoken`.)*
- `cookie.js` — serialize `Set-Cookie: token=…; HttpOnly; SameSite=Lax; Secure; Max-Age` and
  read the token back from `req.headers.cookie`.
- `require-auth.js` — `getUserId(req, secret)` → verified user id or `null`.

### Handlers — shared by dev and prod

`createAuthHandlers({ db, jwtSecret, secure })` → `{ signup, login, logout, me }`. Status
codes: `201` signup, `200` login/me, `400` bad input, `401` bad creds / no session, `409`
duplicate email. Production exposes them as `api/auth/{signup,login,logout,me}.js`; the dev
server mounts the same handlers in `setupProxy.js` (with a small JSON body reader).

### Frontend

`AuthContext` (hydrates the session via `GET /api/auth/me`), an `authApi` using
`credentials: 'include'`, a login/signup form, and the header reflecting auth state.

### Token storage

The JWT lives in an httpOnly, `SameSite=Lax`, `Secure` cookie — unreadable by JS (XSS-safe),
auto-sent same-origin on Vercel (no CORS), with `SameSite` covering most CSRF.

## Consequences

- Identity and session work end to end; we own the security surface.
- Testable without infrastructure: everything runs against `memory-db` via `node:test`.
- Production-ready when `DATABASE_URL` + `JWT_SECRET` are set — no code change.
- New dependencies: `bcryptjs`, `@neondatabase/serverless` (the latter lazy-required, prod path only).

## Out of scope (later / YAGNI)

Per-user bookmarks (4b), history/search-history, social login, email verification, password
reset, and refresh tokens (a single ~7-day JWT for now). A cheap, recommended follow-up:
reuse the existing rate limiter on `/api/auth/login` to throttle brute-force attempts.
