# Migrating nthtime from Convex to Spring Boot

A step-by-step walkthrough of how the nthtime project replaced its entire Convex backend (serverless functions, database, auth, rate limiting) with a self-hosted Java Spring Boot API backed by PostgreSQL.

## Table of Contents

1. [Before You Start](#1-before-you-start)
2. [Understand the Architecture Change](#2-understand-the-architecture-change)
3. [Read Every Contract Before Writing Code](#3-read-every-contract-before-writing-code)
4. [Phase 1: Scaffold the Spring Boot Project](#4-phase-1-scaffold-the-spring-boot-project)
5. [Phase 2: Write Database Migrations](#5-phase-2-write-database-migrations)
6. [Phase 3: Create JPA Entities](#6-phase-3-create-jpa-entities)
7. [Phase 4: Create Repository Interfaces](#7-phase-4-create-repository-interfaces)
8. [Phase 5: Build the Service Layer](#8-phase-5-build-the-service-layer)
9. [Phase 6: Build REST Controllers](#9-phase-6-build-rest-controllers)
10. [Phase 7: Wire Up Authentication](#10-phase-7-wire-up-authentication)
11. [Phase 8: Add Rate Limiting](#11-phase-8-add-rate-limiting)
12. [Phase 9: Add Exception Handling and DTOs](#12-phase-9-add-exception-handling-and-dtos)
13. [Phase 10: Rewrite Next.js API Routes as Proxies](#13-phase-10-rewrite-nextjs-api-routes-as-proxies)
14. [Phase 11: Migrate the Auth UI](#14-phase-11-migrate-the-auth-ui)
15. [Phase 12: Update Docker Compose](#15-phase-12-update-docker-compose)
16. [Phase 13: Update CI Pipeline](#16-phase-13-update-ci-pipeline)
17. [Phase 14: Migrate the Seed Tool and E2E Helpers](#17-phase-14-migrate-the-seed-tool-and-e2e-helpers)
18. [Phase 15: Delete Dead Code](#18-phase-15-delete-dead-code)
19. [Phase 16: Update Documentation and Config](#19-phase-16-update-documentation-and-config)
20. [Gotchas and Lessons Learned](#20-gotchas-and-lessons-learned)
21. [Verification Checklist](#21-verification-checklist)

---

## 1. Before You Start

### Prerequisites

- Java 21 LTS (Temurin recommended)
- Gradle 8.x (or use the Gradle wrapper)
- PostgreSQL 16 (or Docker for local dev)
- Node.js 22+, pnpm 10+
- The existing Convex codebase, fully functional

### Why We Did This

Convex is a managed serverless platform. It worked well for prototyping but we wanted:
- Full control over the database (migrations, backups, direct SQL)
- Self-hosted deployment on Coolify (no vendor lock-in)
- Standard Java/Spring ecosystem (easier to hire for, more tooling)
- A clear separation between the API and the frontend

### The Golden Rule

**Do not break the frontend.** The entire point of this migration is to swap the backend without the browser knowing. Every API response must have the exact same JSON shape as before. The frontend treats backend IDs as opaque strings and never constructs URLs to the backend directly -- this makes the migration possible.

---

## 2. Understand the Architecture Change

### Before (Convex)

```
Browser -> Next.js (port 3000)
             |
             +--> /api/v1/* routes call Convex via ConvexHttpClient
             |      (authenticated with CONVEX_SERVICE_TOKEN)
             |
             +--> NextAuth handles OAuth, stores session in JWT
             |
             v
           Convex Cloud (managed serverless)
             - Schema + server functions
             - Built-in auth (@convex-dev/auth)
             - Built-in rate limiting (@convex-dev/rate-limiter)
```

### After (Spring Boot)

```
Browser -> Next.js (port 3000, publicly exposed)
             |
             +--> /api/v1/* routes proxy to Spring Boot
             |      (forwarding JSESSIONID cookie)
             |
             +--> /api/auth/* routes proxy OAuth flow
             |
             v
           Spring Boot (port 8080, internal only)
             |
             +--> Spring Security OAuth2 (GitHub)
             +--> Spring Session JDBC (sessions in PostgreSQL)
             +--> Bucket4j (rate limiting)
             +--> Spring Data JPA + Flyway (database)
             |
             v
           PostgreSQL (port 5432, internal only)
```

The critical insight: **the browser never talks directly to Spring Boot.** All traffic goes through Next.js, which acts as a reverse proxy on the internal Docker network. This means:
- Only port 3000 is exposed publicly
- Spring Boot does not need its own TLS certificate
- Session cookies flow naturally through Next.js

---

## 3. Read Every Contract Before Writing Code

Before writing a single line of Spring Boot code, read these files to understand the exact contracts you need to replicate:

| File | What It Tells You |
|---|---|
| `convex/schema.ts` | Every table, field name, type, default value, and index |
| `convex/service.ts` | All 27 authenticated business logic functions (the single most important file) |
| `convex/_helpers.ts` | Shared logic: visibility filtering, pack ownership checks, attempt status computation |
| `convex/packs.ts`, `convex/challenges.ts` | Public query functions |
| `convex/authorPacks.ts`, `convex/authorChallenges.ts` | Author CRUD with ownership enforcement |
| `convex/admin.ts` | Seed and sync mutations |
| `convex/rateLimits.ts` | Rate limit configuration per operation |
| `apps/web/src/lib/data-access/convex-server-adapter.ts` | The adapter layer -- defines the exact TypeScript interface between Next.js and the backend |
| `apps/web/src/lib/api-client.ts` | Client-side fetch functions -- reveals the exact response shapes the frontend expects |
| `apps/web/src/lib/auth.ts` | NextAuth config -- how sign-in works today |
| `apps/web/src/lib/api-helpers.ts` | `getSessionUserId()` and `requireAuth()` used by all API routes |

Make a spreadsheet mapping every Convex function to its future Spring Boot service method. The plan document has this table in Section 6.1. You want zero ambiguity about what each endpoint does, what it returns, and what auth it requires.

---

## 4. Phase 1: Scaffold the Spring Boot Project

Create the project at `services/api/` within the monorepo.

### 4.1 Directory structure

```
services/api/
  build.gradle.kts          # Dependencies and build config
  settings.gradle.kts       # Project name
  Dockerfile                # Multi-stage build for production
  gradle/wrapper/           # Gradle wrapper (download from gradle.org)
  src/
    main/
      java/com/spencerjireh/nthtime/
        NthtimeApplication.java
        config/
        controller/
        dto/request/
        dto/response/
        entity/
        exception/
        repository/
        service/
      resources/
        application.yml
        application-dev.yml
        application-test.yml
        db/migration/
    test/
      java/com/spencerjireh/nthtime/
```

### 4.2 Key files to create

1. **`settings.gradle.kts`** -- just sets `rootProject.name = "nthtime-api"`.

2. **`build.gradle.kts`** -- Spring Boot 3.4, Java 21. Key dependencies:
   - `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`
   - `spring-boot-starter-oauth2-client`, `spring-session-jdbc`
   - `postgresql`, `flyway-core`, `flyway-database-postgresql`
   - `bucket4j-core` (rate limiting)
   - `hypersistence-utils-hibernate-63` (JSONB/array column support)
   - `springdoc-openapi-starter-webmvc-ui` (API docs)
   - Test: `spring-boot-starter-test`, `spring-security-test`, `testcontainers`

   See: `services/api/build.gradle.kts`

3. **`application.yml`** -- datasource, JPA (validate mode, Flyway manages schema), Spring Session (JDBC, 7-day timeout), OAuth2 client (GitHub), Jackson (non-null, ISO dates).

   See: `services/api/src/main/resources/application.yml`

4. **`NthtimeApplication.java`** -- standard `@SpringBootApplication` main class.

### 4.3 Get the Gradle wrapper

```bash
cd services/api
curl -fsSL https://raw.githubusercontent.com/gradle/gradle/v8.12.1/gradle/wrapper/gradle-wrapper.properties \
  -o gradle/wrapper/gradle-wrapper.properties
# Download gradlew, gradlew.bat, and gradle-wrapper.jar from the Gradle distribution
```

Or generate with `gradle wrapper` if you have Gradle installed globally.

---

## 5. Phase 2: Write Database Migrations

Flyway runs SQL migrations in order. Create three files in `src/main/resources/db/migration/`:

### V1__initial_schema.sql

Maps every Convex table to PostgreSQL. Key decisions:
- `BIGSERIAL` primary keys (auto-increment Long) instead of Convex's opaque string IDs
- `TIMESTAMPTZ` for all timestamps
- `TEXT[]` for tags and hints arrays (PostgreSQL native arrays)
- `JSONB` for assertions, referenceSolution, assertionResults, formatter
- Foreign keys with `ON DELETE CASCADE` where appropriate
- Unique constraints: `(provider, provider_account_id)` on auth_accounts, `(pack_id, slug)` and `(pack_id, "order")` on challenges

Six tables: `app_users`, `auth_accounts`, `packs`, `challenges`, `attempts`, `user_settings`.

See: `services/api/src/main/resources/db/migration/V1__initial_schema.sql`

### V2__search_index.sql

Creates a `tsvector` generated column on challenges for full-text search, with a GIN index:
```sql
ALTER TABLE challenges ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (to_tsvector('english', title)) STORED;
CREATE INDEX idx_challenges_search ON challenges USING GIN(search_vector);
```

See: `services/api/src/main/resources/db/migration/V2__search_index.sql`

### V3__spring_session_tables.sql

Spring Session JDBC needs its own tables. Copy the schema from the Spring docs (SPRING_SESSION, SPRING_SESSION_ATTRIBUTES). We manage this via Flyway instead of letting Spring auto-create them, so `spring.session.jdbc.initialize-schema` is set to `never`.

See: `services/api/src/main/resources/db/migration/V3__spring_session_tables.sql`

---

## 6. Phase 3: Create JPA Entities

One entity per table, in `entity/`. The tricky parts:

### JSONB columns

Use `hypersistence-utils` `@Type(JsonType.class)` annotation. At the Java level, type these as `Object` -- Jackson handles serialization. In DTOs, map them to proper types.

```java
@Type(JsonType.class)
@Column(nullable = false, columnDefinition = "jsonb")
private Object assertions;
```

### PostgreSQL text arrays

Use `@Type(StringArrayType.class)`:
```java
@Type(StringArrayType.class)
@Column(name = "tags", columnDefinition = "text[]")
private String[] tags = {};
```

### The "order" column

`order` is a SQL reserved word. Quote it in the `@Column` annotation:
```java
@Column(name = "\"order\"", nullable = false)
private int order = 1;
```

### Files

See the 6 entity files in `services/api/src/main/java/com/spencerjireh/nthtime/entity/`:
- `AppUser.java`, `AuthAccount.java`, `Pack.java`, `Challenge.java`, `Attempt.java`, `UserSettings.java`

---

## 7. Phase 4: Create Repository Interfaces

Spring Data JPA repositories -- extend `JpaRepository<Entity, Long>` and add custom queries.

The important custom queries:
- `PackRepository.findBySlug()`, `findVisiblePacks(userId)`, `findPublicPacks()`
- `ChallengeRepository.findByPackIdOrderByOrderAsc()`, `searchByTitle()` (native query using `tsvector`)
- `AttemptRepository.findPassedChallengeIdsByUserId()`, `findChallengeStatusesByUserId()`

The `searchByTitle` query is a native SQL query because it uses PostgreSQL's `@@ plainto_tsquery()` operator, which JPQL doesn't support:
```java
@Query(value = "SELECT c.* FROM challenges c WHERE c.search_vector @@ plainto_tsquery('english', :query) LIMIT 20",
       nativeQuery = true)
List<Challenge> searchByTitle(@Param("query") String query);
```

See the 6 repository files in `services/api/src/main/java/com/spencerjireh/nthtime/repository/`.

---

## 8. Phase 5: Build the Service Layer

This is where all the business logic lives. Port every function from `convex/service.ts` into the appropriate service class. There are 9 services total.

### The mapping

| Convex Function | Spring Service Method |
|---|---|
| `packs.list` | `PackService.listPacks(filters, null)` |
| `service.listPacksAuth` | `PackService.listPacks(filters, userId)` |
| `service.createAttempt` | `AttemptService.createAttempt(userId, input)` |
| `service.getSettings` | `SettingsService.getSettings(userId)` |
| `service.authorCreatePack` | `AuthorPackService.createPack(userId, input)` |
| `admin.seedPack` | `AdminService.seedPack(input)` |
| ... | (27 functions total, see plan Section 6.1) |

### Critical business rules to port exactly

1. **Visibility filtering** (PackService): public packs visible to all, private only to author, unlisted accessible by slug but not in list results.

2. **Cascading deletes** (AuthorPackService.removePack): delete attempts -> delete challenges -> delete pack. Order matters for FK constraints.

3. **Challenge renumbering** (AuthorChallengeService.removeChallenge): after deleting a challenge, re-number all remaining challenges in the pack to close the gap.

4. **Attempt deletion on content change** (AuthorChallengeService.updateChallenge): when a challenge's content changes, all existing attempts become invalid and must be deleted.

5. **Auto-order on create** (AuthorChallengeService.createChallenge): new challenges get `maxOrder + 1`.

6. **Settings defaults** (SettingsService.getSettings): if no settings record exists, return hardcoded defaults. On first update, create the record.

7. **Slug uniqueness** (AuthorPackService): check `packRepository.existsBySlug()` on create and on update (when slug changes).

8. **AdminService.syncPacks flush** : after deleting challenges from a pack (before reinserting), call `challengeRepository.flush()` to commit the deletes. Without this, the unique constraint on `(pack_id, order)` will fire when you insert new challenges at the same order values.

See the 9 service files in `services/api/src/main/java/com/spencerjireh/nthtime/service/`.

---

## 9. Phase 6: Build REST Controllers

11 controllers that map to the exact same URL paths the Next.js API routes will proxy to.

### Endpoint mapping

| Spring Endpoint | Auth | Controller |
|---|---|---|
| `GET /api/packs` | Optional | PackController |
| `GET /api/packs/{slug}` | Optional | PackController |
| `GET /api/challenges/{id}` | No | ChallengeController |
| `GET /api/search?q=` | No | SearchController |
| `POST /api/attempts` | Required | AttemptController |
| `GET /api/challenges/{id}/attempts` | Required | AttemptController |
| `GET /api/settings` | Required | SettingsController |
| `PATCH /api/settings` | Required | SettingsController |
| `GET /api/auth/session` | No | AuthController |
| `GET /api/author/packs` | Required | AuthorPackController |
| `POST /api/admin/packs/seed` | Admin secret | AdminController |
| `GET /api/health` | No | HealthController |
| `GET /api/cli/packs/{slug}` | No | CliController |
| ... | (full list in plan Section 7.1) |

### How controllers get the user ID

Controllers read from the HTTP session (set by the OAuth2 success handler):

```java
private Long getUserId(HttpServletRequest request) {
    if (request.getSession(false) == null) return null;
    return (Long) request.getSession().getAttribute("appUserId");
}
```

For endpoints that require auth, throw `ForbiddenException` if `userId` is null.

See the 11 controller files in `services/api/src/main/java/com/spencerjireh/nthtime/controller/`.

---

## 10. Phase 7: Wire Up Authentication

This is the most complex phase because the OAuth flow must be proxied through Next.js.

### 10.1 SecurityConfig.java

Configure Spring Security:
- CSRF disabled (API-only)
- CORS allows Next.js origins
- Public endpoints: `/api/packs/**`, `/api/challenges/**`, `/api/search/**`, `/api/cli/**`, `/api/health`, `/api/admin/**`, `/api/auth/session`
- OAuth2 login with custom success handler
- Session management: `IF_REQUIRED` (JSESSIONID)
- Custom 401 handler that returns JSON (not redirect)

See: `services/api/src/main/java/com/spencerjireh/nthtime/config/SecurityConfig.java`

### 10.2 OAuth2AuthenticationSuccessHandler.java

After GitHub OAuth completes:
1. Extract provider info (github ID, name, email, avatar)
2. Call `UserService.findOrCreateUser()` to resolve/create the app user
3. Store `appUserId` as an HTTP session attribute
4. Redirect back to the frontend URL

See: `services/api/src/main/java/com/spencerjireh/nthtime/config/OAuth2AuthenticationSuccessHandler.java`

### 10.3 The redirect_uri problem

Spring Boot is internal -- GitHub cannot redirect to it directly. The solution: set `redirect-uri` in `application.yml` to point to Next.js, which proxies the callback to Spring Boot.

In `application.yml`:
```yaml
spring.security.oauth2.client.registration.github:
  redirect-uri: ${FRONTEND_URL}/api/auth/callback/github
```

The full OAuth flow:
1. Browser -> `GET /api/auth/signin` (Next.js)
2. Next.js fetches `http://api:8080/oauth2/authorization/github` (redirect: manual)
3. Gets back a 302 to GitHub with the correct redirect_uri
4. Next.js forwards that 302 to the browser
5. Browser authenticates with GitHub
6. GitHub redirects to `https://nthtime.spencerjireh.com/api/auth/callback/github?code=...&state=...`
7. Next.js at `/api/auth/callback/github` forwards to `http://api:8080/login/oauth2/code/github?code=...&state=...`
8. Spring Boot exchanges code for token, creates session
9. Next.js forwards `Set-Cookie: JSESSIONID=...` to browser

---

## 11. Phase 8: Add Rate Limiting

Use Bucket4j for in-memory per-user rate limiting. Create `RateLimitConfig.java` with a `ConcurrentHashMap<String, Bucket>` keyed by `"{operation}:{userId}"`.

Rate limits (matching the original Convex limits):
- `attempts:create` -- 10 tokens/minute, burst 3
- `settings:update` -- 20 tokens/minute, burst 5
- `authorPacks:write` -- 30 tokens/minute, burst 10
- `authorChallenges:write` -- 30 tokens/minute, burst 10

Services call `rateLimitConfig.consume(operation, userId)` at the start of rate-limited methods. On failure, a `RateLimitExceededException` is thrown and the `GlobalExceptionHandler` returns 429.

See: `services/api/src/main/java/com/spencerjireh/nthtime/config/RateLimitConfig.java`

---

## 12. Phase 9: Add Exception Handling and DTOs

### Exception handling

Create custom exceptions + a `@RestControllerAdvice` handler:

| Exception | HTTP Status | When |
|---|---|---|
| `ResourceNotFoundException` | 404 | Entity not found |
| `SlugConflictException` | 409 | Pack slug already taken |
| `ForbiddenException` | 403 | Not authenticated or not the owner |
| `RateLimitExceededException` | 429 | Rate limit hit |

`GlobalExceptionHandler` also handles Spring's `MethodArgumentNotValidException` (400 for validation errors).

See the 5 files in `services/api/src/main/java/com/spencerjireh/nthtime/exception/`.

### DTOs

9 request DTOs (in `dto/request/`) and 15 response DTOs (in `dto/response/`).

**The `_id` rule**: Every response DTO that includes an entity ID must use `@JsonProperty("_id")` to serialize it. The frontend references `_id` everywhere (inherited from Convex's ID convention). If you use `id` instead, the entire frontend breaks silently.

```java
public record PackSummaryResponse(
    @JsonProperty("_id") String id,
    String name,
    String slug,
    // ...
) {}
```

See the DTO files in `services/api/src/main/java/com/spencerjireh/nthtime/dto/`.

---

## 13. Phase 10: Rewrite Next.js API Routes as Proxies

This is where the frontend migration happens. Instead of calling Convex repositories, every API route becomes a thin proxy to Spring Boot.

### 13.1 Create the proxy utility

Create `apps/web/src/lib/spring-boot-proxy.ts`. This function:
1. Reads the `JSESSIONID` cookie from the incoming browser request
2. Forwards the request to `${SPRING_BOOT_URL}${path}` with the cookie attached
3. Returns the Spring Boot response (including `Set-Cookie` headers)

See: `apps/web/src/lib/spring-boot-proxy.ts`

### 13.2 Rewrite each API route

Every route goes from this pattern:

```typescript
// OLD: ~20 lines, calls Convex via repository
import { packRepository } from '@/lib/data-access/repositories';
import { requireAuth } from '@/lib/api-helpers';

export async function GET() {
  const [userId, err] = await requireAuth();
  if (err) return err;
  const packs = await packRepository.listPacks(/* ... */);
  return Response.json(packs);
}
```

To this pattern:

```typescript
// NEW: ~5 lines, proxies to Spring Boot
import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';

export async function GET(req: Request) {
  return proxyToSpringBoot(req, '/api/packs');
}
```

Auth is handled implicitly -- the proxy forwards the session cookie, and Spring Boot resolves the user.

Do this for all 18 API routes. The full list:

| Next.js Route | Proxies To |
|---|---|
| `api/v1/packs/route.ts` | `/api/packs` |
| `api/v1/packs/[slug]/route.ts` | `/api/packs/{slug}` |
| `api/v1/challenges/[id]/route.ts` | `/api/challenges/{id}` |
| `api/v1/attempts/route.ts` | `/api/attempts` |
| `api/v1/settings/route.ts` | `/api/settings` |
| `api/v1/auth/session/route.ts` | `/api/auth/session` |
| `api/v1/author/packs/route.ts` | `/api/author/packs` |
| ... | (see plan Section 12.5 for full list) |

For routes with dynamic segments, extract the param and interpolate:
```typescript
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyToSpringBoot(req, `/api/packs/${encodeURIComponent(slug)}`);
}
```

---

## 14. Phase 11: Migrate the Auth UI

### 14.1 Create new auth routes

Replace the NextAuth `[...nextauth]` catch-all with three specific routes:

- `apps/web/src/app/api/auth/signin/route.ts` -- fetches the OAuth redirect URL from Spring Boot, redirects browser to GitHub
- `apps/web/src/app/api/auth/signout/route.ts` -- calls Spring Boot logout, clears cookie
- `apps/web/src/app/api/auth/callback/github/route.ts` -- forwards the GitHub callback to Spring Boot, forwards Set-Cookie to browser

See these three files in `apps/web/src/app/api/auth/`.

### 14.2 Create `useAuthSession` hook

Replace NextAuth's `useSession()` with a custom TanStack Query hook:

See: `apps/web/src/hooks/use-auth-session.ts`

This hook calls `GET /api/v1/auth/session` and returns `{ status, userId }`.

### 14.3 Update all auth consumers

Every file that imports `useSession` from `next-auth/react` must switch to `useAuthSession`:

| File | Change |
|---|---|
| `providers.tsx` | Remove `SessionProvider`, keep only `QueryProvider` |
| `sign-in-button.tsx` | Replace `signIn('github')` with `window.location.href = '/api/auth/signin'` |
| `user-menu.tsx` | `useAuthSession()` instead of `useSession()` |
| `conditional-author-link.tsx` | `useAuthSession()` instead of `useSession()` |
| `use-attempts.ts` | `useAuthSession()` instead of `useSession()` |
| `use-settings-query.ts` | `useAuthSession()` instead of `useSession()` |
| `app/author/layout.tsx` | `useAuthSession()` instead of `useSession()` |

### 14.4 Update api-helpers.ts

The `getSessionUserId()` function changes from calling NextAuth to calling the Spring Boot session endpoint:

See: `apps/web/src/lib/api-helpers.ts`

### 14.5 Update api-client.ts

The session response type changes from `{ convexUserId: string }` to `{ userId: string }`:

See: `apps/web/src/lib/api-client.ts` (the `fetchSession` function)

---

## 15. Phase 12: Update Docker Compose

Rewrite `docker-compose.yml` for 3 containers:

```yaml
services:
  postgres:    # PostgreSQL 16, internal, healthcheck with pg_isready
  api:         # Spring Boot, depends on postgres, internal
  web:         # Next.js, depends on api, exposes port 3000
```

Key points:
- `postgres` has a named volume for persistence
- `api` uses `service_healthy` condition on postgres
- `web` uses `service_healthy` condition on api
- Only `web` has a port mapping (3000:3000)
- `api` env includes `FRONTEND_URL` for OAuth redirect URIs

Also create `services/api/Dockerfile`:
- Stage 1: `gradle:8.12-jdk21-alpine` -- downloads deps, builds jar
- Stage 2: `eclipse-temurin:21-jre-alpine` -- copies jar, runs it

And update the root `Dockerfile` to remove the `NEXT_PUBLIC_CONVEX_URL` build arg.

See: `docker-compose.yml`, `services/api/Dockerfile`, `Dockerfile`

---

## 16. Phase 13: Update CI Pipeline

The CI pipeline needs Java 21, Gradle, and a PostgreSQL service container.

Changes to `.github/workflows/ci.yml`:

1. **Add a PostgreSQL service** (postgres:16-alpine) with health check
2. **Add Java 21 setup** (`actions/setup-java@v4` with temurin)
3. **Add Gradle setup** (`gradle/actions/setup-gradle@v4`)
4. **Add Spring Boot build+test step** (with DB env vars pointing to the service container)
5. **Update E2E steps**: start Spring Boot with `bootRun &`, wait for health check, seed via `tools/seed.ts --sync`
6. **Pass `SPRING_BOOT_URL=http://localhost:8080`** to seed and E2E steps

See: `.github/workflows/ci.yml`

---

## 17. Phase 14: Migrate the Seed Tool and E2E Helpers

### Seed tool

`tools/seed.ts` previously used `ConvexHttpClient` to call Convex mutations. Replace with `fetch()` calls to Spring Boot's admin endpoints:

- `POST /api/admin/packs/seed` (single pack)
- `POST /api/admin/packs/sync` (batch + stale cleanup)

Both require `adminSecret` in the request body. The tool reads `SPRING_BOOT_URL` and `ADMIN_SECRET` from env vars.

See: `tools/seed.ts`

### E2E helpers

`apps/web/e2e/helpers.ts` had a `getChallengeId()` function that used `ConvexHttpClient`. Replace with a `fetch()` call to `GET /api/packs/{slug}` on the Spring Boot API.

See: `apps/web/e2e/helpers.ts`

### Playwright config

Update `apps/web/playwright.config.ts` to check for `SPRING_BOOT_URL` instead of `NEXT_PUBLIC_CONVEX_URL`, and pass it to the webServer command.

See: `apps/web/playwright.config.ts`

---

## 18. Phase 15: Delete Dead Code

After all the above is done, verify that nothing imports from the old files, then delete them.

### How to verify

Run these greps from `apps/web/src/`:

```bash
# Check for any remaining Convex imports
grep -r "from.*convex" apps/web/src/ --include="*.ts" --include="*.tsx"

# Check for any remaining next-auth imports
grep -r "from.*next-auth" apps/web/src/ --include="*.ts" --include="*.tsx"

# Check if anything imports from the dead files
grep -r "lib/auth" apps/web/src/ --include="*.ts" --include="*.tsx"
grep -r "convex-http" apps/web/src/ --include="*.ts" --include="*.tsx"
grep -r "data-access/repositories" apps/web/src/ --include="*.ts" --include="*.tsx"
```

If these return no results (outside of `convex/` directory), it is safe to delete.

### Files to delete

| File | Reason |
|---|---|
| `apps/web/src/lib/auth.ts` | Old NextAuth config |
| `apps/web/src/lib/convex-http.ts` | Old ConvexHttpClient helper |
| `apps/web/src/lib/data-access/convex-server-adapter.ts` | Old Convex adapter |
| `apps/web/src/lib/data-access/repositories.ts` | Re-exported from dead adapter |
| `apps/web/src/lib/data-access/index.ts` | Re-exported from repositories |
| `apps/web/src/app/api/auth/[...nextauth]/route.ts` | Old NextAuth catch-all |

### Dependencies to remove from `apps/web/package.json`

```
convex
next-auth
```

### Note about `convex/` directory

The `convex/` directory at the repo root and its dependencies in the root `package.json` are kept as reference code until the cutover is verified in production. Delete them after successful deployment.

---

## 19. Phase 16: Update Documentation and Config

### Environment files

Rewrite `.env.local.example`:
```
SPRING_BOOT_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
```

Rewrite `.env.production.example`:
```
SPRING_BOOT_URL=http://api:8080
FRONTEND_URL=https://nthtime.spencerjireh.com
```

### CLAUDE.md

Update to reflect the new architecture, commands, and env vars. Remove all Convex references. Add Spring Boot commands (`gradlew build`, `gradlew bootRun`).

### Other documentation

The `docs/` directory still has extensive Convex references. Update as a follow-up:
- `docs/guide/getting-started.md`
- `docs/operations/convex-backend.md` (rename or rewrite)
- `docs/operations/docker-ci.md`
- `docs/operations/coolify-runbook.md`

---

## 20. Gotchas and Lessons Learned

### 1. The `_id` field name is sacred

The frontend uses `_id` (not `id`) for entity IDs everywhere. This is a Convex convention. Your Spring Boot response DTOs must use `@JsonProperty("_id")` on every ID field. If you forget this, the frontend will silently render nothing.

### 2. FK constraint ordering on cascade deletes

When deleting a pack: delete attempts first, then challenges, then the pack. If you delete challenges first, the FK from attempts to challenges will block you.

### 3. Flush after bulk delete before re-insert

`AdminService.upsertPack` deletes all challenges for a pack and re-inserts them. The unique constraint `(pack_id, order)` means you can't insert order=1 while the old order=1 row is still in the persistence context. Call `flush()` after the delete.

### 4. OAuth redirect_uri must go through Next.js

Spring Boot is on an internal network. Set `redirect-uri` in `application.yml` to the Next.js public URL, and create a callback route in Next.js that proxies to Spring Boot.

### 5. No JDK needed locally (if you have Docker)

The Spring Boot Dockerfile includes a Gradle build stage. You can develop and test via `docker compose build && docker compose up` without installing Java locally.

### 6. Session field rename

The old NextAuth session had `convexUserId`. The new Spring Boot session has `userId`. Update `api-client.ts` and any types that reference the old field name.

### 7. Route spec tests become obsolete

The old API route unit tests mocked the repository layer (which no longer exists). Since the routes are now thin proxies, they are better tested via E2E tests and Spring Boot integration tests. Delete the old route spec tests.

### 8. Context window limits

A migration this large (76 new files, 40+ modified files) can exceed an AI assistant's context window. The work was split into background agents that ran in parallel for independent tasks (controllers, DTOs, exceptions). If you are doing this with an AI assistant, plan to split the work.

---

## 21. Verification Checklist

Before cutting over to production:

- [ ] Spring Boot starts and `GET /api/health` returns 200
- [ ] Flyway migrations run cleanly on fresh PostgreSQL 16
- [ ] `pnpm seed -- --sync` populates all 3 packs (30 challenges)
- [ ] Browse catalog without auth -- packs and challenges load
- [ ] Search works (full-text on challenge titles)
- [ ] GitHub OAuth sign-in/sign-out flow works end-to-end
- [ ] Authenticated user sees passedCount on packs
- [ ] Submit a solution on a challenge -- attempt created
- [ ] View attempt history for a challenge
- [ ] Settings CRUD (change keybindings, feedback flags)
- [ ] Author workflow: create pack, add challenge, validate, preview, export
- [ ] Author cascade deletes: remove pack deletes challenges and attempts
- [ ] CLI `nthtime start express-basics/hello-world` works
- [ ] Rate limiting: 11th attempt in 1 minute returns 429
- [ ] Private packs hidden from unauthenticated users
- [ ] All existing frontend Vitest tests pass
- [ ] All Playwright E2E tests pass
- [ ] `docker compose build` succeeds
- [ ] `docker compose up` produces 3 healthy containers
- [ ] CI pipeline passes

### After successful cutover

- [ ] Delete `convex/` directory
- [ ] Remove Convex deps from root `package.json`
- [ ] Remove `pnpm test:convex` script
- [ ] Update GitHub OAuth callback URL if needed
- [ ] Update all documentation
