# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev                          # Next.js dev server (webpack mode)
pnpm build                        # Build all packages
pnpm lint                         # ESLint all packages
pnpm test                         # Vitest all libraries
pnpm typecheck                    # TypeScript check all packages
pnpm format                       # Prettier write
pnpm e2e                          # Playwright E2E (apps/web)

# Single-target (Nx)
nx test @nthtime/verification     # Test one library
nx lint @nthtime/editor           # Lint one library
nx typecheck @nthtime/shared      # Typecheck one library

# Run a single test file
npx vitest run libs/verification/src/lib/verification.spec.ts

# Affected (CI-style, only changed packages)
nx affected --target=test
nx affected --target=lint

# Pack tooling
pnpm validate                     # Validate all packs (reference solution verification)
pnpm seed                         # Seed packs to Convex (requires CONVEX_URL)

# Docker
docker compose build              # Build production image
docker compose up                 # Run production container (needs .env.production)
```

## Architecture

Nx 22.5 monorepo with pnpm 10 workspaces. Crystal plugins auto-infer build/dev/lint/test/typecheck targets from config files -- no explicit target definitions needed in most project.json files.

### Workspace layout

- **apps/web** -- Next.js 16 frontend (shadcn/ui, Monaco editor, Tailwind v3)
- **libs/shared** -- Pure types: Pack, Challenge, Assertion (discriminated union), Verification, Attempt, Settings
- **libs/data-access** -- Repository interfaces (PackRepository, AttemptRepository, SettingsRepository)
- **libs/verification** -- Tree-sitter WASM verification engine (12 evaluators + pipeline)
- **libs/editor** -- Zustand vanilla store (EditorStore), language mapping, time formatting, draft storage
- **convex/** -- Backend schema + server functions (NOT an Nx project, lives at repo root)
- **packs/** -- Challenge pack JSON files (pack.json + challenges/*.json per pack)
- **tools/** -- CLI scripts: validate-packs.ts, seed.ts

### Library linking

Libraries use **pnpm workspace protocol** (`"@nthtime/shared": "workspace:*"`) and **TypeScript project references** -- not tsconfig paths. Each library's `package.json` has an `exports` field pointing to `./src/index.ts`. Import with: `@nthtime/shared`, `@nthtime/data-access`, `@nthtime/verification`, `@nthtime/editor`.

### TypeScript

- Base config: strict, `es2022` target, `nodenext` module resolution, `composite: true`
- Libraries use `.js` extensions in imports (required by nodenext)
- apps/web overrides to `"moduleResolution": "bundler"` for Next.js compatibility
- next.config.js has `extensionAlias: { '.js': ['.ts', '.tsx', '.js'] }` to bridge nodenext libs into webpack

### Next.js

Both `build` and `dev` targets are overridden in `apps/web/project.json` to use `--webpack` flag. Turbopack fails with Nx's dynamic `require()` calls. The `next.config.js` also enables the `asyncWebAssembly` webpack experiment for Tree-sitter WASM. It uses `NormalModuleReplacementPlugin` to rewrite `node:` imports and `resolve.fallback: false` for `fs`/`path` in the browser bundle.

### Monaco editor

- `monaco-editor` is NOT hoisted by pnpm -- never import types from `monaco-editor` directly. Use `OnMount`, `EditorProps` from `@monaco-editor/react` instead.
- `monaco-emacs` calls `require('monaco-editor')` which resolves to the AMD bundle. `next.config.js` aliases `monaco-editor$` to `src/lib/monaco-editor-shim.js` (re-exports `window.monaco`). This alias must apply to both server and client builds.
- `MonacoWrapper` accepts an `options` prop typed as `EditorProps['options']` from `@monaco-editor/react`.

### Challenge navigation

Pack slug is threaded via `?pack=` query param for challenge navigation (catalog -> pack -> challenge -> results).

### Verification engine

Tree-sitter WASM grammars (JS, TS, TSX, Python, HTML, CSS) are served from `apps/web/public/tree-sitter/` in the browser. In Vitest, the grammar loader uses `findNodeModulesFor()` to walk up directories since pnpm hoists to the repo root.

### Data access layer

`apps/web/src/lib/data-access/` provides a `DataAccessProvider` that switches between mock hooks (no backend) and Convex hooks based on `NEXT_PUBLIC_CONVEX_URL`. The switch uses only `process.env.NEXT_PUBLIC_CONVEX_URL` (inlined at build time) -- never `typeof window` -- to avoid hydration mismatches. Components call `useDataAccess()` to get the active hooks.

### Convex backend

Convex functions (auth, packs, challenges, attempts, settings) live at repo root in `convex/`. The Convex provider in the app wraps with a null check on `NEXT_PUBLIC_CONVEX_URL` so builds work without a backend connection. `convex/tsconfig.json` excludes `__tests__/` to prevent test-only types (e.g. `import.meta.glob`) from blocking `npx convex dev` pushes.

### Auth

GitHub OAuth via `@convex-dev/auth` (wraps Auth.js). Convex env vars required: `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS`. Run `npx @convex-dev/auth` to generate JWT keys. The `SITE_URL` must match your dev server origin (e.g. `http://localhost:3000`). `convex/auth.ts` defines providers; `convex/auth.config.ts` configures token verification.

### Health check

`GET /api/health` returns `{ status: "ok", timestamp: <epoch_ms> }`. Used by Docker healthcheck and monitoring.

### Docker

Multi-stage Dockerfile produces a standalone Next.js image (~100-200MB). `docker-compose.yml` runs the web service on port 3000 with healthcheck. Copy `.env.production.example` to `.env.production` and fill in `NEXT_PUBLIC_CONVEX_URL` before running.

## CI pipeline

Runs on push/PR to `main` (Node 22): validate packs -> lint (affected) -> typecheck (all) -> test (affected) -> build (affected) -> Playwright E2E -> Docker build verify.

## Gotchas

- `tools/` scripts use direct relative imports (not workspace packages) and `fileURLToPath(import.meta.url)` for `__dirname` (`import.meta.dirname` is undefined in `npx tsx`)
- Nx sync may report "out of sync" then "already up to date" on retry -- run twice if needed
- ESLint: `@nx/eslint` peer wants `eslint ^8||^9`, we use 9. Do not upgrade to eslint 10.
- `convex/tsconfig.json` must exclude `__tests__/` -- test files use Vitest-only types that break `npx convex dev`
- `DataAccessProvider` must NOT use `typeof window` to choose hooks -- causes hydration mismatch (server=mock data, client=loading). Use only `process.env.NEXT_PUBLIC_CONVEX_URL`.

## Code style

- Prettier: single quotes, trailing commas, 100 char width, 2-space indent
- ESLint 9 flat config with TypeScript ESLint and Nx boundary rules
- Vitest with globals enabled (no explicit imports for describe/it/expect)
- Never use emojis in output or generated code
