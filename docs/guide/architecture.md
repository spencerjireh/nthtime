# Architecture

nthtime is an Nx 22.5.1 monorepo managed with pnpm 10 workspaces. This page describes the workspace layout, linking strategy, module resolution bridging, and core data flows.

## Workspace layout

```
nthtime/
  apps/
    web/              Next.js 16 frontend (shadcn/ui, Monaco, Tailwind v3)
  libs/
    shared/           Pure types: Pack, Challenge, Assertion, Verification, Attempt, Settings
    data-access/      Repository interfaces: PackRepository, AttemptRepository, SettingsRepository
    verification/     Tree-sitter WASM verification engine (12 evaluators + pipeline)
    editor/           Zustand vanilla store (EditorStore), language mapping, time formatting, drafts
  convex/             Backend schema + server functions (NOT an Nx project, lives at repo root)
  packs/              Challenge pack JSON files (pack.json + challenges/*.json per pack)
  tools/              CLI scripts: validate-packs.ts, seed.ts
  docs/               VitePress documentation site
```

### Key boundaries

- **`apps/web`** is the only deployable application. It consumes all four libraries.
- **`libs/`** packages are framework-agnostic (no React imports except where noted). They export pure logic and types.
- **`convex/`** lives at the repo root and is not managed by Nx. It has its own `tsconfig.json` that must exclude `__tests__/` to prevent Vitest-only types from blocking `npx convex dev`.
- **`packs/`** contains challenge content as JSON. Validated by `tools/validate-packs.ts` and seeded to Convex by `tools/seed.ts`.
- **`tools/`** scripts use direct relative imports (not workspace packages) and `fileURLToPath(import.meta.url)` for `__dirname` because `import.meta.dirname` is undefined under `npx tsx`.

## Nx Crystal plugins

Nx Crystal plugins **auto-infer** `build`, `dev`, `lint`, `test`, and `typecheck` targets from existing config files (e.g., `vite.config.ts`, `tsconfig.json`, `.eslintrc`). Most `project.json` files do not need explicit target definitions.

The exceptions are `apps/web/project.json`, which overrides `build` and `dev` targets to pass the `--webpack` flag to Next.js.

## Library linking

Libraries use **pnpm workspace protocol** and **TypeScript project references** -- not tsconfig path aliases.

Each library's `package.json` declares:

```json
{
  "name": "@nthtime/shared",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

Consumers depend on workspace packages:

```json
{
  "dependencies": {
    "@nthtime/shared": "workspace:*"
  }
}
```

Import with the bare specifier:

```ts
import { Pack, Challenge } from '@nthtime/shared';
```

TypeScript resolution works through `composite: true` and project references in each library's `tsconfig.json`.

## Module resolution bridging

There is a resolution mismatch between libraries and the Next.js app:

| Layer       | `moduleResolution` | Import style          |
| ----------- | ------------------ | --------------------- |
| Libraries   | `nodenext`         | `.js` extensions required |
| apps/web    | `bundler`          | No extensions needed  |

`next.config.js` bridges this gap with:

```js
extensionAlias: {
  '.js': ['.ts', '.tsx', '.js'],
}
```

This tells webpack to try `.ts` and `.tsx` when it encounters a `.js` import from a library.

## next.config.js setup

The Next.js configuration handles several integration concerns:

- **`--webpack` flag**: Required for both `build` and `dev`. Turbopack fails with Nx's dynamic `require()` calls.
- **`asyncWebAssembly` experiment**: Enables Tree-sitter WASM grammars to load in the browser. Grammar files (JS, TS, TSX, Python, HTML, CSS) are served from `apps/web/public/tree-sitter/`.
- **`NormalModuleReplacementPlugin`**: Rewrites `node:` scheme imports (e.g., `node:fs`, `node:path`) used by `@nthtime/verification`. Combined with `resolve.fallback: false` for `fs`/`path` in the browser bundle.
- **Monaco editor alias**: `monaco-editor$` is aliased to `src/lib/monaco-editor-shim.js`, which re-exports `window.monaco`. This is necessary because `monaco-emacs` calls `require('monaco-editor')` expecting the AMD bundle. The alias must apply to both server and client builds.
- **`output: 'standalone'`**: Produces a minimal production image for Docker.

## Data flow

The core user journey follows this path:

```
Catalog (/) --> Pack (/pack/[slug]) --> Challenge (/challenge/[id]?pack=slug)
                                              |
                                              v
                                        Monaco Editor
                                              |
                                              v
                                    Verification Engine
                                      (Tree-sitter WASM)
                                              |
                                              v
                                        Results View
                                    (pass/fail, diff, hints)
```

- The **pack slug** is threaded via the `?pack=` query parameter throughout navigation (catalog to pack to challenge to results).
- The **editor store** (`@nthtime/editor`) manages file state, timer, draft persistence, and view mode (`editing` | `results`).
- **Verification** runs client-side using Tree-sitter WASM grammars. The engine has 12 evaluators and a pipeline that processes assertions against parsed ASTs.
- **Feedback level** (0--4) controls how much detail the results view reveals: L0 = banner only, L1 = pass/fail per assertion, L2 = hints, L3 = details + location, L4 = diff view.

## Data access layer

`apps/web/src/lib/data-access/` implements a provider pattern that switches between **mock hooks** (no backend) and **Convex hooks** at build time.

```
DataAccessProvider
  |
  +-- process.env.NEXT_PUBLIC_CONVEX_URL defined?
        |
        +-- Yes --> Convex hooks (real backend queries/mutations)
        +-- No  --> Mock hooks (static data, localStorage)
```

The switch uses **only** `process.env.NEXT_PUBLIC_CONVEX_URL` (inlined at build time). It must **never** use `typeof window` to choose hooks, because that causes hydration mismatches (server renders mock data, client renders loading state).

Components call `useDataAccess()` to get the active hook implementations, keeping UI code backend-agnostic.
