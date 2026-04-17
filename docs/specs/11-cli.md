# Phase 11: CLI

> **Status:** Complete
> **Spec ID prefix:** `CLI`
> **Phase:** 11
> **Completed:** 2026-02-25

## Overview

The nthtime CLI provides a terminal-based workflow for solving challenges without a browser. Built with Ink 5 (React 18 TUI framework) and Commander, it offers two commands: `nthtime start <pack/challenge>` for interactive watch mode with live verification, and `nthtime verify [pack/challenge]` for one-shot verification. The CLI fetches challenge data from the web server's REST API, scaffolds files locally, caches metadata in `.nthtime.json`, and runs the same Tree-sitter WASM verification engine used by the web frontend.

## Dependencies

- [VRFY-01] through [VRFY-08] (verification engine with WASM grammar loading)
- [DSST-02], [DSST-03], [DSST-04] (Challenge, Assertion, AssertionSet types)
- [AUTH-04], [AUTH-05] (Spring Boot backend serving challenge data)

## User Flows

### Starting a Challenge (Watch Mode)

1. User runs `nthtime start express-basics/hello-world`
2. CLI parses the `pack/challenge` slug
3. CLI fetches challenge data from the server via `/api/cli/challenges/[packSlug]/[challengeSlug]`
4. CLI creates the working directory (based on workspace config or cwd)
5. If fileStubs is enabled (default), empty files are created at expected paths
6. `.nthtime.json` metadata file is written with assertions, hints, and expected files
7. Ink TUI renders the challenge prompt and verification output
8. chokidar watches for file changes
9. On each save, CLI reads files from disk and runs the verification engine
10. Results update in the TUI in real time

### One-Shot Verification

1. User runs `nthtime verify` (or `nthtime verify express-basics/hello-world`)
2. If no slug argument, CLI reads `.nthtime.json` from the current directory
3. If slug given, CLI fetches challenge data from the server
4. CLI reads current files from disk
5. Verification engine runs once
6. Results are printed to stdout and CLI exits with appropriate exit code

### Configuration

1. User runs `nthtime config` to manage settings
2. Config is stored at `~/.config/nthtime/config.json` (via env-paths)
3. `NTHTIME_URL` env var overrides the configured server URL
4. Default server: `https://nthtime.spencerjireh.com`

## Acceptance Criteria

### Slug Parsing

- [ ] **CLI-01** -- `parseSlug()` parses `pack/challenge` format into packSlug and challengeSlug components.
- [ ] **CLI-02** -- `parseSlug()` throws `SlugParseError` for empty strings, missing separators, and malformed input.

### API Communication

- [ ] **CLI-03** -- `fetchPack()` retrieves pack data from `/api/cli/packs/[packSlug]`.
- [ ] **CLI-04** -- `fetchChallenge()` retrieves challenge data from `/api/cli/challenges/[packSlug]/[challengeSlug]`.
- [ ] **CLI-05** -- API functions throw `ApiError` with status code on non-200 responses.
- [ ] **CLI-06** -- Slugs are URL-encoded in API requests.

### File Scaffolding

- [ ] **CLI-07** -- `initChallengeFiles()` creates empty stub files at expected paths when fileStubs is true.
- [ ] **CLI-08** -- `initChallengeFiles()` creates the directory but no files when fileStubs is false.
- [ ] **CLI-09** -- Existing files are not overwritten during scaffolding.
- [ ] **CLI-10** -- Nested directory structures are created as needed.

### Metadata

- [ ] **CLI-11** -- `.nthtime.json` is written with pack slug, challenge slug, title, prompt, assertions, hints, expected files, and web URL.
- [ ] **CLI-12** -- `readMetadata()` returns null for missing or invalid `.nthtime.json` files.

### Verification

- [ ] **CLI-13** -- `prepareVerify()` auto-detects the challenge from `.nthtime.json` when no slug argument is given.
- [ ] **CLI-14** -- When a slug argument is provided, it overrides the metadata slug.
- [ ] **CLI-15** -- When the server is unreachable, verification falls back to cached assertions from `.nthtime.json`.
- [ ] **CLI-16** -- When both the server and cached assertions are unavailable, verification throws an error.

### Configuration

- [ ] **CLI-17** -- `resolveServerUrl()` checks `NTHTIME_URL` env var first, then config file `serverUrl`, then falls back to the default.

## Technical Context

### Key Files

| File | Role |
|------|------|
| `apps/cli/src/cli.ts` | Commander program with start, verify, and config commands |
| `apps/cli/src/types.ts` | CliChallengeResponse, CliPackResponse, NthtimeMetadata, CliConfig |
| `apps/cli/src/api.ts` | fetchPack, fetchChallenge REST client functions |
| `apps/cli/src/slug.ts` | parseSlug with SlugParseError |
| `apps/cli/src/scaffold.ts` | initChallengeFiles, readMetadata, writeMetadata, readChallengeFiles |
| `apps/cli/src/verify-command.ts` | prepareVerify, runVerify one-shot verification |
| `apps/cli/src/start-command.ts` | prepareStart, startWatchMode setup |
| `apps/cli/src/watch.ts` | Ink TUI with chokidar file watcher |
| `apps/cli/src/config.ts` | loadConfig, saveConfig, resolveServerUrl, getWorkspace |
| `apps/cli/src/wasm.ts` | WASM grammar path resolution for CLI |
| `apps/cli/src/format-results.ts` | formatResultLines, formatResultSummary |
| `apps/cli/src/resolve-dir.ts` | resolveStartDir working directory resolution |
| `apps/cli/scripts/copy-wasm.js` | Copies WASM grammars to apps/cli/wasm/ for bundling |
| `apps/web/src/app/api/cli/packs/[packSlug]/route.ts` | CLI pack data endpoint |
| `apps/web/src/app/api/cli/challenges/[packSlug]/[challengeSlug]/route.ts` | CLI challenge data endpoint |

### Patterns and Decisions

- **tsup bundling** -- CLI is bundled to a single ESM file targeting `node20`. `@nthtime/shared` and `@nthtime/verification` are inlined (`noExternal`), while `web-tree-sitter` is kept external.
- **WASM resolution** -- `apps/cli/src/wasm.ts` resolves grammar paths relative to `import.meta.url`, with a fallback walk through `node_modules`.
- **React 18** -- Ink 5 requires React 18 (web uses React 19). This is intentional and managed via pnpm workspace isolation.
- **Offline fallback** -- when the server is unreachable, the CLI uses cached assertions from `.nthtime.json` for verification. This enables offline workflows after the initial fetch.
- **env-paths** -- config lives at the OS-appropriate config directory (`~/.config/nthtime/` on macOS/Linux).

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/cli/packs/[packSlug]` | GET | Pack metadata with challenge list for CLI |
| `/api/cli/challenges/[packSlug]/[challengeSlug]` | GET | Full challenge data for CLI |

## Test Coverage

### Unit Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| CLI-01 | `apps/cli/src/__tests__/slug.spec.ts` | parses valid pack/challenge slug |
| CLI-02 | `apps/cli/src/__tests__/slug.spec.ts` | throws SlugParseError on empty, missing separator, etc. |
| CLI-03 | `apps/cli/src/__tests__/api.spec.ts` | fetchPack returns data on success, throws on 404 |
| CLI-04 | `apps/cli/src/__tests__/api.spec.ts` | fetchChallenge returns data, throws on 404 |
| CLI-06 | `apps/cli/src/__tests__/api.spec.ts` | encodes slugs in URL |
| CLI-07 | `apps/cli/src/__tests__/scaffold.spec.ts` | creates empty stub files when fileStubs is true |
| CLI-08 | `apps/cli/src/__tests__/scaffold.spec.ts` | creates directory but no files when fileStubs is false |
| CLI-09 | `apps/cli/src/__tests__/scaffold.spec.ts` | does not overwrite existing files |
| CLI-10 | `apps/cli/src/__tests__/scaffold.spec.ts` | creates nested directories |
| CLI-11 | `apps/cli/src/__tests__/scaffold.spec.ts` | round-trips metadata through write/read |
| CLI-12 | `apps/cli/src/__tests__/scaffold.spec.ts` | returns null for missing/invalid metadata |
| CLI-13 | `apps/cli/src/__tests__/verify-command.spec.ts` | reads slug from metadata when no arg given |
| CLI-14 | `apps/cli/src/__tests__/verify-command.spec.ts` | slug argument overrides metadata slug |
| CLI-15 | `apps/cli/src/__tests__/verify-command.spec.ts` | falls back to cached assertions when fetch fails |
| CLI-16 | `apps/cli/src/__tests__/verify-command.spec.ts` | throws when fetch fails and no cached assertions |
| CLI-17 | `apps/cli/src/__tests__/config.spec.ts` | resolveServerUrl: env > config > default |

## Open Questions

- None at this time.
