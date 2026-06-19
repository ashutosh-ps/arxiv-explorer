# ADR 0004 — Per-user bookmarks

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

ADR 0003 (4a) added identity. The library/bookmarks still live in `localStorage`
(`storageService.js`) — per-device and anonymous. 4b moves bookmarks to the server, scoped
to the authenticated user, so the library follows the account across devices.

## Decision

Store bookmarks in the database keyed by user, expose a protected API, and drive the UI from
a `BookmarksContext`. Bookmarking requires an account; a logged-out click opens the sign-in
modal (we are not migrating anonymous localStorage data — there are no real users to migrate).

### Data

A `bookmarks` table: `id`, `user_id` (FK → users), `paper_id` (text), `paper` (jsonb — the
full paper so the library renders without re-fetching), `created_at`, and
`UNIQUE(user_id, paper_id)`. The unique constraint makes "add" idempotent via
`ON CONFLICT DO NOTHING`. Both DB adapters (memory, Postgres) gain `listBookmarks(userId)`,
`addBookmark(userId, paper)`, `removeBookmark(userId, paperId)`.

### API

`createBookmarksHandler({ db, jwtSecret })` — a single handler dispatching by method, **all
requiring authentication** (`getUserId` → `401`):

- `GET /api/bookmarks` → the caller's bookmarks (newest first).
- `POST /api/bookmarks` `{ paper }` → add (idempotent).
- `DELETE /api/bookmarks?paperId=…` → remove.
- anything else → `405`.

Exposed in prod as `api/bookmarks.js` and mounted in dev via `setupProxy.js`.

**Authorization is the central invariant:** every query filters by the `user_id` derived from
the auth cookie. The API never accepts a client-supplied user id. Tests assert that one user
cannot read or delete another user's bookmarks.

### Frontend

- `bookmarksApi.js` — `list` / `add` / `remove` with `credentials: 'include'`.
- `BookmarksContext` — loads the user's bookmarks once they're authenticated, exposes a sync
  `isBookmarked(id)` (from an in-memory set), optimistic async `addBookmark`/`removeBookmark`,
  and the `bookmarks` list. Clears on logout.
- The auth-modal open state moves into `AuthContext` (`openAuth()`), so a logged-out bookmark
  click anywhere can prompt sign-in.
- `PaperCard` / `PaperModal` use `useBookmarks()` + `useAuth()` instead of `storageService`.
- `LibraryPage` reads bookmarks from the context; logged out → a sign-in prompt. The history
  tab still uses `localStorage`.

## Consequences

- Bookmarks are per-user and portable; reads are sync (in-memory set), writes are async and
  optimistic.
- The unused `storageService` bookmark functions are removed; history/search-history remain.
- Testable on the in-memory adapter; production uses Postgres once `DATABASE_URL` is set and
  `npm run db:migrate` has been run (now also creating the `bookmarks` table).

## Out of scope

History/search-history migration, collections, and localStorage→account migration.
