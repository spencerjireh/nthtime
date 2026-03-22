# Phase 0: Monorepo Foundation

> **Status:** Complete
> **Spec ID prefix:** `FOUND`
> **Phase:** 0
> **Completed:** 2026-02-20

## Overview

Establishes the Nx monorepo with pnpm workspaces, TypeScript project references, and the workspace layout that all subsequent phases build on. This phase produces no user-facing features -- it sets up the build system, linting, formatting, and CI pipeline that every library and application depends on.

## Dependencies

None -- this is the foundation layer.

## User Flows

### Developer Setup

1. Clone the repository
2. Run `pnpm install` to install all dependencies
3. Run `pnpm dev` to start the Next.js dev server
4. Run `pnpm test` to execute all library tests in watch mode
5. Run `pnpm lint` and `pnpm typecheck` to validate code quality

### CI Pipeline

1. Push to `main` or open a PR targeting `main`
2. CI validates packs, runs lint (affected), typecheck (all), test (affected), build (affected)
3. E2E and Docker steps run when `SPRING_BOOT_URL` is configured

## Acceptance Criteria

### Workspace Structure

- [ ] **FOUND-01** -- The repository is an Nx 22.x monorepo using pnpm 10 workspaces with Crystal plugin auto-inference for build, dev, lint, test, and typecheck targets.
- [ ] **FOUND-02** -- Libraries use pnpm workspace protocol (`workspace:*`) and TypeScript project references for inter-package linking, not tsconfig path aliases.
- [ ] **FOUND-03** -- Each library's `package.json` has an `exports` field pointing to `./src/index.ts` for direct source imports.

### TypeScript Configuration

- [ ] **FOUND-04** -- Base tsconfig uses strict mode, `es2022` target, `nodenext` module resolution, and `composite: true`.
- [ ] **FOUND-05** -- Libraries use `.js` extensions in imports as required by `nodenext` resolution.

### Build and Dev

- [ ] **FOUND-06** -- `pnpm dev` starts the Next.js dev server using the webpack flag (Turbopack is not used due to Nx dynamic `require()` incompatibility).
- [ ] **FOUND-07** -- `pnpm build` builds all packages successfully via Nx.

### Code Quality

- [ ] **FOUND-08** -- ESLint 9 flat config with TypeScript ESLint and Nx boundary rules enforces code style. Prettier enforces formatting (single quotes, trailing commas, 100 char width, 2-space indent).

## Technical Context

### Key Files

| File | Role |
|------|------|
| `nx.json` | Nx workspace configuration with Crystal plugin auto-inference |
| `pnpm-workspace.yaml` | Workspace package glob definitions |
| `tsconfig.base.json` | Base TypeScript configuration shared across all packages |
| `eslint.config.mjs` | ESLint 9 flat config with Nx boundary rules |
| `.prettierrc` | Prettier configuration |
| `apps/web/project.json` | Next.js project with webpack-flagged build and dev targets |
| `apps/web/next.config.js` | Webpack experiments, extension aliases, module replacements |

### Patterns and Decisions

- **Crystal plugins** auto-infer targets from config files (vitest.config, tsconfig, etc.), eliminating most explicit target definitions in `project.json` files.
- **Webpack over Turbopack** -- Turbopack fails with Nx's dynamic `require()` calls. Both `build` and `dev` targets override to use `--webpack`.
- **`nodenext` module resolution** -- enforces explicit `.js` extensions in imports. `next.config.js` bridges this with `extensionAlias: { '.js': ['.ts', '.tsx', '.js'] }`.
- **`asyncWebAssembly` experiment** -- enabled in webpack config for Tree-sitter WASM loading in the browser.

## Test Coverage

### Unit Tests

No unit tests specific to this phase -- the foundation is validated by all subsequent phases building and testing successfully.

## Open Questions

- None at this time.
