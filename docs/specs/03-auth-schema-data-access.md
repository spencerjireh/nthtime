# Phase 3: Auth, Schema, and Data Access

> **Status:** Complete
> **Spec ID prefix:** `AUTH`
> **Phase:** 3
> **Completed:** 2026-02-20

## Overview

Establishes the authentication system, Spring Boot backend, and data access layer that connect the frontend to persistent storage. Authentication uses GitHub OAuth via Spring Security OAuth2 Client + Spring Session JDBC, with PostgreSQL user records created on first sign-in. The data access layer follows a repository pattern -- interfaces in `@nthtime/data-access` are implemented by thin Next.js proxy routes that forward requests to Spring Boot with session cookies. The frontend uses TanStack React Query for all data fetching.

## Dependencies

- [FOUND-01] (Nx monorepo)
- [DSST-01] through [DSST-07] (shared types)

## User Flows

### GitHub Sign-In

1. User clicks sign-in button
2. Next.js redirects to Spring Boot OAuth2 authorization endpoint
3. Spring Boot redirects to GitHub
4. GitHub callback -> Next.js `/api/auth/callback/github` -> forwarded to Spring Boot
5. Spring Boot creates/resolves AppUser + AuthAccount, sets JSESSIONID via Spring Session JDBC
6. Next.js forwards Set-Cookie to browser

### Data Fetching (Frontend)

1. React component calls a hook (e.g., `usePackList()`)
2. Hook uses TanStack React Query to fetch from `/api/v1/packs`
3. Next.js API route proxies to Spring Boot, forwarding JSESSIONID cookie
4. Spring Boot validates session via Spring Session JDBC, executes query
5. Result flows back through proxy to React Query cache

## Acceptance Criteria

### Authentication

- [ ] **AUTH-01** -- GitHub OAuth sign-in creates or resolves an AppUser + AuthAccount in PostgreSQL via Spring Security OAuth2.
- [ ] **AUTH-02** -- Session stored in PostgreSQL via Spring Session JDBC; JSESSIONID cookie used for authentication.
- [ ] **AUTH-03** -- Feature flag `NEXT_PUBLIC_FF_AUTH` controls whether auth UI is rendered (defaults to enabled).

### Database Schema

- [ ] **AUTH-04** -- `packs` table (JPA entity `Pack`) with columns: name, slug, description, language, framework, version, author, tags, authorUserId, visibility, createdAt, updatedAt with indexes on slug and author.
- [ ] **AUTH-05** -- `challenges` table (JPA entity `Challenge`) with JSONB columns for assertions and referenceSolution, plus columns for packId, slug, title, prompt, difficulty, tags, timeEstimateSeconds, hints, order with indexes on pack and pack+slug, plus a tsvector search index on title.
- [ ] **AUTH-06** -- `attempts` table (JPA entity `Attempt`) with JSONB for assertionResults, plus userId, challengeId, passed, hintsUsed, timeSeconds with indexes on user+challenge, user, and challenge.
- [ ] **AUTH-07** -- `user_settings` table (JPA entity `UserSettings`) with per-user feedback flags, keybindings, darkMode, formatter config, and fileStubs.

### Session-Based Authentication

- [ ] **AUTH-08** -- All Next.js API routes proxy to Spring Boot via `spring-boot-proxy.ts`, forwarding JSESSIONID cookie.
- [ ] **AUTH-09** -- Spring Security validates session on every request; unauthenticated requests return 401.

### Data Access Layer

- [ ] **AUTH-10** -- `PackRepository` interface defines listPacks, getChallenges, getChallenge, getChallengeByPackAndSlug, and search methods.
- [ ] **AUTH-11** -- `AttemptRepository` interface defines createAttempt and listAttempts methods.
- [ ] **AUTH-12** -- `SettingsRepository` interface defines getSettings and updateSettings methods.
- [ ] **AUTH-13** -- `AuthorRepository` interface defines CRUD methods for author packs and challenges.

### Rate Limiting

- [ ] **AUTH-14** -- Bucket4j rate limiter (Spring Boot) restricts attempt creation to 10/min and settings updates to 20/min per user.
- [ ] **AUTH-15** -- Author write operations rate-limited to 30/min.

## Technical Context

### Key Files

| File | Role |
|------|------|
| `services/api/src/main/java/.../entity/*.java` | JPA entities (AppUser, AuthAccount, Pack, Challenge, Attempt, UserSettings) |
| `services/api/src/main/java/.../controller/*.java` | REST controllers (11 controllers mapping to /api/* endpoints) |
| `services/api/src/main/java/.../config/SecurityConfig.java` | Spring Security OAuth2 + Spring Session JDBC configuration |
| `services/api/src/main/java/.../config/RateLimitConfig.java` | Bucket4j rate limiter configuration |
| `services/api/src/main/resources/db/migration/` | Flyway SQL migrations (V1-V3) |
| `apps/web/src/lib/spring-boot-proxy.ts` | Proxy function forwarding requests to Spring Boot with cookie |
| `apps/web/src/lib/api-client.ts` | Frontend fetch wrapper for /api/v1/ routes |
| `apps/web/src/lib/api-helpers.spec.ts` | Test for session helpers and error responses |
| `libs/data-access/src/index.ts` | Repository interface exports |
| `libs/data-access/src/lib/interfaces/pack-repository.ts` | PackRepository interface |
| `libs/data-access/src/lib/interfaces/attempt-repository.ts` | AttemptRepository interface |
| `libs/data-access/src/lib/interfaces/settings-repository.ts` | SettingsRepository interface |
| `libs/data-access/src/lib/interfaces/author-repository.ts` | AuthorRepository interface |

### Patterns and Decisions

- **Repository pattern** -- interfaces in `@nthtime/data-access` decouple frontend from backend specifics. Implemented by Spring Data JPA repositories in `services/api`.
- **TanStack React Query** -- chosen for control over caching, refetching, and optimistic updates. The provider stack is `QueryProvider` only (no SessionProvider).
- **Proxy pattern** -- Next.js `/api/v1/*` routes are thin proxies that forward requests to Spring Boot `/api/*` with JSESSIONID cookie forwarding via `spring-boot-proxy.ts`.
- **Session architecture** -- JSESSIONID cookie, Spring Session JDBC stores sessions in PostgreSQL. No JWTs or service tokens.

### Spring Boot Endpoints

| Endpoint | Controller | Purpose |
|----------|-----------|---------|
| `GET /api/auth/session` | AuthController | Session status |
| `GET /api/packs` | PackController | List packs with filters |
| `GET /api/packs/{slug}` | PackController | Pack detail with challenges |
| `GET /api/search?q=` | SearchController | Full-text search on challenge titles |
| `GET /api/challenges/{id}` | ChallengeController | Single challenge by ID |
| `GET /api/packs/{packSlug}/challenges/{challengeSlug}` | ChallengeController | Challenge by pack+slug |
| `POST /api/attempts` | AttemptController | Create attempt (rate-limited) |
| `GET /api/challenges/{id}/attempts` | AttemptController | List attempts for user+challenge |
| `GET /api/settings` | SettingsController | Get user settings |
| `PATCH /api/settings` | SettingsController | Update user settings (rate-limited) |
| `POST /api/admin/seed` | AdminController | Seed packs from JSON |
| `POST /api/admin/sync` | AdminController | Sync packs (seed + delete stale) |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/signin` | GET | Initiate OAuth flow via Spring Boot |
| `/api/auth/signout` | GET | End session |
| `/api/auth/callback/github` | GET | GitHub OAuth callback forwarded to Spring Boot |
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

### Spring Boot Tests

| Criterion | Test Location | Test Description |
|-----------|--------------|-----------------|
| AUTH-04 through AUTH-07 | `services/api/src/test/java/...` | JPA entity and repository integration tests (Testcontainers + PostgreSQL) |
| AUTH-08, AUTH-09 | `services/api/src/test/java/...` | Controller integration tests with Spring Security |
| AUTH-14, AUTH-15 | `services/api/src/test/java/...` | Rate limiting integration tests |

## Open Questions

- None at this time.
