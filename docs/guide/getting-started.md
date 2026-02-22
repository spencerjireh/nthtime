# Getting Started

This guide walks you through setting up the nthtime monorepo for local development.

## Prerequisites

| Tool   | Version | Notes                                    |
| ------ | ------- | ---------------------------------------- |
| Node   | 22+     | CI uses Node 22 LTS; local dev uses 25   |
| pnpm   | 10+     | Workspaces enabled by default             |
| Git    | 2.x     | Required for cloning and Nx change detection |

## Clone and install

```bash
git clone https://github.com/your-org/nthtime.git
cd nthtime
pnpm install
```

pnpm will resolve workspace packages (`workspace:*` protocol) and hoist shared dependencies to the repo root.

## Start the dev server

```bash
pnpm dev
```

This runs the Next.js 16 development server in **webpack mode**. Turbopack is not supported because Nx's dynamic `require()` calls break under it. The `--webpack` flag is configured in `apps/web/project.json` so you do not need to pass it manually.

The app will be available at `http://localhost:3000`. Without a Convex backend configured, the app falls back to mock data automatically.

## Optional: Convex backend

To enable the full backend (packs, attempts, user settings, auth):

1. Create a Convex project at [dashboard.convex.dev](https://dashboard.convex.dev).
2. Set the environment variable in a `.env.local` file at the repo root:

   ```env
   NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
   ```

3. Start the Convex dev server alongside the Next.js dev server:

   ```bash
   npx convex dev
   ```

   Convex functions live at the repo root in `convex/`. This directory is **not** an Nx project.

## Optional: Auth setup (GitHub OAuth)

Authentication uses GitHub OAuth via `@convex-dev/auth` (wraps Auth.js).

1. Create a GitHub OAuth App in your GitHub developer settings.
2. Set the following Convex environment variables:

   ```
   AUTH_GITHUB_ID=<your-github-client-id>
   AUTH_GITHUB_SECRET=<your-github-client-secret>
   SITE_URL=http://localhost:3000
   ```

3. Generate JWT keys:

   ```bash
   npx @convex-dev/auth
   ```

   This sets `JWT_PRIVATE_KEY` and `JWKS` on your Convex deployment. It will not overwrite existing values.

4. To manually set `JWT_PRIVATE_KEY` with real newlines:

   ```bash
   npx convex env set JWT_PRIVATE_KEY -- "$(cat key.pem)"
   ```

## Commands

| Command          | Description                                        |
| ---------------- | -------------------------------------------------- |
| `pnpm dev`       | Next.js dev server (webpack mode)                  |
| `pnpm build`     | Build all packages                                 |
| `pnpm lint`      | ESLint all packages                                |
| `pnpm test`      | Vitest all libraries                               |
| `pnpm typecheck` | TypeScript check all packages                      |
| `pnpm format`    | Prettier write                                     |
| `pnpm e2e`       | Playwright E2E tests (apps/web)                    |
| `pnpm validate`  | Validate all challenge packs (reference solutions) |
| `pnpm seed`      | Seed packs to Convex (requires `CONVEX_URL`)       |
| `pnpm docs:dev`  | VitePress dev server for documentation             |
| `pnpm docs:build`| Build VitePress documentation                      |

### Single-target with Nx

```bash
nx test @nthtime/verification     # Test one library
nx lint @nthtime/editor           # Lint one library
nx typecheck @nthtime/shared      # Typecheck one library
```

### Affected (CI-style, only changed packages)

```bash
nx affected --target=test
nx affected --target=lint
```

### Run a single test file

```bash
npx vitest run libs/verification/src/lib/verification.spec.ts
```

## Docker quick start

1. Copy the example environment file:

   ```bash
   cp .env.production.example .env.production
   ```

2. Fill in `NEXT_PUBLIC_CONVEX_URL` (and any other required variables) in `.env.production`.

3. Build and run:

   ```bash
   docker compose build
   docker compose up
   ```

The production image is a multi-stage build producing a standalone Next.js container (~100--200 MB). The service runs on port 3000 with a built-in healthcheck at `GET /api/health`.
