<p align="center">
  <img src="apps/web/public/logo-mark.png" alt="nthtime" width="80" />
</p>

<h3 align="center">nthtime</h3>
<p align="center">Drill code patterns until they're muscle memory.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License: Apache-2.0" /></a>
  <img src="https://img.shields.io/badge/Node-%3E%3D22-green.svg" alt="Node >= 22" />
  <img src="https://img.shields.io/badge/pnpm-10-orange.svg" alt="pnpm 10" />
</p>

---

Write real implementations from a blank canvas -- route handlers, hooks, middleware, models, and more. Get instant structural feedback powered by Tree-sitter AST analysis -- no code execution, no test runners. Just parse, verify, repeat.

**For developers who** know the concepts but reach for docs every time. Maintain fluency across stacks, lock in new patterns, internalize idioms fast.

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

For full-stack development, start Spring Boot and PostgreSQL with `docker compose up` alongside the dev server. See the [getting started guide](docs/guide/getting-started.md) for full setup.

## Challenge packs

A growing library of packs across frameworks and languages. Current packs include Express, React, and FastAPI -- with more on the way.

Packs are portable JSON -- [author your own](docs/deep-dives/pack-authoring.md) with a reference solution and structural assertions.

## Tech stack

| | |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind v3, shadcn/ui |
| **Backend** | Spring Boot 3.5 + PostgreSQL 16 |
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
  data-access/     Repository interfaces
  verification/    Tree-sitter verification engine (12 evaluators)
  editor/          Zustand store, language mapping, draft storage
services/api/      Spring Boot backend (Java 25, PostgreSQL 16)
packs/             Challenge pack JSON (git-versioned)
tools/             CLI: validate-packs, seed
```

## Docs

Full documentation at [spencerjireh.github.io/nthtime](https://spencerjireh.github.io/nthtime/) -- [architecture](docs/guide/architecture.md), [pack authoring](docs/deep-dives/pack-authoring.md), [verification engine](docs/deep-dives/verification-engine.md), [contributing](docs/guide/contributing.md).

## License

[Apache-2.0](LICENSE)
