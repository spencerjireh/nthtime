# nthtime -- Implementation Roadmap

**Derived from:** nthtime PRD v4 (MVP)
**Created:** 2026-02-19
**License:** AGPL-3.0

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

- [ ] Initialize git repository with `.gitignore` (node_modules, .env, dist, .next, .convex)
- [ ] Initialize pnpm workspace (`pnpm-workspace.yaml`)
- [ ] Initialize Nx workspace with pnpm preset
- [ ] Scaffold Next.js app at `apps/web/` (App Router, TypeScript, Tailwind CSS)
- [ ] Initialize Convex project at `convex/` (`npx convex init`)
- [ ] Create empty Nx library scaffolds:
  - [ ] `libs/shared/` -- shared types and constants
  - [ ] `libs/data-access/` -- repository interfaces + implementations
  - [ ] `libs/verification/` -- assertion engine
  - [ ] `libs/editor/` -- Monaco wrapper
- [ ] Create `packs/` directory with a placeholder README
- [ ] Create `tools/` directory for CLI scripts
- [ ] Configure TypeScript project references across workspace
- [ ] Configure path aliases in `tsconfig.base.json` (`@nthtime/shared`, `@nthtime/data-access`, `@nthtime/verification`, `@nthtime/editor`)
- [ ] Set up Vitest configuration (workspace-level + per-library)
- [ ] Set up Playwright configuration (in `apps/web/`)
- [ ] Create GitHub Actions CI workflow:
  - [ ] Install dependencies (pnpm)
  - [ ] Lint (ESLint)
  - [ ] Type check (tsc --noEmit)
  - [ ] Unit tests (Vitest)
  - [ ] Build (Next.js)
  - [ ] Placeholder steps for Convex deploy and Docker build (disabled until later phases)
- [ ] Add ESLint configuration (flat config, TypeScript rules)
- [ ] Add Prettier configuration (project-level)
- [ ] Add `AGPL-3.0` LICENSE file
- [ ] Verify `nx affected` correctly detects changes across libraries

### Validation Gate

CI pipeline runs green on an empty workspace: lint passes, type check passes, Vitest finds zero tests and exits cleanly, Next.js builds successfully, all Nx libraries resolve their imports.

---

## Phase 1 -- Design System + Shared Types

**Goal:** Visual foundation and shared type contracts used by all feature phases.

### Checklist

- [ ] Configure Tailwind CSS with custom theme tokens:
  - [ ] Color palette (dark-first, custom non-generic aesthetic)
  - [ ] Typography scale
  - [ ] Spacing and radius tokens
  - [ ] Breakpoints (desktop only -- no mobile)
- [ ] Install and configure shadcn/ui with custom theme
- [ ] Build base component overrides/variants:
  - [ ] Button (primary, secondary, ghost, destructive)
  - [ ] Card (pack card, challenge card)
  - [ ] Badge (difficulty: beginner/intermediate/advanced, status: pass/fail)
  - [ ] Dialog / Sheet
  - [ ] Tabs
  - [ ] Tooltip
  - [ ] Input / Select / Checkbox / Toggle
- [ ] Create app shell layout component (header, main content area, no sidebar at app level)
- [ ] Implement dark/light theme toggle (dark default, system-preference-aware)
- [ ] Define shared TypeScript types in `libs/shared/`:
  - [ ] `Pack` -- name, slug, description, language, framework, version, author, tags, challenges
  - [ ] `Challenge` -- id, title, prompt, difficulty, tags, timeEstimateSeconds, scaffolded, files, hints, assertions
  - [ ] `ChallengeFile` -- path, content
  - [ ] `Assertion` -- JSON DSL types + S-expression query types
  - [ ] `AssertionResult` -- pass/fail, message, file path, location
  - [ ] `VerificationResult` -- overall pass/fail, per-file results, cross-file results
  - [ ] `Attempt` -- userId, challengeId, passed, assertionResults, hintsUsed, timeSeconds, timestamp
  - [ ] `UserSettings` -- feedbackLevel (0-4), editorKeybindings, theme, autocomplete, formatterConfig, timeTrackingEnabled
  - [ ] `FeedbackLevel` -- enum L0-L4
  - [ ] `Difficulty` -- enum beginner/intermediate/advanced
  - [ ] `FormatterConfig` -- per-language formatter settings, trigger mode
- [ ] Define repository interfaces in `libs/data-access/src/interfaces/`:
  - [ ] `PackRepository` -- listPacks, getChallenges, getChallenge
  - [ ] `AttemptRepository` -- createAttempt, listAttempts
  - [ ] `SettingsRepository` -- getSettings, updateSettings
- [ ] Set up barrel exports for `libs/shared` and `libs/data-access`
- [ ] Add Storybook or a `/dev` route for visual component testing (optional, lightweight)

### Validation Gate

A test page at `/dev` renders all base components in both dark and light themes. All shared types compile without errors. Repository interfaces are importable from `@nthtime/data-access`. The design system has a distinct, non-generic visual identity.

---

## Phase 2 -- Verification Engine

**Goal:** The complete client-side verification pipeline -- the core differentiator and highest-risk module.

**Risk:** This is the most technically complex phase. Tree-sitter WASM integration, grammar loading, S-expression queries, and the assertion DSL all carry integration risk. Start early, test exhaustively.

### Checklist

- [ ] Set up Tree-sitter WASM integration in `libs/verification/`:
  - [ ] Install `web-tree-sitter`
  - [ ] Configure WASM loader for Next.js (webpack/turbopack config)
  - [ ] Implement lazy grammar loading from `public/tree-sitter/` directory
  - [ ] Download and bundle Tree-sitter WASM grammars:
    - [ ] JavaScript
    - [ ] TypeScript / TSX
    - [ ] Python
    - [ ] HTML
    - [ ] CSS
    - [ ] JSON
- [ ] Implement Prettier WASM integration:
  - [ ] Set up Prettier standalone WASM build
  - [ ] Implement per-language formatter resolution (file extension mapping)
  - [ ] Implement formatter config application (tabs/spaces, quotes, semicolons, print width)
  - [ ] Handle unsupported file types (pass-through)
- [ ] Implement JSON DSL assertion types:
  - [ ] `functionDeclaration` -- name, paramCount, async, exported
  - [ ] `variableDeclaration` -- name, kind (const/let/var), exported
  - [ ] `importDeclaration` -- source, specifiers
  - [ ] `exportDeclaration` -- name, default/named
  - [ ] `methodCall` -- object, method, argCount
  - [ ] `returnStatement` -- presence within scope
  - [ ] `classDeclaration` -- name, extends, methods
  - [ ] `jsxElement` -- component name, props, children
  - [ ] `pythonFunctionDef` -- name, decorators, paramCount, async
  - [ ] `pythonClassDef` -- name, bases, methods
  - [ ] `pythonImport` -- module, names
- [ ] Implement S-expression query assertion type:
  - [ ] Query parser and executor against Tree-sitter ASTs
  - [ ] Support capture groups for assertion matching
  - [ ] Support ordering assertions (A before B)
  - [ ] Support negation assertions (must NOT contain)
  - [ ] Support regex matching on captured node text
  - [ ] Support nesting depth constraints
- [ ] Implement cross-file assertions:
  - [ ] File/directory existence checks
  - [ ] Import/export relationship verification (file A imports from file B)
  - [ ] File structure consistency checks
- [ ] Implement verification pipeline orchestrator:
  - [ ] Format step (optional, configurable)
  - [ ] Parse step (Tree-sitter, per file)
  - [ ] Per-file assertion evaluation
  - [ ] Cross-file assertion evaluation
  - [ ] Result aggregation (per-assertion, per-file, overall)
- [ ] Write comprehensive Vitest test suite:
  - [ ] Unit tests for each JSON DSL assertion type (positive and negative cases)
  - [ ] Unit tests for S-expression query assertions
  - [ ] Unit tests for cross-file assertions
  - [ ] Integration tests for full pipeline (format -> parse -> assert -> aggregate)
  - [ ] Edge cases: empty files, parse errors, mixed pass/fail, multiple files
  - [ ] Tests across all six supported languages
- [ ] Benchmark verification pipeline (target: < 100ms for typical challenge)

### Validation Gate

A test harness can take a multi-file challenge definition (files + assertions), run the full verification pipeline in Node.js (via WASM), and produce correct pass/fail results. All JSON DSL assertion types have passing tests. S-expression queries work for ordering, negation, and regex matching. Cross-file assertions correctly verify import/export relationships. Pipeline completes in under 100ms for a 5-file challenge.

---

## Phase 3 -- Auth + Convex Schema + Data Access Layer

**Goal:** Authentication, database schema, server functions, and the repository pattern wiring.

### Checklist

- [ ] Configure Convex Auth with GitHub OAuth:
  - [ ] Set up GitHub OAuth app (client ID, secret)
  - [ ] Configure Convex Auth provider
  - [ ] Implement sign-in / sign-out UI components
  - [ ] Add auth state to app shell (signed-in user display, sign-out button)
- [ ] Define Convex schema (`convex/schema.ts`):
  - [ ] `packs` table -- name, slug, description, language, framework, version, author, tags
  - [ ] `challenges` table -- packId, title, prompt, difficulty, tags, timeEstimateSeconds, scaffolded, files, hints, assertions, order
  - [ ] `attempts` table -- userId, challengeId, passed, assertionResults, hintsUsed, timeSeconds, createdAt
  - [ ] `userSettings` table -- userId, feedbackLevel, keybindings, theme, autocomplete, formatterConfig, timeTrackingEnabled
  - [ ] Search indexes on challenges (title, prompt, tags)
  - [ ] Indexes on attempts (userId, challengeId)
- [ ] Implement Convex server functions:
  - [ ] `packs.list` -- list packs with metadata and user completion progress
  - [ ] `packs.getChallenges` -- challenge stubs for a pack (no full content)
  - [ ] `challenges.get` -- full challenge data (files, assertions, hints)
  - [ ] `attempts.create` -- persist attempt result (validated mutation)
  - [ ] `attempts.list` -- attempt history for user/challenge
  - [ ] `settings.get` -- user settings (with defaults)
  - [ ] `settings.update` -- update user settings
  - [ ] `admin.syncPacks` -- validate and upsert pack data (admin-restricted action)
- [ ] Add rate limiting on mutations (`attempts.create`, `settings.update`)
- [ ] Implement Convex repository in `libs/data-access/src/convex/`:
  - [ ] `ConvexPackRepository` implementing `PackRepository`
  - [ ] `ConvexAttemptRepository` implementing `AttemptRepository`
  - [ ] `ConvexSettingsRepository` implementing `SettingsRepository`
- [ ] Create React context provider (`DataAccessProvider`) that wires Convex implementations
- [ ] Wire provider into `apps/web` root layout
- [ ] Write Vitest tests for Convex server functions (using Convex test utilities)
- [ ] Verify auth flow end-to-end: sign in with GitHub, session persists, sign out works

### Validation Gate

A signed-in user can hit every Convex query and mutation through the repository interfaces. Auth flow works end-to-end with GitHub OAuth. Schema validates and Convex dashboard shows all tables. Rate limiting triggers on rapid repeated mutations.

---

## Phase 4 -- Editor

**Goal:** Full-featured code editor workspace with file management, split panes, and real-time feedback.

### Checklist

- [ ] Set up Monaco editor in `libs/editor/`:
  - [ ] Install and configure `@monaco-editor/react`
  - [ ] Configure Monaco workers (webpack/turbopack)
  - [ ] Implement dark/light theme integration with design system
- [ ] Implement file tree sidebar:
  - [ ] Tree view component with expand/collapse
  - [ ] File/folder icons by type
  - [ ] Inline create file button
  - [ ] Inline create folder button
  - [ ] Rename (inline edit)
  - [ ] Delete (with confirmation)
  - [ ] Active file highlight
- [ ] Implement tabbed editor:
  - [ ] Tab bar with file names
  - [ ] Close tab (with unsaved indicator)
  - [ ] Tab reordering (drag)
  - [ ] Tab overflow handling
- [ ] Implement split pane support:
  - [ ] Horizontal split (side-by-side files)
  - [ ] Resize handle
  - [ ] Close pane
- [ ] Implement keybinding modes:
  - [ ] Normal mode (default Monaco)
  - [ ] Vim mode (`monaco-vim`)
  - [ ] Emacs mode (`monaco-emacs`)
  - [ ] Mode switcher in editor toolbar or settings
- [ ] Implement autocomplete toggle (off by default, Monaco IntelliSense)
- [ ] Implement Zustand editor store (`libs/editor/`):
  - [ ] Open files state
  - [ ] Active file / active pane
  - [ ] File contents (in-memory workspace)
  - [ ] Dirty file tracking
  - [ ] File tree structure
- [ ] Integrate Tree-sitter for real-time parse feedback:
  - [ ] Parse on keystroke (debounced)
  - [ ] Display parse errors as Monaco diagnostics (red squiggles, problems panel)
  - [ ] Clear errors when parse succeeds
- [ ] Implement keyboard shortcuts:
  - [ ] Cmd/Ctrl+Enter -- submit (wired in Phase 7)
  - [ ] Cmd/Ctrl+S -- save/format
  - [ ] Shortcuts for tab navigation
- [ ] Implement resizable horizontal split: prompt panel (left) + editor workspace (right)
- [ ] Write component tests for file tree interactions and tab management

### Validation Gate

The editor renders with a file tree, supports creating/renaming/deleting files and folders, opens files in tabs, supports split panes, switches between keybinding modes, and shows real-time parse errors from Tree-sitter. Zustand store correctly tracks all editor state.

---

## Phase 5 -- Catalog (Browse)

**Goal:** Pack grid and challenge list views with search and filtering.

**Depends on:** Phase 3 (data access layer for querying packs/challenges)

### Checklist

- [ ] Implement pack grid view (`/` or `/catalog`):
  - [ ] Card grid layout (responsive desktop grid)
  - [ ] Pack card: name, framework, language, challenge count, completion progress bar
  - [ ] Click card to navigate to challenge list
- [ ] Implement challenge list view (`/pack/[slug]`):
  - [ ] Ordered list of challenges
  - [ ] Per-challenge: title, status badge (not attempted / failed / passed), difficulty badge, time estimate
  - [ ] Click challenge to navigate to editor
  - [ ] "Recommended order" indicator
- [ ] Implement search:
  - [ ] Search input above pack grid
  - [ ] Convex search index query on titles, prompts, tags
  - [ ] Debounced search with loading state
- [ ] Implement filters:
  - [ ] Language/framework filter
  - [ ] Difficulty filter (beginner/intermediate/advanced)
  - [ ] Tag filter
  - [ ] Completion status filter (not attempted / failed / passed)
  - [ ] Filter state in URL query params (shareable/bookmarkable)
- [ ] Implement empty states:
  - [ ] No packs found
  - [ ] No challenges match filters
- [ ] Wire pack grid and challenge list to `PackRepository`
- [ ] Wire completion status to `AttemptRepository`
- [ ] Add loading skeletons for pack grid and challenge list

### Validation Gate

Browsing the catalog shows pack cards with real data from Convex. Clicking a pack shows its challenge list with status badges. Search returns relevant results. Filters narrow the catalog correctly. Empty states display when appropriate.

---

## Phase 6 -- Drafts + Settings + Time Tracking

**Goal:** localStorage draft persistence, user settings UI with Convex sync, and opt-in timer.

**Depends on:** Phase 3 (settings repository), Phase 4 (editor store)

### Checklist

- [ ] Implement draft auto-save:
  - [ ] Zustand middleware for localStorage persistence
  - [ ] Save all open file contents on keystroke (debounced, ~500ms)
  - [ ] Key drafts by challenge ID
  - [ ] Restore drafts when returning to a challenge
  - [ ] Clear drafts on submission
  - [ ] Handle multi-file workspace (save entire file tree state)
- [ ] Implement settings UI:
  - [ ] Settings page or modal
  - [ ] Feedback level selector (L0-L4 with descriptions)
  - [ ] Editor keybindings selector (Normal/Vim/Emacs)
  - [ ] Theme selector (Dark/Light/System)
  - [ ] Autocomplete toggle
  - [ ] Formatter configuration:
    - [ ] Per-language formatter settings (tabs/spaces, quote style, semicolons, print width)
    - [ ] Trigger mode (format on submit / format on save / disabled)
  - [ ] Time tracking toggle
- [ ] Wire settings to `SettingsRepository`:
  - [ ] Load settings on app init
  - [ ] Persist changes to Convex on update (debounced)
  - [ ] Optimistic UI updates
- [ ] Implement time tracking:
  - [ ] Timer starts on first keystroke in a challenge
  - [ ] Runs continuously (no pause on blur/idle)
  - [ ] Timer display in editor toolbar (when enabled)
  - [ ] Time recorded on attempt submission
  - [ ] Timer resets on new challenge
- [ ] Write tests for draft persistence (save, restore, clear lifecycle)
- [ ] Write tests for settings sync (optimistic update, Convex round-trip)

### Validation Gate

Drafts persist across page reloads and restore correctly for multi-file challenges. Drafts clear after submission. Settings changes reflect immediately in the UI and persist to Convex. Timer runs continuously from first keystroke and records time on submission.

---

## Phase 7 -- Challenge Flow

**Goal:** The complete drill loop -- the core user experience that ties all prior phases together.

**Depends on:** Phases 2, 3, 4, 5, 6 (all prior feature phases)

### Checklist

- [ ] Implement challenge page (`/challenge/[id]`):
  - [ ] Load full challenge data via `PackRepository`
  - [ ] Initialize editor workspace:
    - [ ] Scaffolded mode: pre-populate file tree from challenge definition
    - [ ] Blank canvas mode: empty file tree, user creates files
  - [ ] Display prompt in left panel
  - [ ] Restore draft if exists
- [ ] Implement submit flow:
  - [ ] Cmd/Ctrl+Enter triggers submission
  - [ ] Collect all files from editor store
  - [ ] Run verification pipeline (Phase 2):
    - [ ] Format (if configured)
    - [ ] Parse (Tree-sitter)
    - [ ] Per-file assertions
    - [ ] Cross-file assertions
    - [ ] Aggregate results
  - [ ] Persist attempt via `AttemptRepository` (async, non-blocking)
  - [ ] Clear draft
  - [ ] Transition to results view
- [ ] Implement results view (replaces editor workspace on submit):
  - [ ] Overall pass/fail banner
  - [ ] File tree with per-file pass/fail badges
  - [ ] Submitted code (read-only) in editor pane
  - [ ] Respect feedback level setting:
    - [ ] L0: pass/fail only, no assertion details
    - [ ] L1: per-assertion pass/fail with descriptive messages
    - [ ] L2: L1 + hint access
    - [ ] L3: L2 + inline annotations on submitted code showing failure locations
    - [ ] L4: L3 + diff view
  - [ ] Parse errors displayed prominently (always, regardless of feedback level)
- [ ] Implement hints:
  - [ ] "Show next hint" button (available during challenge and on results screen)
  - [ ] Progressive reveal (one at a time)
  - [ ] Track hints used count for attempt record
  - [ ] Available at L2+ feedback level (and always during active editing)
- [ ] Implement diff view (L4):
  - [ ] Side-by-side diff mode
  - [ ] Unified diff mode
  - [ ] User-selectable toggle
  - [ ] Per-file diff (file tree navigation in results view)
- [ ] Implement inline annotations (L3):
  - [ ] Map failed assertions to source locations in submitted code
  - [ ] Render as Monaco decorations (read-only mode)
  - [ ] Annotation messages describe what is missing
- [ ] Implement navigation:
  - [ ] "Next challenge in pack" button (advances in recommended order)
  - [ ] "Back to catalog" link
  - [ ] "Retry" button (returns to editor with submitted code)
  - [ ] No auto-advance
- [ ] Implement attempt history:
  - [ ] View past attempts for a challenge
  - [ ] Per-attempt: pass/fail, time, hints used, timestamp
- [ ] Write integration tests for submit -> verify -> results flow
- [ ] Write tests for each feedback level rendering correctly

### Validation Gate

A user can: browse the catalog, select a challenge, write code (single or multi-file), submit, see results at every feedback level (L0-L4), use hints, view diffs, navigate to the next challenge, and see their attempt history. Drafts restore on return. Timer records correctly. The full drill loop works end-to-end.

---

## Phase 8 -- Launch Packs

**Goal:** Three complete challenge packs with validation tooling and seed infrastructure.

**Depends on:** Phase 7 (challenge flow must work to validate packs)

### Checklist

- [ ] Build pack validation tooling (`tools/`):
  - [ ] JSON schema for `pack.json` and challenge files
  - [ ] CLI validator: schema check + reference solution verification
  - [ ] Run every reference solution through the full verification pipeline
  - [ ] Descriptive error output for invalid packs
  - [ ] Integrate into CI (packs validated on every push)
- [ ] Build seed script (`tools/seed.ts`):
  - [ ] Read pack JSON files from `packs/` directory
  - [ ] Validate all packs before import
  - [ ] Upsert into Convex via `admin.syncPacks` action
  - [ ] Idempotent (safe to re-run)
  - [ ] CLI interface (`pnpm run seed`)
- [ ] Author Express.js pack (`packs/express-basics/`):
  - [ ] ~10 challenges covering:
    - [ ] Basic route handlers (GET, POST)
    - [ ] Route parameters and query strings
    - [ ] Middleware (custom, error-handling)
    - [ ] Router composition
    - [ ] JSON response patterns
    - [ ] Multi-file Express application structure
  - [ ] Progressive difficulty (beginner -> intermediate -> advanced)
  - [ ] Hints for each challenge
  - [ ] Reference solutions passing all assertions
- [ ] Author React pack (`packs/react-fundamentals/`):
  - [ ] ~10 challenges covering:
    - [ ] Functional components with props
    - [ ] useState and useEffect hooks
    - [ ] Custom hooks
    - [ ] Component composition patterns
    - [ ] Conditional rendering
    - [ ] Event handling
    - [ ] Multi-component applications
  - [ ] Progressive difficulty
  - [ ] Hints and reference solutions
- [ ] Author Python/FastAPI pack (`packs/fastapi-basics/`):
  - [ ] ~10 challenges covering:
    - [ ] Basic route handlers
    - [ ] Path and query parameters
    - [ ] Pydantic models for request/response
    - [ ] Dependency injection
    - [ ] Error handling
    - [ ] Multi-file FastAPI application structure
  - [ ] Progressive difficulty
  - [ ] Hints and reference solutions
- [ ] Validate all three packs through the validation tooling
- [ ] Seed all packs into Convex development environment
- [ ] Manual QA: complete at least one challenge from each pack end-to-end

### Validation Gate

All three packs pass schema validation and reference solution verification. Seed script successfully imports all packs into Convex. Every challenge can be completed end-to-end in the application -- write the reference solution, submit, see pass result. ~30 total challenges across three packs.

---

## Phase 9 -- Polish + E2E + Deploy

**Goal:** Production readiness -- testing, infrastructure, monitoring, and deployment.

### Checklist

- [ ] Write Playwright E2E tests (5-10 tests):
  - [ ] Sign in with GitHub OAuth (test user)
  - [ ] Browse catalog, search, filter
  - [ ] Open a challenge, write code, submit
  - [ ] Verify results display at each feedback level
  - [ ] Multi-file challenge: create files, write code, submit
  - [ ] View diff (L4)
  - [ ] Navigate to next challenge
  - [ ] Settings: change feedback level, verify it applies
  - [ ] Draft persistence: write code, leave, return, verify restore
  - [ ] Timer: enable, write code, submit, verify time recorded
- [ ] Set up Docker Compose for production:
  - [ ] Next.js Dockerfile (multi-stage build)
  - [ ] `docker-compose.yml` with Next.js service
  - [ ] Environment variable configuration (.env.production)
  - [ ] Health check endpoint
- [ ] Set up Cloudflare:
  - [ ] DNS configuration
  - [ ] SSL termination
  - [ ] CDN caching rules (static assets, WASM grammars)
  - [ ] Cache headers for challenge data
- [ ] Complete GitHub Actions CI/CD pipeline:
  - [ ] Run Vitest (unit/integration)
  - [ ] Run Playwright (E2E)
  - [ ] Deploy Convex functions (`npx convex deploy`)
  - [ ] Build and push Docker image
  - [ ] Deploy to VPS (Docker Compose pull + restart)
  - [ ] Run pack seed after Convex deploy
  - [ ] All tests must pass before deploy (blocking gate)
- [ ] Set up Sentry error tracking:
  - [ ] Next.js Sentry SDK integration
  - [ ] Source maps upload
  - [ ] Error boundary components
- [ ] Set up structured logging:
  - [ ] Request logging middleware
  - [ ] Verification pipeline logging (client-side, for debugging)
  - [ ] Log to stdout (Docker captures)
- [ ] Performance audit:
  - [ ] Verify WASM grammar lazy loading works correctly
  - [ ] Verify verification pipeline performance (< 100ms target)
  - [ ] Lighthouse audit for initial page load
  - [ ] Bundle size analysis (Monaco, Tree-sitter, Prettier WASM)
- [ ] Production QA:
  - [ ] Complete every challenge in all three packs
  - [ ] Test every feedback level
  - [ ] Test auth flow (sign in, session persistence, sign out)
  - [ ] Test on Chrome, Firefox, Safari (desktop)
  - [ ] Verify Convex rate limiting under load
- [ ] Final cleanup:
  - [ ] Remove development-only code/routes
  - [ ] Verify environment variable documentation
  - [ ] Verify AGPL-3.0 license headers where required

### Validation Gate

CI/CD pipeline deploys to production automatically on merge to main. All Playwright E2E tests pass. Sentry captures errors. Application loads, authenticates, and serves challenges from the production VPS + Convex Cloud stack. All three launch packs are seeded and playable. Lighthouse performance score is acceptable for a desktop-only application.

---

## Timeline Summary

| Phase | Name                            | Parallel Group | Est. Effort |
|-------|---------------------------------|----------------|-------------|
| 0     | Monorepo Foundation + CI        | --             | Small       |
| 1     | Design System + Shared Types    | --             | Small-Med   |
| 2     | Verification Engine             | A (parallel)   | Large       |
| 3     | Auth + Convex + Data Access     | A (parallel)   | Medium      |
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

5. **Convex Auth GitHub OAuth** -- Convex Auth is relatively new. Test the full auth lifecycle (sign in, session refresh, sign out, expired session) thoroughly in Phase 3. Have a contingency plan if the API changes.

6. **Challenge authoring bottleneck** -- Phase 8 requires writing ~30 challenges with correct assertions. The verification engine (Phase 2) and its test harness must be solid and well-documented before starting content authoring, or pack creation will be slow and error-prone.

7. **Cross-file assertions** -- Verifying relationships across files (imports reference correct exports, file structure matches) is conceptually simple but has many edge cases (re-exports, barrel files, relative vs. absolute paths). Scope carefully in Phase 2.

8. **Oracle Cloud VPS** -- Single-server deployment has no redundancy. Acceptable for MVP, but monitor uptime. Docker Compose makes migration to another provider straightforward.
