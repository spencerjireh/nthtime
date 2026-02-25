# nthtime CLI

Drill code patterns from your terminal. Local-first companion to the nthtime web app.

## Core Loop

1. User copies a command from the website (e.g. `nthtime start express-basics/middleware-chain`)
2. First run prompts for a default workspace directory (default: `~/nthtime`)
3. CLI fetches the challenge from the nthtime REST API
4. Scaffold files are written to `<workspace>/<pack>/<challenge>/`
5. Full-screen watch mode starts -- on each save, Tree-sitter verification runs and prints assertion results
6. When all assertions pass, an interactive prompt offers to open the challenge on nthtime.dev or exit
7. Files stay on disk after the session ends

That's it. No history, no accounts, no session management, no auto-advancing to the next challenge.

## Commands

### `nthtime start <pack>/<challenge>`

Scaffold files and enter watch mode.

```
nthtime start express-basics/middleware-chain
```

- Fetches challenge data (scaffold, assertions, hints) from the REST API
- Creates `<workspace>/express-basics/middleware-chain/` with scaffold files
- Writes `.nthtime.json` metadata file (pack slug, challenge slug, server URL, cached assertions and scaffold)
- Enters full-screen watch mode
- If the directory already exists, prompts: resume where you left off, or start fresh (deletes all files and re-scaffolds)
- `--dir <path>` overrides workspace directory for this session

### `nthtime verify [<pack>/<challenge>]`

One-shot verification without watch mode.

```
nthtime verify express-basics/middleware-chain   # explicit
cd ~/nthtime/express-basics/middleware-chain && nthtime verify   # auto-detect
```

- If no identifier is given, reads `.nthtime.json` from the current directory to auto-detect the challenge
- If no identifier is given and no `.nthtime.json` exists in the current directory, exits with an error and usage hint
- Fetches assertions from server (or uses cached assertions from `.nthtime.json` if offline)
- Runs verification against local files, prints results, exits with code 0 (all pass) or 1 (failures)

## Watch Mode

Full-screen alternate-screen TUI (like vim/htop). Takes over the terminal, exits cleanly back to the prompt.

### Output Format

Initial screen shows the challenge prompt, then transitions to assertion results on first save:

```
  express-basics / middleware-chain
  intermediate

  Create an Express middleware chain that logs
  requests, validates auth tokens, and passes
  control to the next handler.

  Waiting for changes...

  [h] hint  [r] run  [q] quit
```

After a file save, compact pass/fail per assertion, one line each:

```
[watching] app.js saved

  x  Import the express module
  *  Create an Express app instance
  *  Define a GET route for '/'
  *  Export the app as default

  3/4 passing

  [h] hint  [r] run  [q] quit
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `h` | Reveal next hint (progressive, like the web app) |
| `q` | Quit watch mode |
| `r` | Re-run verification manually (also shown in footer) |

### On Success

```
  4/4 passing -- all assertions met!
  Completed in 2:34

  > Open on nthtime.dev
    Exit
```

Timer starts when `nthtime start` is invoked, displayed on success.

### Debounce

chokidar watches the challenge directory with a 500ms debounce. Matches the web app's draft save interval and handles atomic-write editors (vim, VS Code). The watcher ignores `.nthtime.json` to avoid triggering verification on metadata writes.

## Disk Layout

```
~/nthtime/                              # workspace root (configurable)
  express-basics/
    middleware-chain/
      .nthtime.json                     # metadata (see below)
      app.js                            # scaffold file
    hello-world/
      .nthtime.json
      app.js
  react-fundamentals/
    use-state-counter/
      .nthtime.json
      App.tsx
```

### `.nthtime.json`

Written by `nthtime start`. Used by `nthtime verify` for auto-detection and offline support.

```json
{
  "pack": "express-basics",
  "challenge": "middleware-chain",
  "server": "https://nthtime.dev",
  "title": "Middleware Chain",
  "prompt": "Create an Express middleware chain that...",
  "difficulty": "intermediate",
  "hints": ["Start by importing express", "..."],
  "assertions": {
    "perFile": { "app.js": [{ "type": "importDeclaration", "source": "express", "..." }] },
    "crossFile": []
  },
  "scaffold": [
    { "path": "app.js", "content": "// Create your Express app here\n" }
  ]
}
```

Caches everything the watch screen and verify command need. Fully offline after first `nthtime start`.

## REST API

Two endpoints on the Next.js app. No authentication required (read-only challenge data).

### `GET /api/cli/challenge/:packSlug/:challengeSlug`

Returns the full challenge payload for the CLI.

```json
{
  "title": "Middleware Chain",
  "prompt": "Create an Express middleware chain that...",
  "difficulty": "intermediate",
  "scaffold": [{ "path": "app.js", "content": "..." }],
  "assertions": { "perFile": {}, "crossFile": [] },
  "hints": ["Start by importing express", "..."],
  "webUrl": "https://nthtime.dev/challenge/abc123?pack=express-basics"
}
```

### `GET /api/cli/pack/:packSlug`

Returns the challenge list for a pack (used for validation and the "next challenge" URL on success).

```json
{
  "name": "Express Basics",
  "slug": "express-basics",
  "challenges": [
    { "title": "Hello World", "slug": "hello-world", "order": 1 },
    { "title": "Route Params", "slug": "route-params", "order": 2 }
  ]
}
```

## Configuration

Stored at `~/.config/nthtime/config.json` (XDG Base Directory convention via `env-paths` or similar).

```json
{
  "workspace": "~/nthtime"
}
```

- Server URL is hardcoded to the production URL (e.g. `https://nthtime.dev`)
- Override via `NTHTIME_URL` environment variable for development
- Workspace directory overridable per-session with `--dir` flag

### First Run

On first invocation, the CLI prompts for a workspace directory:

```
Welcome to nthtime.

Where should challenges be saved?
> ~/nthtime
```

Saves to XDG config. That's the only setup step -- no auth, no server URL, no language preference.

## Architecture

### Monorepo Placement

Lives in `apps/cli/` within the Nx monorepo. Published to npm as `nthtime`.

### Dependencies

- **@nthtime/shared** -- types (Pack, Challenge, Assertion, VerificationResult, etc.)
- **@nthtime/verification** -- `verify()` function, grammar loader. Works natively in Node.js: auto-discovers WASM grammars from `node_modules` when no `wasmBasePath` is given. No browser adapter needed.
- **Ink** -- React-based terminal UI framework. Handles full-screen rendering, keyboard input, component model.
- **chokidar** -- file watching with 500ms debounce
- **tree-sitter-wasms** + **web-tree-sitter** -- WASM grammars bundled in the npm package (~6MB). No runtime download needed.
- **env-paths** (or similar) -- XDG config directory resolution

### Bundling

tsup (esbuild-based) bundles the CLI into a single distributable. Tree-shakes dependencies, handles TypeScript natively. WASM files are included as package assets.

### WASM Resolution

The verification engine's grammar loader already handles Node.js: it walks up from `process.cwd()` looking for `tree-sitter-wasms` in `node_modules`. The WASM files are bundled in the published npm package so they're always present.

**Implementation note:** The current grammar loader searches from `process.cwd()`, which is the user's working directory -- not where the CLI package is installed. When run via `npx nthtime`, the loader won't find the WASM files by walking up from cwd. The loader will need a small patch to also search from `__dirname` (the package's install location) as a fallback.

## Schema (Implemented)

### Challenge Slugs

Challenges have a `slug` field, unique within a pack. The CLI identifies challenges by slug pair (`express-basics/middleware-chain`).

- `slug: v.string()` on the Convex `challenges` table with compound index `by_pack_slug` (`packId`, `slug`)
- `challenges.getByPackAndSlug` query resolves pack by `by_slug` index, then challenge by `by_pack_slug`
- Slugs are derived from filenames at seed/validate time: `01-hello-world.json` -> `hello-world` (no slug field in the JSON files themselves)
- `validate-packs.ts` enforces slug format (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`) and uniqueness per pack
- Author-created challenges (web UI) derive slugs from the title via `slugify()`
- REST API endpoints use slugs for lookup

## TUI Visual Language

- Styled to match DESIGN.md: monospace text, flat surfaces, minimal color
- Burnt-orange (`#EF6F2E`) accent for the pass state and branding elements
- The orange dot motif from the web app carries over as a terminal element
- `*` for passing assertions, `x` for failing
- Keep it cool but keep it simple

## What It Is Not

- Not a session runner or challenge queue
- No progress tracking or history (yet)
- No account sync or login
- No pack browsing -- the website handles discovery, the CLI handles drilling
- No solution viewer -- "Open on nthtime.dev" defers to the web app
