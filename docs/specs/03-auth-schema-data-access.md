# Phase 3: Auth, Schema, and Data Access

> **Status:** Complete
> **Spec ID prefix:** `AUTH`
> **Phase:** 3
> **Completed:** 2026-02-20

## Overview

Establishes the authentication system, Convex backend schema, and data access layer that connect the frontend to persistent storage. Authentication uses GitHub OAuth via NextAuth.js, with Convex user records created on first sign-in. The data access layer follows a repository pattern -- interfaces in `@nthtime/data-access` are implemented by adapters that call Convex through REST endpoints authenticated with a service token. The frontend uses TanStack React Query (not the Convex React client) for all data fetching.

## Dependencies

- [FOUND-01] (Nx monorepo)
- [DSST-01] through [DSST-07] (shared types)

## User Flows

### GitHub Sign-In

1. User clicks sign-in button
2. NextAuth redirects to GitHub OAuth
3. User authorizes the application
4. NextAuth callback fires, calling `findOrCreateUser` on Convex with the service token
5. Convex returns or creates the user record
6. NextAuth stores the Convex user ID in the JWT
7. Subsequent requests include the Convex user ID via `session.convexUserId`

### Data Fetching (Frontend)

1. React component calls a hook (e.g., `usePackList()`)
2. Hook uses TanStack React Query to fetch from `/api/v1/packs`
3. REST route handler authenticates via NextAuth session (if auth-gated)
4. Handler calls Convex via `ConvexHttpClient` with `CONVEX_SERVICE_TOKEN`
5. Convex validates the service token and executes the query/mutation
6. Result flows back through the REST response to the React Query cache

## Acceptance Criteria

### Authentication

- [ ] **AUTH-01** -- GitHub OAuth sign-in creates or resolves a Convex user record via `findOrCreateUser` mutation.
- [ ] **AUTH-02** -- The Convex user ID is stored in the NextAuth JWT and accessible as `session.convexUserId`.
- [ ] **AUTH-03** -- Feature flag `NEXT_PUBLIC_FF_AUTH` controls whether auth UI is rendered (defaults to enabled).

### Convex Schema

- [ ] **AUTH-04** -- `packs` table stores name, slug, description, language, framework, version, author, tags, authorUserId, visibility, createdAt, updatedAt with indexes on slug and author.
- [ ] **AUTH-05** -- `challenges` table stores packId, slug, title, prompt, difficulty, tags, timeEstimateSeconds, hints, assertions, referenceSolution, order with indexes on pack and pack+slug, plus a search index on title.
- [ ] **AUTH-06** -- `attempts` table stores userId, challengeId, passed, assertionResults, hintsUsed, timeSeconds with indexes on user+challenge, user, and challenge.
- [ ] **AUTH-07** -- `userSettings` table stores per-user feedback flags, keybindings, darkMode, formatter config, and fileStubs with a by_user index.

### Service Token Authentication

- [ ] **AUTH-08** -- All Convex calls from Next.js server routes use `ConvexHttpClient` authenticated with `CONVEX_SERVICE_TOKEN`.
- [ ] **AUTH-09** -- `convex/service.ts` verifies `SERVICE_TOKEN` on every call and rejects requests with invalid tokens.

### Data Access Layer

- [ ] **AUTH-10** -- `PackRepository` interface defines listPacks, getChallenges, getChallenge, getChallengeByPackAndSlug, and search methods.
- [ ] **AUTH-11** -- `AttemptRepository` interface defines createAttempt and listAttempts methods.
- [ ] **AUTH-12** -- `SettingsRepository` interface defines getSettings and updateSettings methods.
- [ ] **AUTH-13** -- `AuthorRepository` interface defines CRUD methods for author packs and challenges.

### Rate Limiting

- [ ] **AUTH-14** -- Convex rate limiter restricts attempt creation to 10/min and settings updates to 20/min per user.
- [ ] **AUTH-15** -- Author write operations (packs and challenges) are rate-limited to 30/min.

## Technical Context

### Key Files

| File | Role |
|------|------|
| `apps/web/src/lib/auth.ts` | NextAuth.js config with GitHub provider and Convex user resolution |
| `apps/web/src/lib/convex-http.ts` | ConvexHttpClient singleton with lazy getApi() pattern |
| `apps/web/src/lib/api-client.ts` | Frontend fetch wrapper for /api/v1/ routes |
| `apps/web/src/lib/api-helpers.spec.ts` | Test for session helpers and error responses |
| `libs/data-access/src/index.ts` | Repository interface exports |
| `libs/data-access/src/lib/interfaces/pack-repository.ts` | PackRepository interface |
| `libs/data-access/src/lib/interfaces/attempt-repository.ts` | AttemptRepository interface |
| `libs/data-access/src/lib/interfaces/settings-repository.ts` | SettingsRepository interface |
| `libs/data-access/src/lib/interfaces/author-repository.ts` | AuthorRepository interface |
| `convex/schema.ts` | Table definitions and indexes |
| `convex/service.ts` | Service-token-authenticated queries and mutations |
| `convex/rateLimits.ts` | Rate limiter configuration |
| `convex/convex.config.ts` | Rate limiter component wiring |

### Patterns and Decisions

- **Repository pattern** -- interfaces in `@nthtime/data-access` decouple frontend from Convex specifics. Adapters can be swapped for testing or alternative backends.
- **TanStack React Query over Convex React** -- chosen for more control over caching, refetching, and optimistic updates. The provider stack is `SessionProvider` + `QueryProvider` with no Convex React provider.
- **Lazy `getApi()` pattern** -- multiple files lazily `require('../../../../convex/_generated/api')` to avoid TS6059 rootDir errors when TypeScript sees the Convex directory outside the project root.
- **Service token architecture** -- a shared secret (`CONVEX_SERVICE_TOKEN` / `SERVICE_TOKEN`) authenticates server-to-server calls. User identity is passed as a parameter, not via Convex's built-in auth.

### Convex Functions

| Function | Type | Purpose |
|----------|------|---------|
| `service.findOrCreateUser` | mutation | Resolve or create user on OAuth sign-in |
| `service.listPacksAuth` | query | List packs with user-specific pass counts |
| `service.getChallengesAuth` | query | Get pack challenges with user-specific status |
| `packs.list` | query | Public pack listing with language/difficulty filters |
| `packs.getChallenges` | query | Public pack detail with challenge list |
| `packs.search` | query | Full-text search on challenge titles |
| `challenges.get` | query | Get single challenge by ID |
| `challenges.getByPackAndSlug` | query | Get challenge by pack slug + challenge slug |
| `attempts.create` | mutation | Record a new attempt (rate-limited) |
| `attempts.list` | query | List attempts for user + challenge |
| `settings.get` | query | Get user settings with defaults |
| `settings.update` | mutation | Patch user settings (rate-limited) |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth OAuth flow |
| `/api/v1/packs` | GET | List packs with filters |
| `/api/v1/packs/[slug]` | GET | Pack detail with challenges |
| `/api/v1/packs/[slug]/challenges/[challengeSlug]` | GET | Single challenge by pack+slug |
| `/api/v1/challenges/[id]` | GET | Single challenge by ID |
| `/api/v1/challenges/[id]/attempts` | GET | User attempts for challenge |
| `/api/v1/attempts` | POST | Create attempt |
| `/api/v1/settings` | GET, PATCH | Read/update user settings |
| `/api/v1/search` | GET | Search challenges |
| `/api/v1/auth/session` | GET | Current session |

## Test Coverage

### Unit Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| AUTH-08 | `apps/web/src/lib/api-client.spec.ts` | request() returns parsed JSON, sends Content-Type, builds query strings |
| AUTH-08 | `apps/web/src/lib/api-helpers.spec.ts` | getSessionUserId, requireAuth, error helpers |

### Convex Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| AUTH-07 | `convex/__tests__/settings.spec.ts` | get returns defaults, update creates/patches settings |
| AUTH-14 | `convex/__tests__/settings.spec.ts` | update rejects unauthenticated user |
| AUTH-04, AUTH-05 | `convex/__tests__/packs.spec.ts` | list returns packs, filters by language/tags |
| AUTH-06 | `convex/__tests__/attempts.spec.ts` | create stores attempt, list returns user attempts |
| AUTH-09 | `convex/__tests__/admin.spec.ts` | seedPack rejects invalid admin secret |

## Open Questions

- None at this time.
