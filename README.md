<p align="center">
  <img src="apps/web/public/logo-mark.png" alt="nthtime" width="80" />
</p>

<h3 align="center">nthtime</h3>
<p align="center">Drill code patterns until they're muscle memory.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL--3.0-blue.svg" alt="License: AGPL-3.0" /></a>
  <img src="https://img.shields.io/badge/Node-%3E%3D22-green.svg" alt="Node >= 22" />
  <img src="https://img.shields.io/badge/pnpm-10-orange.svg" alt="pnpm 10" />
</p>

---

Write Express middleware, React hooks, FastAPI routes, and multi-file applications from a blank canvas. Get instant structural feedback powered by Tree-sitter AST analysis -- no code execution, no test runners. Just parse, verify, repeat.

**For developers who** know the concepts but reach for docs every time they write a middleware chain or a custom hook. Maintain fluency across stacks, lock in new patterns, internalize idioms fast.

## Features

- **AST-based verification** -- 12 evaluators check structure, not strings. Runs entirely in the browser via Tree-sitter WASM. Supports JS, TS, TSX, Python, HTML, CSS.
- **Progressive feedback** -- 5 levels from bare pass/fail (L0) up to full diff against the reference solution (L4). Start strict, dial up when stuck.
- **Multi-file challenges** -- Single functions to complete app structures with routing, middleware, models. Scaffolded or blank canvas.
- **Full editor** -- Monaco with syntax highlighting, Vim/Emacs modes, file tree, tabs. Cmd+Enter to submit, Cmd+S to format.
- **Time tracking** -- Timer starts on first keystroke. Race yourself. Watch the times drop.
- **Draft autosave** -- Work-in-progress persists to localStorage. Close the tab, come back later, pick up where you left off.

## Quick start

```bash
git clone https://github.com/spencerjireh/nthtime.git
cd nthtime
pnpm install
pnpm dev
```

Requires a Convex backend. Set `NEXT_PUBLIC_CONVEX_URL` in `.env.local` and run `npx convex dev` alongside the dev server. See the [getting started guide](docs/guide/getting-started.md) for full setup.

## Challenge packs

30 challenges across 3 launch packs:

| Pack | Lang | Covers |
|------|------|--------|
| **Express Basics** | JS | Route handlers, middleware, error handling, req/res patterns |
| **React Fundamentals** | TSX | Components, props, hooks, JSX patterns, state |
| **FastAPI Basics** | Python | Decorators, Pydantic models, DI, response handling |

Packs are portable JSON -- [author your own](docs/deep-dives/pack-authoring.md) with a reference solution, scaffold, and structural assertions.

## Tech stack

| | |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind v3, shadcn/ui |
| **Backend** | Convex (real-time, serverless) |
| **Verification** | Tree-sitter WASM (client-side) |
| **Editor** | Monaco |
| **State** | Zustand 5 (vanilla stores) |
| **Testing** | Vitest 4 + Playwright |
| **Monorepo** | Nx 22.5 + pnpm 10 |

## Project structure

```
apps/web/          Next.js frontend
libs/
  shared/          Types: Pack, Challenge, Assertion, Verification
  data-access/     Repository interfaces + Convex impl
  verification/    Tree-sitter verification engine (12 evaluators)
  editor/          Zustand store, language mapping, draft storage
convex/            Backend: schema, auth, server functions
packs/             Challenge pack JSON (git-versioned)
tools/             CLI: validate-packs, seed
```

## Docs

Full documentation at [spencerjireh.github.io/nthtime](https://spencerjireh.github.io/nthtime/) -- [architecture](docs/guide/architecture.md), [pack authoring](docs/deep-dives/pack-authoring.md), [verification engine](docs/deep-dives/verification-engine.md), [contributing](docs/guide/contributing.md).

## License

[AGPL-3.0](LICENSE)
