# nthtime

Practice coding through structured challenges with real-time AST-based verification.

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D22-green.svg)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-10-orange.svg)](https://pnpm.io)

<!-- TODO: Add screenshot -->

## What is nthtime?

nthtime is a coding challenge platform where you solve problems and get instant feedback powered by Tree-sitter AST analysis -- not string matching or test runners. The verification engine parses your code into an abstract syntax tree and checks structural assertions (function exists, has correct parameters, uses specific patterns, etc.) giving precise, granular feedback.

## Features

- **AST-based verification** -- 12 evaluators check code structure, not just output. Supports JS, TS, TSX, Python, HTML, and CSS via Tree-sitter WASM grammars.
- **Monaco editor** -- Full VS Code editing experience with syntax highlighting, autocomplete, Vim/Emacs keybindings, and integrated diff view.
- **Challenge packs** -- Curated sets of challenges organized by language and difficulty. 3 launch packs with 30 challenges.
- **Tiered feedback** -- 5 feedback levels (L0-L4) from pass/fail banner to full diff view. Configurable per user.
- **Draft autosave** -- Work-in-progress saved to localStorage automatically.
- **Catalog with filters** -- Browse packs by language, difficulty, and search. Filter state encoded in URL for sharing.
- **Time tracking** -- Timer starts on first keystroke, displayed during editing and in results.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (React 19) |
| Backend | Convex (real-time, serverless) |
| Verification | Tree-sitter WASM (web-tree-sitter) |
| Editor | Monaco Editor (@monaco-editor/react) |
| State | Zustand 5 (vanilla stores) |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Testing | Vitest 4 + Playwright |
| Monorepo | Nx 22.5 + pnpm 10 workspaces |

## Architecture

```
nthtime/
  apps/
    web/              Next.js 16 frontend
  libs/
    shared/           Pure types (Pack, Challenge, Assertion, Verification)
    data-access/      Repository interfaces
    verification/     Tree-sitter WASM verification engine (12 evaluators)
    editor/           Zustand vanilla store, language mapping, draft storage
  convex/             Backend schema + server functions (auth, packs, attempts)
  packs/              Challenge pack JSON files
    express-basics/
    react-fundamentals/
    fastapi-basics/
  tools/              CLI scripts (validate-packs, seed)
```

Libraries are linked via pnpm workspace protocol and TypeScript project references. Each library exports through `@nthtime/<name>` (e.g., `@nthtime/shared`, `@nthtime/verification`).

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm 10

### Setup

```bash
git clone https://github.com/spencerjireh/nthtime.git
cd nthtime
pnpm install
```

### Development

```bash
pnpm dev              # Start Next.js dev server (webpack mode)
```

The app runs with mock data by default -- no backend required. To connect Convex:

```bash
cp .env.production.example .env.local
# Fill in NEXT_PUBLIC_CONVEX_URL
npx convex dev
```

### Auth Setup (optional)

GitHub OAuth via `@convex-dev/auth`. Required Convex env vars:

- `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` -- from GitHub OAuth app
- `SITE_URL` -- your dev server origin (e.g., `http://localhost:3000`)
- `JWT_PRIVATE_KEY`, `JWKS` -- generate with `npx @convex-dev/auth`

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Build all packages |
| `pnpm lint` | ESLint all packages |
| `pnpm test` | Vitest all libraries |
| `pnpm typecheck` | TypeScript check all packages |
| `pnpm format` | Prettier format |
| `pnpm e2e` | Playwright E2E tests |
| `pnpm validate` | Validate all challenge packs |
| `pnpm seed` | Seed packs to Convex |

### Nx single-target

```bash
nx test @nthtime/verification
nx lint @nthtime/editor
nx typecheck @nthtime/shared
```

## Challenge Packs

Three launch packs with 10 challenges each:

| Pack | Language | Topics |
|------|----------|--------|
| Express Basics | JavaScript | Routing, middleware, request handling |
| React Fundamentals | TSX | Components, props, hooks, JSX patterns |
| FastAPI Basics | Python | Routes, models, decorators, response handling |

Each challenge has a reference solution and scaffold (starter template). The validator runs all assertions against reference solutions to ensure correctness.

## Docker

```bash
cp .env.production.example .env.production
# Fill in NEXT_PUBLIC_CONVEX_URL

docker compose build
docker compose up
```

The container exposes port 3000 with a health check at `GET /api/health`.

## CI

Runs on push/PR to `main` (Node 22):

validate packs -> lint -> typecheck -> test -> build -> Playwright E2E -> Docker build verify

## License

[AGPL-3.0](LICENSE)
