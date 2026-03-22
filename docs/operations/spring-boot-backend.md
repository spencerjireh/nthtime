# Spring Boot Backend

The nthtime backend runs on Spring Boot 3.5 with Java 25 and PostgreSQL 16. The backend code lives in `services/api/` and handles pack/challenge storage, user attempts, settings persistence, and GitHub OAuth authentication.

All browser traffic reaches Spring Boot through Next.js API route proxies -- the browser never communicates directly with Spring Boot.

## Schema

The database schema is managed by Flyway SQL migrations in `services/api/src/main/resources/db/migration/`:

- **V1** -- 6 tables: `app_users`, `auth_accounts`, `packs`, `challenges`, `attempts`, `user_settings`
- **V2** -- PostgreSQL tsvector search index on challenge titles
- **V3** -- Spring Session JDBC tables for session storage

### JPA Entities

| Entity | Table | Key Columns |
|--------|-------|-------------|
| `AppUser` | `app_users` | `id`, `name`, `email`, `image`, `github_id` |
| `AuthAccount` | `auth_accounts` | `id`, `user_id` (FK), `provider`, `provider_account_id` |
| `Pack` | `packs` | `id`, `slug`, `name`, `description`, `language`, `framework`, `version`, `author`, `tags` |
| `Challenge` | `challenges` | `id`, `pack_id` (FK), `slug`, `title`, `prompt`, `difficulty`, `order`, `assertions`, `reference_solution` |
| `Attempt` | `attempts` | `id`, `user_id` (FK), `challenge_id` (FK), `passed`, `assertion_results`, `hints_used`, `time_seconds` |
| `UserSettings` | `user_settings` | `id`, `user_id` (FK), `feedback`, `keybindings`, `dark_mode`, `formatter` |

JSONB columns (`assertions`, `reference_solution`, `formatter`, `assertion_results`) use `hypersistence-utils` `JsonType`. PostgreSQL text arrays (`tags`, `hints`) use `StringArrayType`.

## REST Controllers

11 REST controllers map to `/api/*` endpoints:

| Controller | Base Path | Description |
|------------|-----------|-------------|
| `PackController` | `/api/packs` | List packs, get pack by slug |
| `ChallengeController` | `/api/challenges` | Get challenge by ID, list by pack |
| `AttemptController` | `/api/attempts` | Create and list attempts |
| `SettingsController` | `/api/settings` | Get/update user settings |
| `AuthController` | `/api/auth` | OAuth2 login/logout endpoints |
| `SessionController` | `/api/auth/session` | Session status check |
| `SearchController` | `/api/search` | Full-text search (tsvector) |
| `AuthorPackController` | `/api/author/packs` | Pack authoring CRUD |
| `AuthorChallengeController` | `/api/author/challenges` | Challenge authoring CRUD |
| `AdminController` | `/api/admin` | Seed/sync operations |
| `HealthController` | `/api/health` | Health check |
| `CliController` | `/api/cli` | CLI-specific pack/challenge endpoints |

Response DTOs use `@JsonProperty("_id")` to match frontend expectations.

## Services

9 service classes contain all business logic:

| Service | Responsibilities |
|---------|-----------------|
| `PackService` | Pack listing, filtering, slug lookup, challenge counts |
| `ChallengeService` | Challenge retrieval, per-user attempt status |
| `AttemptService` | Attempt creation with rate limiting, attempt history |
| `SettingsService` | Settings get/update with defaults, rate limiting |
| `SearchService` | PostgreSQL tsvector full-text search |
| `AuthorPackService` | Pack CRUD for authors, slug validation |
| `AuthorChallengeService` | Challenge CRUD, reordering |
| `AdminService` | Pack seeding and sync (delete stale) |
| `UserService` | User resolution from OAuth2 principal |

## Rate Limiting

Rate limiting uses Bucket4j with in-memory token buckets:

| Endpoint | Limit |
|----------|-------|
| `POST /api/attempts` | 10 per minute per user |
| `PUT /api/settings` | 20 per minute per user |
| Author write operations | 30 per minute per user |

## GitHub OAuth

Authentication uses Spring Security OAuth2 Client with Spring Session JDBC.

### Flow

1. Browser navigates to `GET /api/auth/signin` (Next.js route)
2. Next.js proxies to Spring Boot's OAuth2 authorization endpoint
3. Spring Boot redirects to GitHub with `redirect_uri` pointing back to Next.js
4. GitHub callback reaches `GET /api/auth/callback/github` (Next.js) and is forwarded to Spring Boot
5. Spring Boot creates/resolves the user, sets `JSESSIONID` cookie via Spring Session
6. Next.js forwards `Set-Cookie` to the browser

### Session Management

Sessions are stored in PostgreSQL via Spring Session JDBC (tables created by V3 migration). The `JSESSIONID` cookie is forwarded by the Next.js proxy layer on every API request.

The `useAuthSession()` hook (TanStack Query) fetches `/api/v1/auth/session` to check auth status. Components use this instead of any provider-based auth context.

## Environment Variables

### Spring Boot

| Variable | Description |
|----------|-------------|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `ADMIN_SECRET` | Secret for seed/sync operations |
| `FRONTEND_URL` | Public URL for OAuth redirects |

### Next.js

| Variable | Description |
|----------|-------------|
| `SPRING_BOOT_URL` | Internal URL to Spring Boot (default: `http://api:8080`) |
| `FRONTEND_URL` | Public URL (default: `http://localhost:3000`) |

## Database Setup

### Local development

Use Docker Compose to start PostgreSQL and Spring Boot together:

```bash
docker compose up
```

This starts PostgreSQL 16 (internal, port 5432), Spring Boot API (internal, port 8080), and Next.js (public, port 3000).

### Manual setup

1. Start a PostgreSQL 16 instance
2. Create a database (e.g., `nthtime`)
3. Set environment variables and run Spring Boot:

```bash
cd services/api
DB_HOST=localhost DB_PORT=5432 DB_NAME=nthtime DB_USER=postgres DB_PASSWORD=postgres ./gradlew bootRun
```

Flyway runs migrations automatically on startup.

## Testing

:::tip Testcontainers
Spring Boot tests use Testcontainers -- no local PostgreSQL instance required. Each test run spins up an ephemeral container, applies Flyway migrations, and tears it down automatically.
:::

```bash
cd services/api && ./gradlew test
```
