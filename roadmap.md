# nthtime -- Implementation Roadmap

**Derived from:** nthtime PRD v4 (MVP)
**Created:** 2026-02-19
**License:** Apache-2.0

---

## Dependency Graph

```
Phase 0: Monorepo Foundation + CI Skeleton
  |
  v
Phase 1: Design System + Shared Types
  |
  +-------+-------+
  |       |       |
  v       v       v
Ph 2    Ph 3    Ph 4
Verify  Auth    Editor
Engine  +Data
  |       |       |
  +---+---+---+---+
      |       |
      v       v
    Ph 5    Ph 6
   Catalog  Drafts+
            Settings
      |       |
      +---+---+
          |
          v
        Ph 7
      Challenge
        Flow
          |
          v
        Ph 8
       Launch
        Packs
          |
          v
        Ph 9
      Polish +
      Deploy
```

Phases 2, 3, and 4 can be developed in parallel after Phase 1.
Phases 5 and 6 can be developed in parallel after Phases 2-4.
Phase 7 is the integration phase where all prior work converges.

---

## Phase 0 -- Monorepo Foundation + CI Skeleton

**Goal:** Repository structure, tooling, and CI pipeline that all subsequent phases build on.

### Checklist

- [x] Initialize git repository with `.gitignore` (node_modules, .env, dist, .next, .convex)
- [x] Initialize pnpm workspace (`pnpm-workspace.yaml`)
- [x] Initialize Nx workspace with pnpm preset
- [x] Scaffold Next.js app at `apps/web/` (App Router, TypeScript, Tailwind CSS)
- [x] Initialize Convex project at `convex/` (`npx convex init`)
- [x] Create empty Nx library scaffolds:
  - [x] `libs/shared/` -- shared types and constants
  - [x] `libs/data-access/` -- repository interfaces + implementations
  - [x] `libs/verification/` -- assertion engine
  - [x] `libs/editor/` -- Monaco wrapper
- [x] Create `packs/` directory with a placeholder README
- [x] Create `tools/` directory for CLI scripts
- [x] Configure TypeScript project references across workspace
- [x] Configure path aliases in `tsconfig.base.json` (`@nthtime/shared`, `@nthtime/data-access`, `@nthtime/verification`, `@nthtime/editor`)
- [x] Set up Vitest configuration (workspace-level + per-library)
- [x] Set up Playwright configuration (in `apps/web/`)
- [x] Create GitHub Actions CI workflow:
  - [x] Install dependencies (pnpm)
  - [x] Lint (ESLint)
  - [x] Type check (tsc --noEmit)
  - [x] Unit tests (Vitest)
  - [x] Build (Next.js)
  - [x] Placeholder steps for Convex deploy and Docker build (disabled until later phases)
- [x] Add ESLint configuration (flat config, TypeScript rules)
- [x] Add Prettier configuration (project-level)
- [x] Add `AGPL-3.0` LICENSE file
- [x] Verify `nx affected` correctly detects changes across libraries

### Validation Gate

CI pipeline runs green on an empty workspace: lint passes, type check passes, Vitest finds zero tests and exits cleanly, Next.js builds successfully, all Nx libraries resolve their imports.

**Completed:** 2026-02-20

---

## Phase 1 -- Design System + Shared Types

**Goal:** Visual foundation and shared type contracts used by all feature phases.

### Checklist

- [x] Configure Tailwind CSS with custom theme tokens:
  - [x] Color palette (dark-first, custom non-generic aesthetic)
  - [x] Typography scale
  - [x] Spacing and radius tokens
  - [x] Breakpoints (desktop only -- no mobile)
- [x] Install and configure shadcn/ui with custom theme
- [x] Build base component overrides/variants:
  - [x] Button (primary, secondary, ghost, destructive)
  - [x] Card (pack card, challenge card)
  - [x] Badge (difficulty: beginner/intermediate/advanced, status: pass/fail)
  - [x] Dialog / Sheet
  - [x] Tabs
  - [x] Tooltip
  - [x] Input / Select / Checkbox / Toggle
- [x] Create app shell layout component (header, main content area, no sidebar at app level)
- [x] Implement dark/light theme toggle (dark default, system-preference-aware)
- [x] Define shared TypeScript types in `libs/shared/`:
  - [x] `Pack` -- name, slug, description, language, framework, version, author, tags, challenges
  - [x] `Challenge` -- id, title, prompt, difficulty, tags, timeEstimateSeconds, scaffolded, files, hints, assertions
  - [x] `ChallengeFile` -- path, content
  - [x] `Assertion` -- JSON DSL types + S-expression query types
  - [x] `AssertionResult` -- pass/fail, message, file path, location
  - [x] `VerificationResult` -- overall pass/fail, per-file results, cross-file results
  - [x] `Attempt` -- userId, challengeId, passed, assertionResults, hintsUsed, timeSeconds, timestamp
  - [x] `UserSettings` -- feedbackLevel (0-4), editorKeybindings, theme, autocomplete, formatterConfig, timeTrackingEnabled
  - [x] `FeedbackLevel` -- enum L0-L4
  - [x] `Difficulty` -- enum beginner/intermediate/advanced
  - [x] `FormatterConfig` -- per-language formatter settings, trigger mode
- [x] Define repository interfaces in `libs/data-access/src/interfaces/`:
  - [x] `PackRepository` -- listPacks, getChallenges, getChallenge
  - [x] `AttemptRepository` -- createAttempt, listAttempts
  - [x] `SettingsRepository` -- getSettings, updateSettings
- [x] Set up barrel exports for `libs/shared` and `libs/data-access`
- [x] Add Storybook or a `/dev` route for visual component testing (optional, lightweight)

### Validation Gate

A test page at `/dev` renders all base components in both dark and light themes. All shared types compile without errors. Repository interfaces are importable from `@nthtime/data-access`. The design system has a distinct, non-generic visual identity.

**Completed:** 2026-02-20

---

## Phase 2 -- Verification Engine

**Goal:** The complete client-side verification pipeline -- the core differentiator and highest-risk module.

**Risk:** This is the most technically complex phase. Tree-sitter WASM integration, grammar loading, S-expression queries, and the assertion DSL all carry integration risk. Start early, test exhaustively.

### Checklist

- [x] Set up Tree-sitter WASM integration in `libs/verification/`:
  - [x] Install `web-tree-sitter`
  - [x] Configure WASM loader for Next.js (webpack/turbopack config)
  - [x] Implement lazy grammar loading from `public/tree-sitter/` directory
  - [x] Download and bundle Tree-sitter WASM grammars:
    - [x] JavaScript
    - [x] TypeScript / TSX
    - [x] Python
    - [x] HTML
    - [x] CSS
    - [x] JSON
- [x] Implement Prettier integration (prettier/standalone):
  - [x] Set up Prettier standalone build
  - [x] Implement per-language formatter resolution (file extension mapping)
  - [x] Implement formatter config application (tabs/spaces, quotes, semicolons, print width)
  - [x] Handle unsupported file types (pass-through)
- [x] Implement JSON DSL assertion types:
  - [x] `functionDeclaration` -- name, paramCount, async, exported
  - [x] `variableDeclaration` -- name, kind (const/let/var), exported
  - [x] `importDeclaration` -- source, specifiers
  - [x] `exportDeclaration` -- name, default/named
  - [x] `methodCall` -- object, method, argCount
  - [x] `returnStatement` -- presence within scope
  - [x] `classDeclaration` -- name, extends, methods
  - [x] `jsxElement` -- component name, props, children
  - [x] `pythonFunctionDef` -- name, decorators, paramCount, async
  - [x] `pythonClassDef` -- name, bases, methods
  - [x] `pythonImport` -- module, names
- [x] Implement S-expression query assertion type:
  - [x] Query parser and executor against Tree-sitter ASTs
  - [x] Support capture groups for assertion matching
  - [x] Support ordering assertions (A before B)
  - [x] Support negation assertions (must NOT contain)
  - [x] Support regex matching on captured node text
  - [x] Support nesting depth constraints
- [x] Implement cross-file assertions:
  - [x] File/directory existence checks
  - [x] Import/export relationship verification (file A imports from file B)
  - [x] File structure consistency checks
- [x] Implement verification pipeline orchestrator:
  - [x] Format step (optional, configurable)
  - [x] Parse step (Tree-sitter, per file)
  - [x] Per-file assertion evaluation
  - [x] Cross-file assertion evaluation
  - [x] Result aggregation (per-assertion, per-file, overall)
- [x] Write comprehensive Vitest test suite:
  - [x] Unit tests for each JSON DSL assertion type (positive and negative cases)
  - [x] Unit tests for S-expression query assertions
  - [x] Unit tests for cross-file assertions
  - [x] Integration tests for full pipeline (format -> parse -> assert -> aggregate)
  - [x] Edge cases: empty files, parse errors, mixed pass/fail, multiple files
  - [x] Tests across all six supported languages
- [x] Benchmark verification pipeline (target: < 100ms for typical challenge)

### Validation Gate

A test harness can take a multi-file challenge definition (files + assertions), run the full verification pipeline in Node.js (via WASM), and produce correct pass/fail results. All JSON DSL assertion types have passing tests. S-expression queries work for ordering, negation, and regex matching. Cross-file assertions correctly verify import/export relationships. Pipeline completes in under 100ms for a 5-file challenge.

**Completed:** 2026-02-20 (core engine); 2026-02-21 (JSON grammar, Prettier, benchmarks added in backfill)

---

## Phase 3 -- Auth + Schema + Data Access Layer

**Goal:** Authentication, database schema, server functions, and the repository pattern wiring.

### Checklist

- [x] Configure Convex Auth with GitHub OAuth:
  - [x] Set up GitHub OAuth app (client ID, secret)
  - [x] Configure Convex Auth provider
  - [x] Implement sign-in / sign-out UI components
  - [x] Add auth state to app shell (signed-in user display, sign-out button)
- [x] Define Convex schema (`convex/schema.ts`):
  - [x] `packs` table -- name, slug, description, language, framework, version, author, tags
  - [x] `challenges` table -- packId, title, prompt, difficulty, tags, timeEstimateSeconds, scaffolded, files, hints, assertions, order
  - [x] `attempts` table -- userId, challengeId, passed, assertionResults, hintsUsed, timeSeconds, createdAt
  - [x] `userSettings` table -- userId, feedbackLevel, keybindings, theme, autocomplete, formatterConfig, timeTrackingEnabled
  - [x] Search indexes on challenges (title, prompt, tags)
  - [x] Indexes on attempts (userId, challengeId)
- [x] Implement Convex server functions:
  - [x] `packs.list` -- list packs with metadata and user completion progress
  - [x] `packs.getChallenges` -- challenge stubs for a pack (no full content)
  - [x] `challenges.get` -- full challenge data (files, assertions, hints)
  - [x] `attempts.create` -- persist attempt result (validated mutation)
  - [x] `attempts.list` -- attempt history for user/challenge
  - [x] `settings.get` -- user settings (with defaults)
  - [x] `settings.update` -- update user settings
  - [x] `admin.syncPacks` -- validate and upsert pack data (admin-restricted action)
- [x] Add rate limiting on mutations (`attempts.create`, `settings.update`)
- [x] ~~Implement Convex repository in `libs/data-access/src/convex/`~~ (Obsolete -- replaced by Spring Data JPA repositories in services/api)
- [x] ~~Create React context provider (`DataAccessProvider`)~~ (Obsolete -- replaced by Spring Data JPA repositories in services/api)
- [x] Wire provider into `apps/web` root layout
- [x] Write Vitest tests for Convex server functions (using Convex test utilities)
- [ ] Verify auth flow end-to-end: sign in with GitHub, session persists, sign out works (deferred)

### Validation Gate

A signed-in user can hit every Spring Boot endpoint through the repository interfaces. Auth flow works end-to-end with GitHub OAuth. Schema validates and PostgreSQL tables are correctly created via Flyway migrations. Rate limiting triggers on rapid repeated mutations.

**Completed:** 2026-02-20 (schema, auth, server functions); 2026-02-21 (admin.syncPacks, rate limiting, server function tests added in backfill). Repository classes deferred -- replaced by Spring Data JPA repositories in services/api (Spring Boot migration, 2026-02-28). Auth E2E deferred (needs OAuth test credentials).

---

## Phase 4 -- Editor

**Goal:** Full-featured code editor workspace with file management, split panes, and real-time feedback.

### Checklist

- [x] Set up Monaco editor in `libs/editor/`:
  - [x] Install and configure `@monaco-editor/react`
  - [x] Configure Monaco workers (webpack/turbopack)
  - [x] Implement dark/light theme integration with design system
- [x] Implement file tree sidebar:
  - [x] Tree view component with expand/collapse
  - [x] File/folder icons by type
  - [x] Inline create file button
  - [x] Inline create folder button
  - [x] Rename (inline edit)
  - [x] Delete (with confirmation)
  - [x] Active file highlight
- [x] Implement tabbed editor:
  - [x] Tab bar with file names
  - [x] Close tab (with unsaved indicator)
  - [x] Tab reordering (drag)
  - [x] Tab overflow handling
- [x] Implement split pane support:
  - [x] Horizontal split (side-by-side files)
  - [x] Resize handle
  - [x] Close pane
- [x] Implement keybinding modes:
  - [x] Normal mode (default Monaco)
  - [x] Vim mode (`monaco-vim`)
  - [x] Emacs mode (`monaco-emacs`)
  - [x] Mode switcher in editor toolbar or settings
- [x] Implement autocomplete toggle (off by default, Monaco IntelliSense)
- [x] Implement Zustand editor store (`libs/editor/`):
  - [x] Open files state
  - [x] Active file / active pane
  - [x] File contents (in-memory workspace)
  - [x] Dirty file tracking
  - [x] File tree structure
- [x] Integrate Tree-sitter for real-time parse feedback:
  - [x] Parse on keystroke (debounced)
  - [x] Display parse errors as Monaco diagnostics (red squiggles)
  - [x] Clear errors when parse succeeds
- [x] Implement keyboard shortcuts:
  - [x] Cmd/Ctrl+Enter -- submit (wired in Phase 7)
  - [x] Cmd/Ctrl+S -- save/format
  - [x] Shortcuts for tab navigation
- [x] Implement resizable horizontal split: prompt panel (left) + editor workspace (right)
- [x] Write component tests for file tree interactions and tab management

### Validation Gate

The editor renders with a file tree, supports creating/renaming/deleting files and folders, opens files in tabs, supports split panes, switches between keybinding modes, and shows real-time parse errors from Tree-sitter. Zustand store correctly tracks all editor state.

**Completed:** 2026-02-20 (core editor, tabs, store); 2026-02-21 (file tree CRUD, split panes, vim/emacs, autocomplete, dirty tracking, parse diagnostics added in backfill); file/folder icons by type, tab reordering/overflow, tab-navigation shortcuts, and file-tree/tab component tests landed in later polish (all present in `apps/web/src/components/challenge/`).

---

## Phase 5 -- Catalog (Browse)

**Goal:** Pack grid and challenge list views with search and filtering.

**Depends on:** Phase 3 (data access layer for querying packs/challenges)

### Checklist

- [x] Implement pack grid view (`/` or `/catalog`):
  - [x] Card grid layout (responsive desktop grid)
  - [x] Pack card: name, framework, language, challenge count, completion progress bar
  - [x] Click card to navigate to challenge list
- [x] Implement challenge list view (`/pack/[slug]`):
  - [x] Ordered list of challenges
  - [x] Per-challenge: title, status badge (not attempted / failed / passed), difficulty badge, time estimate
  - [x] Click challenge to navigate to editor
  - [x] "Recommended order" indicator
- [x] Implement search:
  - [x] Search input above pack grid
  - [x] Convex search index query on titles, prompts, tags
  - [x] Debounced search with loading state
- [x] Implement filters:
  - [x] Language/framework filter
  - [x] Difficulty filter (beginner/intermediate/advanced)
  - [x] Tag filter
  - [x] Completion status filter (not attempted / failed / passed)
  - [x] Filter state in URL query params (shareable/bookmarkable)
- [x] Implement empty states:
  - [x] No packs found
  - [x] No challenges match filters
- [x] Wire pack grid and challenge list to `PackRepository`
- [x] Wire completion status to `AttemptRepository`
- [x] Add loading skeletons for pack grid and challenge list

### Validation Gate

Browsing the catalog shows pack cards with real data from the API. Clicking a pack shows its challenge list with status badges. Search returns relevant results. Filters narrow the catalog correctly. Empty states display when appropriate.

**Completed:** 2026-02-20 (core catalog); 2026-02-22 (tag filter, completion status filter added)

---

## Phase 6 -- Drafts + Settings + Time Tracking

**Goal:** localStorage draft persistence, user settings UI with server sync, and opt-in timer.

**Depends on:** Phase 3 (settings repository), Phase 4 (editor store)

### Checklist

- [x] Implement draft auto-save:
  - [x] localStorage persistence (direct, per-challenge keying)
  - [x] Save all open file contents on keystroke (debounced, ~500ms)
  - [x] Key drafts by challenge ID
  - [x] Restore drafts when returning to a challenge
  - [x] Clear drafts on submission
  - [x] Handle multi-file workspace (save entire file tree state)
- [x] Implement settings UI:
  - [x] Settings modal dialog
  - [x] Feedback level selector (L0-L4 with descriptions)
  - [x] Editor keybindings selector (Normal/Vim/Emacs)
  - [ ] Theme selector (Dark/Light/System) (handled via existing ThemeToggle)
  - [x] Autocomplete toggle
  - [x] Formatter configuration:
    - [x] Tab size / use tabs settings
    - [x] Trigger mode (format on save / on paste / manual)
  - [ ] Time tracking toggle (deferred)
- [x] Wire settings to `SettingsRepository`:
  - [x] Load settings on app init (localStorage)
  - [x] Persist changes to the server on update (debounced sync hook ready)
  - [x] Optimistic UI updates
- [x] Implement time tracking:
  - [x] Timer starts on first keystroke in a challenge
  - [x] Runs continuously (no pause on blur/idle)
  - [x] Timer display in editor toolbar (when enabled)
  - [x] Time recorded on attempt submission
  - [x] Timer resets on new challenge
- [x] Write tests for draft persistence (save, restore, clear lifecycle)
- [ ] Write tests for settings sync (optimistic update, server round-trip) (deferred)

### Validation Gate

Drafts persist across page reloads and restore correctly for multi-file challenges. Drafts clear after submission. Settings changes reflect immediately in the UI and persist to the server. Timer runs continuously from first keystroke and records time on submission.

**Completed:** 2026-02-20 (autocomplete toggle, time tracking toggle, settings sync tests deferred)

---

## Phase 7 -- Challenge Flow

**Goal:** The complete drill loop -- the core user experience that ties all prior phases together.

**Depends on:** Phases 2, 3, 4, 5, 6 (all prior feature phases)

### Checklist

- [x] Implement challenge page (`/challenge/[id]`):
  - [x] Load full challenge data via `PackRepository`
  - [x] Initialize editor workspace:
    - [x] Scaffolded mode: pre-populate file tree from challenge definition
    - [x] Blank canvas mode: empty file tree, user creates files
  - [x] Display prompt in left panel
  - [x] Restore draft if exists
- [x] Implement submit flow:
  - [x] Cmd/Ctrl+Enter triggers submission
  - [x] Collect all files from editor store
  - [x] Run verification pipeline (Phase 2):
    - [x] Format (if configured)
    - [x] Parse (Tree-sitter)
    - [x] Per-file assertions
    - [x] Cross-file assertions
    - [x] Aggregate results
  - [x] Persist attempt via data-access hooks (async, fire-and-forget; no-op in mock mode)
  - [x] Clear draft
  - [x] Transition to results view
- [x] Implement results view (replaces editor workspace on submit):
  - [x] Overall pass/fail banner
  - [x] File tree with per-file pass/fail badges
  - [x] Submitted code (read-only) in editor pane
  - [x] Respect feedback level setting:
    - [x] L0: pass/fail only, no assertion details
    - [x] L1: per-assertion pass/fail with descriptive messages
    - [x] L2: L1 + hint access
    - [x] L3: L2 + failure locations shown in assertion detail sidebar
    - [x] L4: L3 + diff view
  - [x] Parse errors displayed prominently (always, regardless of feedback level)
- [x] Implement hints:
  - [x] "Show next hint" button (available during challenge and on results screen)
  - [x] Progressive reveal (one at a time)
  - [x] Track hints used count for attempt record
  - [x] Available at L2+ feedback level (and always during active editing)
- [x] Implement diff view (L4):
  - [x] Side-by-side diff mode
  - [x] Unified diff mode
  - [x] User-selectable toggle
  - [x] Per-file diff (file tree navigation in results view)
- [x] Implement inline annotations (L3):
  - [x] Failure locations shown in assertion detail sidebar (inline Monaco glyph decorations deferred)
  - [x] Render as Monaco decorations (read-only mode, glyph margin + hover messages)
  - [x] Annotation messages describe what is missing
- [x] Implement navigation:
  - [x] "Next challenge in pack" button (advances in recommended order)
  - [x] "Back to catalog" link
  - [x] "Retry" button (returns to editor with submitted code)
  - [x] No auto-advance
- [x] Implement attempt history:
  - [x] View past attempts for a challenge
  - [x] Per-attempt: pass/fail, time, hints used, timestamp
- [x] Write integration tests for submit -> verify -> results flow
- [x] Write tests for each feedback level rendering correctly

### Validation Gate

A user can: browse the catalog, select a challenge, write code (single or multi-file), submit, see results at every feedback level (L0-L4), use hints, view diffs, navigate to the next challenge, and see their attempt history. Drafts restore on return. Timer records correctly. The full drill loop works end-to-end.

**Completed:** 2026-02-20 (core challenge flow); 2026-02-21 (blank canvas, format on submit, Monaco glyph decorations, feedback level tests added in backfill); 2026-02-22 (attempt persistence wired via data-access hooks)

---

## Phase 8 -- Launch Packs

**Goal:** Three complete challenge packs with validation tooling and seed infrastructure.

**Depends on:** Phase 7 (challenge flow must work to validate packs)

### Checklist

- [x] Build pack validation tooling (`tools/`):
  - [x] JSON schema for `pack.json` and challenge files (structural checks used instead of JSON Schema)
  - [x] CLI validator: schema check + reference solution verification
  - [x] Run every reference solution through the full verification pipeline
  - [x] Descriptive error output for invalid packs
  - [x] Integrate into CI (packs validated on every push) (completed in Phase 9)
- [x] Build seed script (`tools/seed.ts`):
  - [x] Read pack JSON files from `packs/` directory
  - [x] Validate all packs before import
  - [x] Upsert via Spring Boot `/api/admin/seed` endpoint
  - [x] Idempotent (safe to re-run)
  - [x] CLI interface (`pnpm run seed`)
- [x] Author Express.js pack (`packs/express-basics/`):
  - [x] ~10 challenges covering:
    - [x] Basic route handlers (GET, POST)
    - [x] Route parameters and query strings
    - [x] Middleware (custom, error-handling)
    - [x] Router composition
    - [x] JSON response patterns
    - [x] Multi-file Express application structure
  - [x] Progressive difficulty (beginner -> intermediate -> advanced)
  - [x] Hints for each challenge
  - [x] Reference solutions passing all assertions
- [x] Author React pack (`packs/react-fundamentals/`):
  - [x] ~10 challenges covering:
    - [x] Functional components with props
    - [x] useState and useEffect hooks
    - [x] Custom hooks
    - [x] Component composition patterns
    - [x] Conditional rendering
    - [x] Event handling
    - [x] Multi-component applications
  - [x] Progressive difficulty
  - [x] Hints and reference solutions
- [x] Author Python/FastAPI pack (`packs/fastapi-basics/`):
  - [x] ~10 challenges covering:
    - [x] Basic route handlers
    - [x] Path and query parameters
    - [x] Pydantic models for request/response
    - [x] Dependency injection
    - [x] Error handling
    - [x] Multi-file FastAPI application structure
  - [x] Progressive difficulty
  - [x] Hints and reference solutions
- [x] Validate all three packs through the validation tooling
- [ ] Seed all packs into database (deferred -- needs running Spring Boot instance)
- [ ] Manual QA: complete at least one challenge from each pack end-to-end (deferred)

### Validation Gate

All three packs pass schema validation and reference solution verification. Seed script successfully imports all packs into the database. Every challenge can be completed end-to-end in the application -- write the reference solution, submit, see pass result. ~30 total challenges across three packs.

**Completed:** 2026-02-20 -- JSON schema validation deferred (structural checks + reference solution verification used instead); CI pack validation and database seeding deferred to Phase 9; manual QA deferred. 30 challenges across 3 packs (Express, React, FastAPI), all verified.

---

## Phase 9 -- Polish + E2E + Deploy

**Goal:** Production readiness -- testing, infrastructure, monitoring, and deployment.

### Checklist

- [x] Write Playwright E2E tests (5 test files):
  - [ ] Sign in with GitHub OAuth (deferred -- needs OAuth test credentials)
  - [x] Browse catalog, search, filter
  - [x] Open a challenge, write code, submit
  - [ ] Verify results display at each feedback level (deferred)
  - [ ] Multi-file challenge: create files, write code, submit (deferred)
  - [ ] View diff (L4) (deferred)
  - [x] Navigate to next challenge
  - [x] Settings: change feedback level, verify it applies
  - [x] Draft persistence: write code, leave, return, verify restore
  - [ ] Timer: enable, write code, submit, verify time recorded (deferred)
- [x] Set up Docker Compose for production:
  - [x] Next.js Dockerfile (multi-stage build)
  - [x] `docker-compose.yml` with Next.js service
  - [x] Environment variable configuration (.env.production)
  - [x] Health check endpoint (`/api/health`)
- [~] Set up Cloudflare (dashboard steps documented in `docs/operations/cloudflare-cdn.md`):
  - [ ] DNS configuration (external -- see runbook)
  - [ ] SSL termination (external -- Full (strict) over Coolify's Let's Encrypt cert)
  - [ ] CDN caching rules (static assets, WASM grammars) (external -- see runbook)
  - [x] Cache headers for challenge data (origin: `next.config.js` WASM headers + `CacheControlInterceptor`)
- [x] Complete GitHub Actions CI/CD pipeline:
  - [x] Validate packs (`pnpm validate` step)
  - [x] Run Vitest (unit/integration)
  - [x] Run Playwright (E2E)
  - [x] Spring Boot build and test in CI
  - [x] Build and verify Docker Compose stack (build only, no push -- registry not configured)
  - [ ] Deploy to VPS (deferred -- needs VPS)
  - [x] Seed test data via `pnpm seed` after Spring Boot starts
  - [x] All tests must pass before deploy (blocking gate)
- [x] Set up Sentry error tracking:
  - [x] Next.js Sentry SDK integration (`instrumentation*.ts`, `sentry.*.config.ts`)
  - [x] Source maps upload (`withSentryConfig` in `next.config.js`)
  - [x] Error boundary components (`app/error.tsx`, `app/global-error.tsx`)
  - [x] Spring Boot Sentry (`sentry-spring-boot-starter-jakarta`, DSN-gated in `application.yml`)
- [x] Set up structured logging:
  - [x] Request logging middleware (Next.js `middleware.ts` emits per-request JSON)
  - [ ] Verification pipeline logging (client-side, for debugging) (deferred)
  - [x] Log to stdout (Docker captures) -- Spring Boot logstash JSON format in `application.yml`
- [~] Performance audit (recorded baseline in `docs/operations/perf-baseline.md`):
  - [x] Verify WASM grammar lazy loading works correctly (per-language dynamic loader)
  - [x] Verify verification pipeline performance (< 100ms target) -- 360/360, avg 1.4ms, 0 over target
  - [ ] Lighthouse audit for initial page load (procedure documented; needs running stack)
  - [x] Bundle size analysis (Monaco ~2.4MB, Prettier ~1.6MB, Tree-sitter WASM ~6MB; all code-split)
- [ ] Production QA (deferred -- needs production environment):
  - [ ] Complete every challenge in all three packs
  - [ ] Test every feedback level
  - [ ] Test auth flow (sign in, session persistence, sign out)
  - [ ] Test on Chrome, Firefox, Safari (desktop)
  - [ ] Verify Bucket4j rate limiting under load
- [ ] Final cleanup (deferred):
  - [ ] Remove development-only code/routes
  - [ ] Verify environment variable documentation
  - [ ] Verify Apache-2.0 license headers where required

### Validation Gate

CI/CD pipeline deploys to production automatically on merge to main. All Playwright E2E tests pass. Sentry captures errors. Application loads, authenticates, and serves challenges from the production VPS + Spring Boot + PostgreSQL stack. All three launch packs are seeded and playable. Lighthouse performance score is acceptable for a desktop-only application.

**Partial completion:** 2026-02-20 -- E2E tests (catalog, challenge flow, drafts, settings, navigation), Dockerfile + docker-compose.yml, health endpoint, CI pipeline (pack validation, E2E, Docker build). Since completed: Sentry (client/server/edge + source maps + error boundaries), structured logging (Next.js request JSON + Spring Boot logstash), origin cache headers (WASM + catalog API), and a recorded performance baseline (`docs/operations/perf-baseline.md`). Also since completed: Spring-side error tracking (DSN-gated Sentry) and a DB-probing `/api/health` (503 when the database is unreachable). Still deferred (external services / production environment): Cloudflare dashboard setup (documented in `docs/operations/cloudflare-cdn.md`), Lighthouse capture (needs the served stack; Chrome available locally), production QA.

---

## Timeline Summary

| Phase | Name                            | Parallel Group | Est. Effort |
|-------|---------------------------------|----------------|-------------|
| 0     | Monorepo Foundation + CI        | --             | Small       |
| 1     | Design System + Shared Types    | --             | Small-Med   |
| 2     | Verification Engine             | A (parallel)   | Large       |
| 3     | Auth + Schema + Data Access     | A (parallel)   | Medium      |
| 4     | Editor                          | A (parallel)   | Medium-Large|
| 5     | Catalog (Browse)                | B (parallel)   | Small-Med   |
| 6     | Drafts + Settings + Time        | B (parallel)   | Small-Med   |
| 7     | Challenge Flow (Integration)    | --             | Large       |
| 8     | Launch Packs (Content)          | --             | Medium      |
| 9     | Polish + E2E + Deploy           | --             | Medium      |

**Critical path:** 0 -> 1 -> 2 -> 7 -> 8 -> 9

The verification engine (Phase 2) is on the critical path and carries the most technical risk. It should receive focus as soon as Phase 1 completes.

---

## Risk Notes

1. **Tree-sitter WASM in Next.js** -- WASM loading in Next.js (especially with App Router and turbopack) can be finicky. Spike this integration early in Phase 2. Fallback: serve WASM from `public/` with manual fetch + instantiate.

2. **Monaco bundle size** -- Monaco is large. Use dynamic imports and code splitting aggressively. Consider `@monaco-editor/react` lazy loading. Measure impact during Phase 9 performance audit.

3. **Prettier WASM** -- The standalone Prettier WASM build may have compatibility issues with some parsers. Test all six target languages early. Fallback: format via worker thread with standard Prettier.

4. **S-expression query complexity** -- Complex Tree-sitter queries (ordering, negation, nesting depth) are powerful but hard to debug. Build a query playground/test harness during Phase 2 to support pack authoring in Phase 8.

5. **Spring Security OAuth2** -- Spring Security OAuth2 Client + Spring Session JDBC handles the full auth lifecycle (sign in, session refresh, sign out, expired session). Migration from Convex Auth completed 2026-02-28.

6. **Challenge authoring bottleneck** -- Phase 8 requires writing ~30 challenges with correct assertions. The verification engine (Phase 2) and its test harness must be solid and well-documented before starting content authoring, or pack creation will be slow and error-prone.

7. **Cross-file assertions** -- Verifying relationships across files (imports reference correct exports, file structure matches) is conceptually simple but has many edge cases (re-exports, barrel files, relative vs. absolute paths). Scope carefully in Phase 2.

8. **Oracle Cloud VPS** -- Single-server deployment has no redundancy. Acceptable for MVP, but monitor uptime. Docker Compose makes migration to another provider straightforward.
