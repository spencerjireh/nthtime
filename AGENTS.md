# AGENTS.md

Guidance for AI coding agents working in this repository.

## Commands

```bash
# Local dev (recommended daily loop)
pnpm dev:db                       # PostgreSQL via docker-compose.dev.yml (detached)
pnpm dev:api                      # Spring Boot bootRun (requires Java 25)
pnpm dev                          # Next.js (webpack mode, HMR)
pnpm dev:db:stop                  # Stop PostgreSQL

# Build / quality
pnpm build                        # nx run-many --target=build
pnpm lint                         # ESLint all packages
pnpm lint:dead                    # knip: unused files/exports/deps (warn-only)
pnpm lint:dead:fix                # knip --fix
pnpm lint:dead:deep               # Qodana on services/api (requires Docker)
pnpm lint:dead:deep:baseline      # Regenerate Qodana baseline
pnpm test                         # Vitest all libs (watch by default; use -- --run)
pnpm typecheck                    # TS check all packages
pnpm format / format:check        # Prettier write / check
pnpm e2e                          # Playwright (apps/web)
pnpm bench                        # Vitest benchmarks (libs/verification)
pnpm benchmark                    # tools/benchmark.ts (verification perf tool)
pnpm analyze                      # ANALYZE=true next build (bundle analyzer)

# Pack tooling
pnpm validate                     # Pack JSON + reference solutions
pnpm validate:behavioral          # Vitest behavioral tests (packs/vitest.config.mts)
pnpm validate:python              # Python pack helpers (uv)
pnpm validate:all                 # All three validation steps
pnpm seed                         # Seed packs to Spring Boot (SPRING_BOOT_URL + ADMIN_SECRET)
pnpm seed -- --sync               # Seed + delete stale packs (CI)
pnpm seed:prod                    # Seed with .env.production

# Spring Boot (services/api)
pnpm api:build                    # ./gradlew build
pnpm api:test                     # ./gradlew test

# Single-target (Nx)
nx test @nthtime/verification -- --run   # One-shot test run
nx lint|typecheck|build @nthtime/<project>
npx vitest run path/to/file.spec.ts      # Single test file

# Affected (CI-style)
nx affected --target=test -- --run
nx affected --target=lint

# Docs (VitePress)
pnpm docs:dev / docs:build

# Docker (production-like stack)
docker compose build && docker compose up  # postgres + api + web
```

Nx Vitest defaults to watch mode; pass `-- --run` in scripts/CI. `apps/web` and `apps/cli` override `test` to `vitest run`.

## Architecture

Nx 22.5 monorepo, pnpm 10 workspaces. Crystal plugins auto-infer build/dev/lint/test/typecheck targets; most `project.json` files are target-free.

```
Browser -> Next.js (3000, public) -> Spring Boot (8080, internal) -> PostgreSQL (5432, internal)
```

Browser never hits Spring Boot directly. Next.js API routes at `/api/v1/*` are thin proxies via `apps/web/src/lib/spring-boot-proxy.ts` that forward the `JSESSIONID` cookie. Client components call the proxies through TanStack React Query hooks in `apps/web/src/hooks/` (built on `apps/web/src/lib/api-client.ts`). Provider stack is `QueryProvider` only.

### Workspace layout

- **apps/web** -- Next.js 16 (shadcn/ui, Monaco, Tailwind v3)
- **apps/cli** -- Ink 5 + React 18 terminal UI, tsup-bundled
- **services/api** -- Spring Boot 3.5 (Java 25, Gradle Kotlin DSL, PostgreSQL 16). Package root: `com.spencerjireh.nthtime`.
- **libs/shared** -- Types: Pack, Challenge, Assertion (discriminated union), Verification, Attempt, Settings
- **libs/data-access** -- Repository interfaces (PackRepository, AttemptRepository, SettingsRepository)
- **libs/verification** -- Tree-sitter WASM engine (12 evaluators + pipeline)
- **libs/editor** -- Zustand vanilla EditorStore, language mapping, draft storage
- **packs/** -- 31 packs, 360 challenges. Each pack: `pack.json` + `challenges/*.json`. `_tracks/` holds the 4 track definitions (dsa-python, dsa-typescript, python-curriculum, react-typescript).
  - Web/API: express-basics, fastapi-basics
  - Python: python-foundations/internals/objects/patterns/stdlib
  - DSA (py + ts each): arrays-hashing, linked-lists, search-dp-bits, trees, two-pointers
  - React/TS: react-fundamentals, react-ts-typing, ts-types-drills, react-custom-hooks-ts, react-hooks-advanced-ts, react-patterns-ts, react-forms-ts, react-data-ts, react-performance-ts, react-testing-ts, react-routing-rr-ts, react-routing-tanstack-ts, react-state-mgmt-ts, react-architecture-ts
- **tools/** -- validate-packs.ts, seed.ts, benchmark.ts
- **docs/** -- VitePress site

Libraries linked via pnpm workspace protocol (`"@nthtime/shared": "workspace:*"`) + TypeScript project references -- NOT tsconfig paths. Each lib's `package.json` has an `exports` field pointing to `./src/index.ts`.

### TypeScript

Strict, `es2022`, `nodenext` module resolution, `composite: true`. Libraries use `.js` extensions in imports (nodenext). `apps/web` overrides `moduleResolution: bundler`; `next.config.js` bridges via `extensionAlias: { '.js': ['.ts', '.tsx', '.js'] }`.

### Next.js / build config

`apps/web/project.json` overrides `build`, `dev`, AND `test`:
- `build` / `dev` must use `--webpack` -- Turbopack breaks on Nx's dynamic `require()` calls.
- `test` runs `vitest run` (one-shot, not watch).

`next.config.js`:
- `asyncWebAssembly: true` for Tree-sitter WASM.
- `NormalModuleReplacementPlugin` rewrites `node:` scheme imports + `resolve.fallback: false` for `fs` / `path` (verification lib uses `node:fs` behind browser-guarded branches).
- Aliases `monaco-editor$` -> `src/lib/monaco-editor-shim.js` (re-exports `window.monaco`). Required because `monaco-emacs` calls `require('monaco-editor')` which resolves to the AMD bundle. Alias applies server + client.
- Wrapped with `withSentryConfig` (`tunnelRoute: '/monitoring'`) and optional `@next/bundle-analyzer` gated on `ANALYZE=true`.

Monaco is NOT hoisted by pnpm -- import types from `@monaco-editor/react` (`OnMount`, `EditorProps`), never from `monaco-editor` directly. `MonacoWrapper`'s `options` prop uses `EditorProps['options']`.

### Verification engine

Tree-sitter WASM grammars (JS, TS, TSX, Python, HTML, CSS, JSON) served from `apps/web/public/tree-sitter/` in the browser. Vitest grammar loader uses `findNodeModulesFor()` to walk up dirs since pnpm hoists to the repo root.

### CLI (apps/cli)

Two commands: `nthtime start <pack/challenge>` (watch) and `nthtime verify [pack/challenge]` (one-shot). tsup bundles to ESM (`node20`), inlining `@nthtime/shared` and `@nthtime/verification`, keeping `web-tree-sitter` external.

- `scripts/copy-wasm.js` copies grammars to `apps/cli/wasm/` (gitignored) before tsup.
- CLI uses React 18 (Ink 5); web uses React 19. Intentional.
- Config: `~/.config/nthtime/config.json` via `env-paths`. `NTHTIME_URL` overrides server (default `https://nthtime.spencerjireh.com`).
- Fetches from `/api/cli/packs/[slug]` and `/api/cli/challenges/[packSlug]/[challengeSlug]`.
- Integration tests run compiled `dist/cli.js` -- build first.
- `.nthtime.json` cached per challenge dir stores assertions/paths/hints.

### Challenge URLs

Nested slugs: `/packs/[packSlug]/challenges/[challengeSlug]`. Pack pages accept `?from=<trackSlug>` for contextual back-links.

### Spring Boot backend (services/api)

Java 25 + Spring Boot 3.5 + PostgreSQL 16 + Flyway. Package root: `com.spencerjireh.nthtime`.

- **`config/`** -- SecurityConfig (OAuth2 + Spring Session JDBC), RateLimitConfig (Bucket4j), JacksonConfig
- **`controller/`** -- 15 REST controllers under `/api/*`
- **`entity/`** -- 9 JPA entities: AppUser, AuthAccount, Pack, Challenge, Attempt, UserSettings, Track, PackTrack, FeaturedChallenge
- **`repository/`** -- 9 Spring Data JPA repos (includes native tsvector search queries)
- **`service/`** -- 14 services (PackService, AuthorPackService, AdminService, TrackService, StreakService, ...)
- **`dto/`** -- Response DTOs use `@JsonProperty("_id")` to match frontend expectations.
- **`exception/`** -- Custom exceptions + `GlobalExceptionHandler` (`@RestControllerAdvice`).

JSONB columns (assertions, referenceSolution, formatter, assertionResults) use `hypersistence-utils` `JsonType`; PG text arrays (tags, hints) use `StringArrayType`. Migrations `V1`..`V7` in `src/main/resources/db/migration/` (initial schema, tsvector search, Spring Session, trace_mode, pack prerequisites, tracks, featured_challenges).

### Auth

GitHub OAuth via Spring Security OAuth2 Client + Spring Session JDBC. Browser hits `/api/auth/signin` on Next.js, which proxies to Spring Boot's OAuth2 authorization endpoint. GitHub callback -> `/api/auth/callback/github` (Next.js) -> Spring Boot resolves the user and issues a `JSESSIONID` cookie; Next.js forwards `Set-Cookie`. `useAuthSession()` (TanStack Query) checks `/api/v1/auth/session`.

Env:
- Spring Boot: `DB_{HOST,PORT,NAME,USER,PASSWORD}`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ADMIN_SECRET`, `FRONTEND_URL`
- Next.js: `SPRING_BOOT_URL` (default `http://api:8080`), `FRONTEND_URL` (default `http://localhost:3000`)
- Feature flags (`apps/web/src/lib/feature-flags.ts`): `NEXT_PUBLIC_FF_AUTH` is opt-in (default OFF; set to `"true"` to enable sign-in, `/account`, `/author`; gated via `useAuthSession` + `middleware.ts`). `NEXT_PUBLIC_FF_SOLUTION_VIEW` is opt-out (default ON; set to `"false"` to disable). Both are build-time inlined -- changing one needs a rebuild, not a restart.

### Docker

- `docker-compose.dev.yml` -- PostgreSQL only (port 5432) for local dev.
- `docker-compose.yml` -- Full stack: PostgreSQL + Spring Boot (internal) + Next.js (3000). Needs `.env` with `DB_PASSWORD`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ADMIN_SECRET`, `FRONTEND_URL`.
- `docker-compose.coolify.yml` -- deployment variant.

Spring Boot Dockerfile: multi-stage Gradle build -> `eclipse-temurin:25-jre-alpine`. Next.js Dockerfile: multi-stage pnpm install -> `nx build @nthtime/web` -> standalone runtime.

## CI pipeline

Push/PR to `main` (Node 22 + Java 25): validate packs -> lint (affected) -> typecheck (all) -> test (affected) -> build (affected) -> Spring Boot build+test -> start Spring Boot -> seed test data -> Playwright E2E -> Docker compose build verify.

## Gotchas

- `tools/` scripts use direct relative imports (not workspace packages) and `fileURLToPath(import.meta.url)` for `__dirname` (`import.meta.dirname` is undefined under `npx tsx`).
- `tools/seed.ts` posts to `/api/admin/packs/seed` (or `/api/admin/packs/sync` with `--sync`). Requires `SPRING_BOOT_URL` + `ADMIN_SECRET`.
- Nx sync sometimes reports "out of sync" then "already up to date" on retry -- run twice if needed.
- ESLint config is `eslint.config.mjs`. `@nx/eslint` peer wants `eslint ^8||^9`; do NOT upgrade to eslint 10.
- `GET /api/health` -> `{ status: "ok", timestamp: <epoch_ms> }` (Docker healthcheck + monitoring; Spring Boot mirrors the same path).

## Testing

- Vitest globals enabled (no explicit `describe`/`it`/`expect` imports).
- `apps/web` uses `jsdom` + `@testing-library/react` + `@testing-library/jest-dom/vitest`.
- Spring Boot integration tests use Testcontainers (PostgreSQL).

## Python / code style

- Use **uv** for all Python package/venv ops -- never raw pip. Pack test deps in `packs/requirements.txt`.
- Prettier: single quotes, trailing commas, 100 col, 2-space indent.
- ESLint 9 flat config with TypeScript ESLint + Nx boundary rules.
- Never use emojis in output or code.
