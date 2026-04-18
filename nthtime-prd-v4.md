# nthtime -- Product Requirements Document

**Version 4.0 -- MVP**
**February 2026**
**License: Apache-2.0 -- Open Source, Free to Use**

---

## 1. Overview

nthtime is a web-based drilling platform for memorizing the syntax and mechanical patterns of programming languages and frameworks. It targets the gap between understanding concepts and having fluent muscle memory: writing Express middleware, React hooks, FastAPI routes, and complete multi-file applications from a blank canvas, verified against structural assertions.

The platform is language- and framework-agnostic. Challenge content is data-driven and packaged as portable challenge packs that can be authored, versioned, and shared independently. All verification runs client-side in the browser -- code is never executed, only parsed and structurally analyzed.

**Target users:** Developers who know the concepts but want to keep syntax sharp across multiple frameworks without constantly searching documentation -- whether they're maintaining fluency, locking in newly learned patterns, adopting a new framework, or preparing for timed coding assessments.

---

## 2. Core Experience

### 2.1 Challenge Flow

The core loop is: **browse, select, write, submit, review, repeat.**

1. User browses a catalog of challenge packs, filtered by language, framework, difficulty, tags, and completion status.
2. User selects a challenge and is presented with a prompt describing what to build.
3. User writes code from scratch in a full editor (file tree sidebar, tabs, split panes). For multi-file challenges, the user either creates all files from scratch (blank canvas) or fills in a provided file tree skeleton (scaffolded), depending on challenge configuration. Real-time parse error feedback is shown via Tree-sitter as they type.
4. User submits. Code is optionally formatted, then verified against structural assertions -- all client-side. Result: pass/fail with per-assertion breakdown, displayed in a results view that replaces the editor.
5. User reviews results at their chosen feedback level (see Feedback Spectrum), then returns to the catalog or advances to the next challenge in the pack.

### 2.2 Feedback Spectrum

Users control how much feedback they receive via a global setting (adjustable per session). Progressive disclosure from minimal to maximal:

- **Level 0 -- Pass/Fail only:** Binary result. No assertion details.
- **Level 1 -- Assertion breakdown:** Pass/fail per assertion with descriptive messages (e.g., "Must export the middleware").
- **Level 2 -- Hints:** Progressive hints available anytime during the challenge or on the results screen after failure.
- **Level 3 -- Inline annotations:** The results view shows submitted code (read-only) with inline annotations indicating where assertions failed and what is missing.
- **Level 4 -- Diff:** Side-by-side or unified diff (user-selectable) comparing the user's code against the reference solution, per file.

Parse errors are always shown regardless of feedback level. If code does not parse, this is displayed as the primary issue before any structural assertion results.

### 2.3 Hints

Each challenge defines a static ordered list of hints -- general nudges toward the solution without revealing it.

- Available anytime during a challenge and on the results screen after a failed submission.
- Revealed one at a time via a "Show next hint" action.
- Whether hints were viewed is recorded on the attempt record.

### 2.4 Browse Mode

Users freely browse and select challenges from the catalog. No enforced ordering or progression. Two-level browse:

- **Pack grid:** Card grid of challenge packs. Each card shows pack name, framework, language, challenge count, and user's completion progress. Filtering and search above the grid.
- **Challenge list:** Clicking a pack opens an ordered list of challenges. Each shows status (not attempted / failed / passed), difficulty badge, and time estimate. Recommended order is indicated but the user can select any challenge freely.

Catalog search is powered by Convex search indexes over challenge titles, prompts, and tags. Filters: language/framework, difficulty (beginner/intermediate/advanced), tags, completion status.

### 2.5 Navigation

After completing a challenge (pass or fail), the results screen provides: a "Next challenge in pack" button advancing to the next in recommended order, and a "Back to catalog" link. No auto-advance.

### 2.6 Drafts and Auto-Save

In-progress code is auto-saved to localStorage on every keystroke (debounced). Drafts restore on return to a challenge. Applies to all files in a multi-file workspace. Drafts clear on submission.

### 2.7 Time Tracking

Opt-in (user-toggled globally). When enabled:

- Timer starts on first keystroke.
- Runs continuously until submission -- does not pause on tab blur, focus loss, or idle. Looking things up is part of the drill.
- Time taken is recorded on the attempt record.

---

## 3. Editor

### 3.1 Layout

Resizable horizontal split pane: prompt panel on the left, editor workspace on the right. The editor workspace includes a file tree sidebar, tabbed editor panes, and split pane support for viewing multiple files simultaneously.

On submit, the results view replaces the editor workspace. Results include the user's submitted code (read-only) alongside the assertion breakdown. Users can toggle back to the editor to retry.

### 3.2 File Management

**Blank canvas mode:** File tree sidebar provides inline buttons for creating new files and folders. Users can rename and delete.

**Scaffolded mode:** File tree is pre-populated with the directory structure from the challenge configuration. The user fills in code for each file.

### 3.3 Editor Configuration

- **Autocomplete:** Off by default. Configurable per session. When enabled, Monaco's IntelliSense provides standard completions.
- **Keybindings:** Normal (default), Vim, or Emacs mode via community Monaco extensions.
- **Theme:** Dark (default), light, or system-preference-aware. User toggle in settings.

### 3.4 Keyboard Shortcuts

The drill loop is keyboard-driven. Key bindings: Cmd/Ctrl+Enter to submit, Cmd/Ctrl+S to save/format, navigation shortcuts for next hint, toggle results, and return to catalog.

---

## 4. Verification Architecture

All verification runs client-side. The user's code never leaves the browser for verification. Convex only receives the final result (pass/fail + assertion outcomes) for persistence.

### 4.1 Verification Pipeline

Executes in sequence for each file:

1. **Formatting (optional):** Code is run through a client-side formatter to normalize style. Formatter determined by file extension and user's per-language settings. Prettier handles JS, TS, HTML, CSS, JSON, GraphQL, Markdown, YAML. Language-specific WASM formatters handle others. Files without a supported formatter pass through unchanged.
2. **Parsing (Tree-sitter WASM):** Each file is parsed into an AST using the appropriate Tree-sitter grammar (lazy-loaded per language). Parse failure is recorded as a failed assertion. Verification continues to other files.
3. **Per-file assertions:** The assertion engine walks the Tree-sitter AST and evaluates each file's assertion set.
4. **Cross-file assertions:** Structural relationships between files: import/export presence, file system structure checks, cross-file references.
5. **Result aggregation:** Pass/fail per assertion, per file, and overall. Results displayed immediately, persisted to Convex asynchronously.

### 4.2 Formatter Configuration

Users configure formatter settings globally with per-language overrides. Settings: tabs vs. spaces, quote style, semicolons, print width, and other language-specific options. Configurable trigger:

- **Format on submit:** Formatted when submitted, then verified.
- **Format on save:** Formatted on Cmd/Ctrl+S.
- **Disabled:** Raw input verified as-is.

### 4.3 Structural Assertions

Each challenge defines structural assertions describing what the code must contain, independent of formatting. The assertion engine is a JavaScript module running in the browser that queries the Tree-sitter AST.

**Assertion DSL (Hybrid):** JSON-based DSL for common assertion types (the 80% case), with an escape hatch to raw Tree-sitter S-expression queries for complex cases.

- **JSON DSL** covers: function parameter counts, method calls, exports, imports, variable declarations, return statements, and similar patterns.
- **Tree-sitter queries** provide full expressiveness: ordering (status() before json()), negation (must NOT use var), nesting depth, regex matching on string literals, and any pattern expressible in S-expressions.

**Assertion scope:**

- **Per-file:** Scoped to a specific file path. Each file's AST queried independently. This is the primary assertion type.
- **Cross-file:** Verify relationships between files -- file/directory existence, import/export relationships, structural consistency. These verify presence and structure, not simultaneous AST walks.

**Canonical enforcement:** The reference solution defines the canonical form. Assertions enforce it closely. Minor variations (variable names, whitespace) are tolerated due to the AST-based approach, but structural shape must match. This is deliberate: the platform drills specific patterns, not creative problem-solving.

### 4.4 Design Decisions

- **Client-side only (v1):** Results can be tampered with via devtools. Acceptable because nthtime is a personal drilling tool with no competitive features. Cheating only cheats yourself. Server-side re-validation can be added later without rewriting the client engine.
- **Reference solutions in client bundle:** Inspectable via devtools. Consistent with the above philosophy. The diff view depends on having the reference solution client-side.
- **Parse failure as failed assertion:** Submit proceeds but parse failure takes visual priority over structural results.

---

## 5. Challenge Pack Format

Challenge content is organized as portable, version-controlled packs. Single-file challenges are represented as a multi-file challenge with one entry in the files array.

### 5.1 Pack Structure

A challenge pack is a directory: `express-basics/ -> pack.json + challenges/*.json`

### 5.2 pack.json

Pack manifest: `name`, `slug`, `description`, `language`, `framework`, `version`, `author`, `tags` (string array), and `challenges` (ordered array of file paths to challenge JSON files). The array order defines recommended progression.

### 5.3 Challenge File

Each challenge file defines:

- `id`, `title`, `prompt`: Unique identifier, display title, natural-language description.
- `difficulty`: beginner | intermediate | advanced.
- `tags`: String array for filtering.
- `timeEstimateSeconds`: Expected completion time for catalog display.
- `scaffolded`: Boolean. If true, file tree provided pre-populated with empty contents. If false, blank canvas.
- `files`: Array of `{ path, content }` objects. Path is relative (e.g., `src/routes/index.ts`). Content is the reference solution. For scaffolded challenges, paths define the skeleton. For blank canvas, paths define expected structure for cross-file assertions.
- `hints`: Ordered array of hint strings.
- `assertions`: `{ perFile: { [filePath]: Assertion[] }, crossFile: Assertion[] }`.

### 5.4 Pack Import

- **Source of truth:** Pack JSON files are versioned in the repository under `packs/`. Git history tracks all content changes.
- **Runtime storage:** Convex database. A CLI seed script reads pack JSON files, validates them, and upserts into Convex via mutations. This runs as part of CI/CD deployment.
- **Admin sync:** A Convex action triggers the same validation and upsert process without a full redeploy. Restricted to admin users.

### 5.5 Pack Validation

On import, every pack is validated:

- **Schema validation:** pack.json and all challenge files validated against JSON schema. Malformed files rejected with descriptive errors.
- **Reference solution validation:** Every reference solution is run through the full verification pipeline (formatter + Tree-sitter + assertions). Must pass all assertions. Catches broken assertions before users encounter them.

---

## 6. Language Support

Six languages/ecosystems at launch. Each requires a Tree-sitter WASM grammar, a formatter solution, and language-specific assertion mappings. Grammars are lazy-loaded -- fetched from the Next.js `public/` directory and initialized only when a user opens a challenge in that language.

**Launch packs:**

- **Express.js:** Routing, middleware, error handling, small Express applications.
- **React:** Custom hooks, component composition, state management patterns.
- **Python / FastAPI:** Route handlers, dependency injection, Pydantic models, FastAPI applications.

---

## 7. Tech Stack

- **Frontend:** Next.js, Monaco editor, Prettier (WASM), Tree-sitter (WASM), Tailwind CSS, shadcn/ui (custom design system)
- **Client state:** Zustand (editor state, drafts, UI state, verification pipeline)
- **Backend:** Convex (reactive queries, mutations, actions, auth)
- **Auth:** Convex Auth with GitHub OAuth
- **Monorepo:** Nx with pnpm
- **Deployment:** Next.js in Docker Compose on Oracle Cloud VPS, Convex Cloud (managed), Cloudflare for SSL/CDN
- **Testing:** Vitest (unit/integration), Playwright (E2E), blocking CI gate
- **CI/CD:** GitHub Actions -- single pipeline deploys Convex functions and Next.js
- **Monitoring:** Structured logging to stdout, Sentry for error tracking

---

## 8. Authentication

GitHub OAuth only via Convex Auth. All target users are developers with GitHub accounts.

- **Sessions:** Managed by Convex Auth. No separate session store.
- **Rate limiting:** Convex's built-in rate limiting primitives on mutations and actions.

---

## 9. Architecture

### 9.1 System Overview

Compute-intensive work (parsing, formatting, assertion evaluation) runs in the browser. The backend is a thin persistence and auth layer provided by Convex.

- **Browser:** Next.js frontend, Monaco editor, Prettier (WASM), Tree-sitter (WASM), assertion engine, Zustand stores.
- **Backend:** Convex Cloud (database, server functions, auth). Next.js served via Docker Compose on VPS.

### 9.2 Data Access Layer

The frontend accesses all server data through a repository pattern abstraction to enable future backend migration.

- **Interfaces:** Repository interfaces (PackRepository, AttemptRepository, SettingsRepository) define the data contract.
- **Implementation:** A Convex implementation fulfills each interface, wired via React context provider at the app root.
- **Structure:** Both interfaces and implementations live in a single `libs/data-access` Nx library, internally separated into `interfaces/` and `convex/` directories. The barrel export exposes only interfaces and the provider.
- **Migration path:** When the backend migrates to Java/Spring Boot, a new implementation directory is added alongside `convex/` and the provider is swapped. No frontend component changes required.

### 9.3 Convex Responsibilities

Convex does not participate in verification:

- **Authentication:** GitHub OAuth via Convex Auth, session management.
- **Challenge catalog:** Queries for packs and challenges. Pack metadata + stubs on browse; full challenge data on individual load.
- **Result persistence:** Mutations to store attempt results sent from client after verification.
- **User settings:** Per-user preferences (feedback level, editor config, formatter config).
- **Pack import:** Convex actions for validating and upserting pack data from JSON.
- **Search:** Convex search indexes over titles, prompts, and tags.

### 9.4 Convex Functions

Approximately 8-10 server functions. Shared TypeScript interfaces maintained in a common Nx package.

**Queries (read):**
- `packs.list` -- list packs with metadata and user completion progress
- `packs.getChallenges` -- challenge stubs for a pack
- `challenges.get` -- full challenge data
- `settings.get` -- user settings
- `attempts.list` -- attempt history for a user/challenge

**Mutations (write):**
- `attempts.create` -- persist attempt result
- `settings.update` -- update user settings

**Actions (side effects):**
- `admin.syncPacks` -- validate and upsert pack data (admin-only)

### 9.5 Nx Monorepo Structure

```
apps/
  web/                    # Next.js app
convex/                   # Convex functions, schema, auth config
libs/
  data-access/            # Repository interfaces + Convex implementation
    src/
      interfaces/         # PackRepository, AttemptRepository, etc.
      convex/             # Convex implementations
      provider.tsx        # DI via React context
  shared/                 # Shared TypeScript types, constants
  verification/           # Tree-sitter + assertion engine (client-side)
  editor/                 # Monaco wrapper, file tree, tabs, split panes
packs/                    # Challenge pack JSON files (git-versioned)
tools/                    # CLI scripts (pack seed, validation)
```

---

## 10. Testing Strategy

Vitest for unit and integration tests. Playwright for E2E. Tests must pass in CI (GitHub Actions) before merge.

- **Critical (thorough unit/integration):** Assertion engine across every supported language including edge cases. Verification pipeline end-to-end. Pack validation and import.
- **Standard (integration):** Convex server functions -- challenge retrieval, attempt persistence, settings CRUD. Auth flows tested against Convex's local development server.
- **Light (selected component tests):** Complex interactive frontend components (file tree, tab management, split panes).
- **E2E (Playwright):** Critical user journey: browse catalog, open challenge, write code across multiple files, submit, see results, view diff, navigate to next challenge. Approximately 5-10 tests.

---

## 11. Infrastructure

- Next.js served via Docker Compose on Oracle Cloud VPS. Convex Cloud handles backend (database, server functions, auth).
- GitHub Actions CI/CD: push to main triggers tests, Convex deployment (`npx convex deploy`), Next.js Docker build and deploy to VPS.
- Cloudflare for SSL termination and CDN caching (static assets, WASM grammars, challenge data).
- Rate limiting via Convex's built-in rate limiting primitives.
- Structured logging to stdout. Sentry for error tracking.
- Desktop only. No mobile or tablet optimization.

---

## 12. MVP Scope

### In Scope

- GitHub OAuth authentication via Convex Auth
- Challenge catalog: pack grid + challenge list, search via Convex search indexes, filters
- Full editor: Monaco with file tree, tabs, split panes, file create/rename/delete
- Vim/Emacs/Normal keybinding modes
- Autocomplete off by default, configurable per session
- Multi-file challenges (unified format)
- Blank canvas and scaffolded challenge modes
- Client-side verification (Tree-sitter WASM + hybrid assertion DSL + cross-file assertions)
- Client-side formatting (Prettier + language formatters, per-language config, configurable trigger)
- Real-time parse error feedback
- Feedback spectrum (Levels 0-4, user-configurable)
- Hints (static, progressive, usage tracked)
- Diff view (unified or side-by-side, per file)
- Time tracking (opt-in, continuous)
- Full attempt history
- Results view with file tree + per-file pass/fail badges
- Three launch packs: Express.js, React, Python/FastAPI
- Pack import via CLI seed script with full validation
- Pack JSON files versioned in repository
- Drafts / auto-save to localStorage
- Dark-first theme with light mode available
- Custom design system (Tailwind + shadcn/ui, non-generic aesthetic)
- Zustand for client state management
- Repository pattern data access layer (Convex implementation behind interfaces)
- Docker Compose deployment (Next.js on VPS) + Convex Cloud
- Cloudflare SSL/CDN
- GitHub Actions CI/CD (single pipeline: Convex + Next.js)
- Vitest + Playwright test suite (blocking CI gate)
- Nx monorepo with pnpm
- WASM binaries bundled in Next.js public/ directory
- Apache-2.0

### Out of Scope (v2+)

- Java/Spring Boot backend migration (planned post-MVP)
- Admin dashboard for pack authoring
- Paid subscription tier / Stripe
- User-submitted challenge packs
- Email/password auth, OAuth beyond GitHub
- Auth provider migration (Auth0/Clerk for cross-platform auth)
- Anonymous experience / localStorage migration
- Offline support (service worker, IndexedDB queue)
- Practice mode / spaced repetition
- Social features (leaderboards, streaks, sharing)
- Server-side re-validation
- Analytics dashboard
- Data export, account deletion
- Web-based challenge authoring tool
- VS Code extension, community marketplace
- Fill-in-the-blank / fix-the-bug challenge formats
- Code execution / runtime verification
- LSP integration
- Mobile optimization
- Database backups (recommended near-term addition)

---

## 13. Migration Strategy (Post-MVP)

The MVP is built on Convex with a deliberate migration path to a Java/Spring Boot backend.

### 13.1 What Carries Over

- **Frontend:** Entirely unchanged. Repository interfaces insulate all components from the backend.
- **Challenge packs:** JSON files in the repository transfer directly. Import logic is rewritten for the new backend.
- **Verification engine:** Fully client-side, no backend dependency.
- **Design system:** All styling and UI components are backend-agnostic.

### 13.2 What Changes

- **Data access implementation:** New Java-backed implementations of PackRepository, AttemptRepository, SettingsRepository replace the Convex implementations. The provider swap at the app root is the only frontend change.
- **Auth:** Convex Auth does not carry over. Adopt a managed auth provider (Auth0 recommended) that spans both frontend and Spring Boot, or implement auth directly in Spring Boot.
- **Data migration:** Export user data (attempts, settings, progress) from Convex and import into PostgreSQL.
- **Infrastructure:** Add PostgreSQL, Redis, and the Spring Boot service to Docker Compose. Remove Convex Cloud dependency.

---

## 14. Success Criteria

The MVP is successful if:

1. You use it regularly to drill syntax across at least two frameworks.
2. Multi-file challenges accurately verify complete application structures and their relationships.
3. A new challenge pack can be authored and deployed in under 30 minutes with zero code changes.
4. Verification feels instant -- no perceptible delay from submit to result.
5. The system runs reliably on Convex Cloud + a single VPS.
