# nthtime

**Drill code patterns until they're muscle memory.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D22-green.svg)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-10-orange.svg)](https://pnpm.io)

<!-- TODO: Add screenshot of the challenge view -->

nthtime is a web-based drilling platform for programming syntax and framework patterns. You know the concepts -- nthtime builds the muscle memory. Write Express middleware, React hooks, FastAPI routes, and complete multi-file applications from a blank canvas, then get instant structural feedback powered by Tree-sitter AST analysis. No code execution, no test runners -- just parse, verify, and repeat until you can write it without thinking.

## Who is this for?

Developers who understand the concepts but reach for documentation every time they write a middleware chain or a custom hook. Specifically:

- **Maintaining fluency** across frameworks you don't use daily
- **Locking in new patterns** after learning a framework, so they stick
- **Adopting a new stack** and wanting to internalize its idioms fast
- **Preparing for timed assessments** where searching docs isn't an option

## How it works

1. **Browse** -- Pick a challenge pack from the catalog. Filter by language, framework, or difficulty.
2. **Write** -- Open a challenge and write code from a blank canvas or a provided scaffold. Full Monaco editor with file tree, tabs, and Vim/Emacs keybindings.
3. **Submit** -- Your code is parsed into an AST and checked against structural assertions entirely in the browser. Results are instant.
4. **Review** -- See what passed and what didn't. Choose your feedback level: just a pass/fail banner, per-assertion breakdown, progressive hints, inline annotations showing where assertions failed, or a full diff against the reference solution.
5. **Repeat** -- Retry, move to the next challenge, or come back later. Drafts auto-save so you pick up where you left off.

## Features

### Structural verification, not string matching

12 evaluators check your code's AST structure: function declarations, parameter counts, export patterns, decorator usage, JSX attributes, class methods, and more. Supports JavaScript, TypeScript, TSX, Python, HTML, and CSS via Tree-sitter WASM grammars running entirely in the browser.

### Choose your own feedback level

Five levels of progressive disclosure, configurable per session:

| Level | What you see |
|-------|-------------|
| L0 | Pass or fail. That's it. |
| L1 | Per-assertion breakdown with descriptive messages. |
| L2 | Progressive hints -- nudges toward the solution without spoilers. |
| L3 | Inline annotations on your submitted code showing where assertions failed. |
| L4 | Side-by-side or unified diff against the reference solution. |

Start strict (L0) to test recall. Dial up when you're stuck. The feedback level is a training parameter, not a crutch.

### Multi-file challenges

Challenges range from single functions to complete application structures with routing, middleware, models, and configuration files. Scaffolded challenges provide the file tree; blank canvas challenges start empty. The file tree, tabs, and editor feel like a real workspace.

### Full editor experience

Monaco editor (the engine behind VS Code) with syntax highlighting, autocomplete (off by default -- this is a drill), and Vim/Emacs keybinding modes. Keyboard-driven workflow: Cmd/Ctrl+Enter to submit, Cmd/Ctrl+S to format.

### Time tracking

Optional timer starts on first keystroke and runs until submission. Race yourself. See how your times improve as patterns become automatic.

### Draft autosave

Work-in-progress saves to localStorage on every change (debounced). Close the tab, come back later, pick up where you left off. Drafts clear on submission.

## Challenge packs

Three launch packs covering 30 challenges across beginner, intermediate, and advanced difficulty:

| Pack | Language | What you'll drill |
|------|----------|-------------------|
| **Express Basics** | JavaScript | Route handlers, middleware chains, error handling, request/response patterns |
| **React Fundamentals** | TSX | Component composition, props, hooks, JSX patterns, state management |
| **FastAPI Basics** | Python | Route decorators, Pydantic models, dependency injection, response handling |

Packs are portable JSON files -- author your own with a reference solution, scaffold template, and structural assertions. A local validator ensures every assertion passes against the reference before you ship.

## Quick start

```bash
git clone https://github.com/spencerjireh/nthtime.git
cd nthtime
pnpm install
pnpm dev
```

The app runs with mock data by default -- no backend setup required. Open `http://localhost:3000`, pick a pack, and start drilling.

### Optional: Convex backend

For persistent data (attempt history, user settings, auth):

```bash
cp .env.production.example .env.local
# Set NEXT_PUBLIC_CONVEX_URL
npx convex dev
```

GitHub OAuth requires additional Convex env vars (`AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS`). See the [auth setup guide](docs/guide/getting-started.md#convex-backend).

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (React 19) |
| Backend | Convex (real-time, serverless) |
| Verification | Tree-sitter WASM (client-side) |
| Editor | Monaco Editor |
| State | Zustand 5 (vanilla stores) |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Testing | Vitest 4 + Playwright |
| Monorepo | Nx 22.5 + pnpm 10 |

## Project structure

```
apps/web/               Next.js frontend
libs/
  shared/               Types: Pack, Challenge, Assertion, Verification
  data-access/          Repository interfaces + Convex implementation
  verification/         Tree-sitter verification engine (12 evaluators)
  editor/               Zustand store, language mapping, draft storage
convex/                 Backend: schema, auth, server functions
packs/                  Challenge pack JSON (git-versioned)
tools/                  CLI: validate-packs, seed
docs/                   VitePress documentation site
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | TypeScript check |
| `pnpm e2e` | Playwright E2E tests |
| `pnpm validate` | Validate challenge packs |
| `pnpm seed` | Seed packs to Convex |

Single-target with Nx: `nx test @nthtime/verification`, `nx lint @nthtime/editor`, etc.

## Docker

```bash
cp .env.production.example .env.production
# Set NEXT_PUBLIC_CONVEX_URL
docker compose build && docker compose up
```

Health check at `GET /api/health`.

## Documentation

Full docs at [spencerjireh.github.io/nthtime](https://spencerjireh.github.io/nthtime/):

- [Getting Started](docs/guide/getting-started.md)
- [Architecture](docs/guide/architecture.md)
- [Pack Authoring](docs/deep-dives/pack-authoring.md)
- [Verification Engine](docs/deep-dives/verification-engine.md)
- [Contributing](docs/guide/contributing.md)

## License

[AGPL-3.0](LICENSE)
