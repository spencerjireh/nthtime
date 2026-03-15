# Phase 10: Pack Author Web UI

> **Status:** Complete
> **Spec ID prefix:** `ATHR`
> **Phase:** 10
> **Completed:** 2026-02-25

## Overview

The author web UI enables authenticated users to create, edit, and manage their own challenge packs entirely through the browser. Authors can define pack metadata, write reference solutions in Monaco, compose assertion JSON with a snippet palette, validate assertions client-side, preview challenges, reorder challenges, and export packs as ZIP files. The system supports three visibility levels (private, unlisted, public) and enforces ownership on all mutations.

## Dependencies

- [AUTH-01], [AUTH-02] (authentication for author identity)
- [AUTH-04], [AUTH-05] (PostgreSQL schema for packs/challenges)
- [AUTH-13] (AuthorRepository interface)
- [AUTH-15] (rate limiting for author writes)
- [VRFY-01] through [VRFY-19] (verification engine for client-side validation)
- [EDIT-01] (EditorStore for solution file editing)
- [DSST-03] (Assertion types for assertion editor)

## User Flows

### Creating a Pack

1. Authenticated user navigates to /author
2. User clicks "New Pack" to go to /author/new
3. User fills in pack metadata: name, slug, language, description, framework, version, tags
4. Slug availability is checked in real-time
5. User submits to create the pack
6. User is redirected to the pack editor at /author/[slug]

### Editing a Challenge

1. Author opens a pack editor showing the challenge list
2. Author clicks "Add Challenge" or selects an existing challenge
3. Challenge editor shows 4 tabs: Metadata, Solution, Assertions, Validate
4. Metadata tab: title, slug, prompt (markdown), difficulty, tags, time estimate, hints
5. Solution tab: Monaco editor for reference solution files (creates its own EditorStore instance)
6. Assertions tab: JSON editor with snippet palette for 12 assertion types
7. Validate tab: runs Tree-sitter WASM verification against the current solution
8. Author saves the challenge

### Previewing a Challenge

1. Author clicks "Preview" on a challenge
2. Preview renders the same ChallengeView used by students
3. An amber banner indicates preview mode
4. Author can test the full submit/results flow with their reference solution

### Exporting a Pack

1. Author clicks "Export" on the pack editor
2. System generates a ZIP file containing pack.json and challenges/*.json
3. ZIP structure matches the `packs/` directory format for compatibility with `pnpm seed`

### Importing a Pack

1. Author uploads a ZIP file at /author/new
2. System auto-detects ZIP structure (root, nested, or inline format)
3. Pack metadata is stored in sessionStorage
4. User is redirected to /author/new?import=1 to review and create

### Reordering Challenges

1. Author opens the pack editor challenge list
2. Author drags challenges to reorder them
3. New order is saved to the database via Spring Boot API, updating challenge order fields

## Acceptance Criteria

### Dashboard

- [ ] **ATHR-01** -- Authenticated users see a "My Packs" dashboard at /author listing their packs with name, language, challenge count, and visibility.
- [ ] **ATHR-02** -- The author link in the header is only visible to authenticated users.

### Pack CRUD

- [ ] **ATHR-03** -- Creating a pack requires name, slug, language, and description. Slug uniqueness is validated before creation.
- [ ] **ATHR-04** -- Updating a pack allows changing name, slug, description, language, framework, version, tags, and visibility.
- [ ] **ATHR-05** -- Deleting a pack removes the pack and all its challenges from the database.
- [ ] **ATHR-06** -- Pack visibility can be set to private (author only), unlisted (accessible by URL), or public (visible in catalog).
- [ ] **ATHR-07** -- Only the pack's author can edit or delete it (ownership verified on every mutation).

### Challenge CRUD

- [ ] **ATHR-08** -- Creating a challenge requires packId, slug, title, prompt, difficulty, and reference solution.
- [ ] **ATHR-09** -- Updating a challenge accepts partial fields and preserves unmodified values.
- [ ] **ATHR-10** -- Updating a challenge deletes all existing attempts for that challenge (assertions may have changed).
- [ ] **ATHR-11** -- Deleting a challenge removes it and renumbers the remaining challenges to maintain sequential order.
- [ ] **ATHR-12** -- Challenges can be reordered within a pack, updating the order field for all affected challenges.

### Challenge Editor

- [ ] **ATHR-13** -- The challenge editor has 4 tabs: Metadata, Solution, Assertions, and Validate.
- [ ] **ATHR-14** -- The Solution tab provides a Monaco editor for writing reference solution files, backed by its own EditorStore instance.
- [ ] **ATHR-15** -- The Assertions tab provides a JSON editor with a snippet palette offering templates for all 12 assertion types.
- [ ] **ATHR-16** -- The Validate tab runs the Tree-sitter WASM verification engine client-side against the current solution files and assertions, displaying pass/fail results.

### Preview

- [ ] **ATHR-17** -- The preview page at /author/[slug]/preview/[order] renders the ChallengeView component with challenge data from the author API.
- [ ] **ATHR-18** -- Preview mode displays an amber banner distinguishing it from the student view.

### Export and Import

- [ ] **ATHR-19** -- Pack export generates a ZIP (via fflate) containing pack.json and challenges/*.json in the same format as the `packs/` directory.
- [ ] **ATHR-20** -- Pack import accepts a ZIP file, auto-detects structure (root/nested/inline), stores data in sessionStorage, and navigates to /author/new?import=1.

### API Security

- [ ] **ATHR-21** -- All author API routes return 401 for unauthenticated requests.
- [ ] **ATHR-22** -- Author API routes only pass allowlisted fields to Spring Boot API endpoints, ignoring injected fields like packId or userId in request bodies.
- [ ] **ATHR-23** -- Author write operations are rate-limited to 30/min per user.

## Technical Context

### Key Files

| File | Role |
|------|------|
| `apps/web/src/components/author/author-dashboard.tsx` | Pack list with create/edit/delete |
| `apps/web/src/components/author/pack-editor.tsx` | Pack metadata + challenge list + export |
| `apps/web/src/components/author/challenge-editor.tsx` | 4-tab challenge editor |
| `apps/web/src/components/author/challenge-metadata-tab.tsx` | Title, prompt, difficulty, tags, hints |
| `apps/web/src/components/author/file-editor-tab.tsx` | EditorStore instance for solution files |
| `apps/web/src/components/author/assertion-editor.tsx` | JSON editor with snippet palette |
| `apps/web/src/components/author/validation-panel.tsx` | Client-side WASM verification |
| `apps/web/src/components/author/pack-form.tsx` | Pack metadata form |
| `apps/web/src/components/author/challenge-order-list.tsx` | Drag-reorder challenges |
| `apps/web/src/components/author/hint-list-editor.tsx` | Hint CRUD |
| `apps/web/src/components/author/conditional-author-link.tsx` | Auth-gated header link |
| `apps/web/src/hooks/use-author.ts` | Author React Query hooks (lazy getApi pattern) |
| `services/api/src/main/java/.../controller/AuthorPackController.java` | Author pack REST endpoints |
| `services/api/src/main/java/.../controller/AuthorChallengeController.java` | Author challenge REST endpoints |
| `services/api/src/main/java/.../service/AuthorPackService.java` | Author pack business logic |
| `services/api/src/main/java/.../service/AuthorChallengeService.java` | Author challenge business logic |

### Patterns and Decisions

- **FileEditorTab creates own EditorStore** -- each file editor tab instantiates its own `createEditorStore()` to avoid state conflicts with the main challenge editor.
- **fflate for ZIP** -- direct dependency for ZIP generation. Reference solution maps directly to JSON files (no naming flip).
- **Attempt deletion on update** -- when a challenge's assertions change, existing attempts become invalid. The update mutation deletes all attempts for the affected challenge.
- **Visibility filter in queries** -- `packs.list` filters private packs to author only; unlisted packs are accessible by direct URL but not listed in the catalog.

### Spring Boot Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/author/packs` | GET | List author's packs |
| `/api/author/packs` | POST | Create pack |
| `/api/author/packs/{slug}` | GET | Pack detail with challenges |
| `/api/author/packs/{slug}` | PATCH | Update pack metadata |
| `/api/author/packs/{slug}` | DELETE | Delete pack and all challenges |
| `/api/author/packs/{slug}/export` | GET | Pack data for ZIP export |
| `/api/author/packs/check-slug` | GET | Validate slug uniqueness |
| `/api/author/challenges/{id}` | GET | Challenge detail |
| `/api/author/packs/{slug}/challenges` | POST | Create challenge |
| `/api/author/challenges/{id}` | PATCH | Update challenge (deletes attempts) |
| `/api/author/challenges/{id}` | DELETE | Delete challenge (renumbers) |
| `/api/author/packs/{slug}/challenges/reorder` | PUT | Reorder challenges |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/author/packs` | GET | List author's packs |
| `/api/v1/author/packs` | POST | Create pack |
| `/api/v1/author/packs/[slug]` | GET | Pack detail |
| `/api/v1/author/packs/[slug]` | PUT | Update pack |
| `/api/v1/author/packs/[slug]` | DELETE | Delete pack |
| `/api/v1/author/packs/[slug]/export` | GET | Export pack for ZIP |
| `/api/v1/author/packs/[slug]/challenges` | GET, POST | List/create challenges |
| `/api/v1/author/packs/[slug]/challenges/[order]` | GET, PUT, DELETE | Challenge CRUD |
| `/api/v1/author/packs/[slug]/challenges/order` | POST | Reorder challenges |
| `/api/v1/author/packs/check-slug` | GET | Check slug availability |
| `/api/v1/author/challenges/[id]` | GET, PUT, DELETE | Challenge by ID |

## Test Coverage

### Unit Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| ATHR-21, ATHR-22 | `apps/web/src/app/api/v1/author/packs/[slug]/route.spec.ts` | Auth checks, field allowlisting, injected field rejection |
| ATHR-21, ATHR-22 | `apps/web/src/app/api/v1/author/challenges/[id]/route.spec.ts` | Auth checks, field allowlisting |

## Open Questions

- None at this time.
