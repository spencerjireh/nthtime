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

The app will be available at `http://localhost:3000`. For full-stack development, start the Spring Boot backend alongside the dev server.

## Spring Boot backend

The backend uses Spring Boot 3.4 with PostgreSQL 16. The easiest way to run it locally is with Docker Compose:

```bash
docker compose up
```

This starts PostgreSQL (port 5432), Spring Boot API (port 8080), and the Next.js dev server (port 3000).

Alternatively, run Spring Boot manually:

1. Start a PostgreSQL 16 instance.
2. Create a `.env.local` file at the repo root:

   ```env
   SPRING_BOOT_URL=http://localhost:8080
   FRONTEND_URL=http://localhost:3000
   ```

3. Start Spring Boot:

   ```bash
   cd services/api
   DB_HOST=localhost DB_PORT=5432 DB_NAME=nthtime DB_USER=postgres DB_PASSWORD=postgres ./gradlew bootRun
   ```

   Flyway runs database migrations automatically on startup.

## Auth setup (GitHub OAuth)

Authentication uses GitHub OAuth via Spring Security OAuth2 Client.

1. Create a GitHub OAuth App in your GitHub developer settings.
2. Set the callback URL to `http://localhost:3000/api/auth/callback/github`.
3. Set the following environment variables for Spring Boot:

   ```
   GITHUB_CLIENT_ID=<your-github-client-id>
   GITHUB_CLIENT_SECRET=<your-github-client-secret>
   FRONTEND_URL=http://localhost:3000
   ```

Sessions are stored in PostgreSQL via Spring Session JDBC. No JWT keys are required.

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
| `pnpm seed`      | Seed packs to Spring Boot (requires `SPRING_BOOT_URL`) |
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

2. Fill in `SPRING_BOOT_URL`, `FRONTEND_URL`, database credentials, and GitHub OAuth variables in `.env.production`.

3. Build and run:

   ```bash
   docker compose build
   docker compose up
   ```

Docker Compose runs 3 containers: PostgreSQL 16 (internal), Spring Boot API (internal), and Next.js (port 3000). The Next.js container has a built-in healthcheck at `GET /api/health`.
