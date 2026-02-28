# Docker and CI

This page covers the production Docker build, the CI pipeline configuration, and the docs deployment workflow.

## Docker

### Dockerfile

The Dockerfile uses a multi-stage build to produce a minimal production image. It lives at the repository root.

**Stage 1: deps** -- Install dependencies in an isolated layer:

```dockerfile
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY libs/shared/package.json libs/shared/
COPY libs/data-access/package.json libs/data-access/
COPY libs/verification/package.json libs/verification/
COPY libs/editor/package.json libs/editor/
RUN pnpm install --frozen-lockfile
```

Only `package.json` files are copied first to maximize Docker layer caching. Dependencies are only reinstalled when lockfile or package manifests change.

**Stage 2: build** -- Copy source and build:

```dockerfile
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/libs/shared/node_modules ./libs/shared/node_modules 2>/dev/null || true
COPY --from=deps /app/libs/data-access/node_modules ./libs/data-access/node_modules 2>/dev/null || true
COPY --from=deps /app/libs/verification/node_modules ./libs/verification/node_modules 2>/dev/null || true
COPY --from=deps /app/libs/editor/node_modules ./libs/editor/node_modules 2>/dev/null || true
COPY . .
RUN pnpm build
```

The `2>/dev/null || true` on library node_modules copies handles cases where pnpm does not create a local `node_modules` (hoisting to root instead).

**Stage 3: runtime** -- Minimal production image:

```dockerfile
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
```

The runtime stage only copies the standalone Next.js output, static assets, and public files. No `node_modules` directory or source code. The resulting image is typically 100-200MB.

### Standalone Output

The `next.config.js` includes `output: 'standalone'` which tells Next.js to produce a self-contained server:

```js
// next.config.js (relevant section)
module.exports = {
  output: 'standalone',
  // ...
};
```

This generates `apps/web/.next/standalone/` containing a minimal Node.js server (`server.js`) and only the `node_modules` actually needed at runtime.

### docker-compose.yml

The compose file runs the web service on port 3000 with a healthcheck:

```yaml
services:
  web:
    build: .
    ports:
      - '3000:3000'
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

Alpine-based images include `wget` but not `curl`, so the healthcheck uses `wget --spider` (HEAD-only request).

### Health Endpoint

The health endpoint at `GET /api/health` returns:

```json
{
  "status": "ok",
  "timestamp": 1708646400000
}
```

The `timestamp` is the server's `Date.now()` value in epoch milliseconds. This endpoint is used by Docker healthcheck and external monitoring.

### Environment Setup

Copy the example file and fill in values before running:

```bash
cp .env.production.example .env.production
```

The `.env.production.example` contains the required environment variables for Spring Boot (database credentials, GitHub OAuth, `ADMIN_SECRET`) and Next.js (`SPRING_BOOT_URL`, `FRONTEND_URL`). See the [Spring Boot Backend](/operations/spring-boot-backend) page for the full variable list.

### Running

```bash
# Build the production image
docker compose build

# Start the container
docker compose up

# Start in detached mode
docker compose up -d

# Check health status
docker compose ps
```

## CI Pipeline

The CI pipeline is defined in `.github/workflows/ci.yml`. It runs on every push and pull request to `main`.

### Configuration

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true
```

The `concurrency` block ensures that only one CI run is active per PR or branch. New pushes cancel in-progress runs.

### Steps

The pipeline runs as a single job on `ubuntu-latest` with Node.js 22:

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0     # full history for Nx affected

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Set Nx SHAs
        uses: nrwl/nx-set-shas@v4

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Validate packs
        run: pnpm validate

      - name: Lint (affected)
        run: npx nx affected --target=lint

      - name: Typecheck (all)
        run: npx nx run-many --target=typecheck

      - name: Test (affected)
        run: npx nx affected --target=test -- --run

      - name: Build (affected)
        run: npx nx affected --target=build

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: E2E tests
        run: npx nx e2e @nthtime/web

      - name: Docker build (verify)
        run: docker build -t nthtime-web .
```

### Step Breakdown

1. **Checkout** with `fetch-depth: 0` -- full git history is required for Nx to compute affected packages by comparing against the base SHA.

2. **Setup pnpm** and **Setup Node.js** -- configures the runtime with pnpm caching.

3. **Set Nx SHAs** (`nrwl/nx-set-shas@v4`) -- determines the base and head SHAs for `nx affected` commands. On PRs, it uses the merge base with `main`. On pushes to `main`, it uses the previous commit.

4. **Install dependencies** with `--frozen-lockfile` -- ensures reproducible installs matching the lockfile exactly.

5. **Validate packs** -- runs `tools/validate-packs.ts` to verify all challenge reference solutions pass their assertions. This runs before other targets because pack validation is independent of Nx.

6. **Lint (affected)** -- runs ESLint only on packages that changed since the base SHA.

7. **Typecheck (all)** -- runs TypeScript type checking on all packages (not just affected). This catches cross-package type errors that `affected` might miss.

8. **Test (affected)** -- runs Vitest on affected packages with `--run` (single-run mode, no watch).

9. **Build (affected)** -- builds only affected packages (primarily `apps/web`).

10. **Install Playwright browsers** -- installs Chromium for E2E tests.

11. **E2E tests** -- runs Playwright tests against the dev server using mock data.

12. **Docker build (verify)** -- builds the Docker image to verify the Dockerfile is valid. Does not push.

### Nx Affected

The `nx affected` command compares the current head against a base SHA to determine which packages have changed. Only those packages (and their dependents) run the specified target. This dramatically reduces CI time on large monorepos.

```bash
# Only lint packages that changed
npx nx affected --target=lint

# Only test packages that changed
npx nx affected --target=test -- --run

# Only build packages that changed
npx nx affected --target=build
```

The base SHA is set automatically by `nrwl/nx-set-shas@v4`. You can verify it locally:

```bash
# See what would be affected compared to main
npx nx affected --target=test --base=main --head=HEAD
```

## Docs Deployment

Documentation is deployed separately via `.github/workflows/docs.yml`. This workflow only triggers on pushes to `main` that change files under `docs/`:

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]
    paths: ['docs/**']
  workflow_dispatch:
```

The `workflow_dispatch` trigger allows manual deployment from the GitHub Actions UI.

### Build and Deploy

The docs workflow builds the VitePress site and deploys to GitHub Pages:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build docs
        run: pnpm docs:build

      - name: Configure Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

The workflow requires the repository to have GitHub Pages enabled with the "GitHub Actions" source. The `permissions` block grants the required `pages: write` and `id-token: write` for the deployment.

### Concurrency

```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```

Unlike CI, the docs deployment uses `cancel-in-progress: false` to avoid interrupting an active deployment. Subsequent deployments queue until the current one completes.
