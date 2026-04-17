# Phase 5: Catalog Browse

> **Status:** Complete
> **Spec ID prefix:** `CTLG`
> **Phase:** 5
> **Completed:** 2026-02-20

## Overview

The catalog is the entry point for users browsing available challenge packs. The home page displays a grid of pack cards with search and filter capabilities. Users can filter by programming language and difficulty level, with filter state persisted in URL search params for shareability. Clicking a pack navigates to its detail page showing the challenge list with status badges. The catalog fetches data from Spring Boot via the REST data access layer.

## Dependencies

- [AUTH-04], [AUTH-05] (Spring Boot JPA entities for packs and challenges)
- [AUTH-10] (PackRepository interface)
- [DSST-01] (Pack type)
- [DSST-06] (Difficulty enum)

## User Flows

### Browsing Packs

1. User visits the home page (`/`)
2. Catalog displays a grid of pack cards with name, description, language, difficulty, and challenge count
3. User types in the search bar to filter packs by title
4. User selects language filter to narrow results
5. User selects difficulty filter to narrow results further
6. Filter state updates URL search params (shareable links)
7. User clicks a pack card to navigate to the pack detail page

### Viewing a Pack

1. User arrives at `/packs/[slug]`
2. Page displays pack metadata (name, description, language, tags)
3. Challenge list shows each challenge with title, difficulty, time estimate, and completion status
4. User clicks a challenge row to navigate to the challenge editor

## Acceptance Criteria

### Pack Grid

- [ ] **CTLG-01** -- The home page renders a grid of pack cards with name, description, language, and challenge count.
- [ ] **CTLG-02** -- Each pack card displays the pack's programming language and number of challenges.
- [ ] **CTLG-03** -- Clicking a pack card navigates to the pack detail page at `/packs/[slug]`.

### Filtering

- [ ] **CTLG-04** -- Language filter narrows the displayed packs to those matching the selected language.
- [ ] **CTLG-05** -- Difficulty filter narrows the displayed packs to those matching the selected difficulty.
- [ ] **CTLG-06** -- Filter selections are persisted in URL search params, enabling shareable filtered views.
- [ ] **CTLG-07** -- Search input filters packs by name/title match.

### Pack Detail

- [ ] **CTLG-08** -- The pack page at `/packs/[slug]` displays pack metadata and a list of challenges.
- [ ] **CTLG-09** -- Each challenge row shows title, difficulty, time estimate, and completion status badge.
- [ ] **CTLG-10** -- Clicking a challenge row navigates to the nested challenge editor at `/packs/[packSlug]/challenges/[challengeSlug]`.

## Technical Context

### Key Files

| File | Role |
|------|------|
| `apps/web/src/components/catalog/catalog-page.tsx` | Main catalog with search, filters, pack grid |
| `apps/web/src/components/catalog/pack-grid.tsx` | Grid display of PackCard components |
| `apps/web/src/components/catalog/pack-card.tsx` | Individual pack card with metadata |
| `apps/web/src/components/catalog/catalog-search.tsx` | Search input component |
| `apps/web/src/components/catalog/catalog-filters.tsx` | Filter UI (language, difficulty, tags) |
| `apps/web/src/components/catalog/pack-page.tsx` | Pack detail page with challenges |
| `apps/web/src/components/catalog/challenge-list.tsx` | List of challenges in pack |
| `apps/web/src/components/catalog/challenge-row.tsx` | Single challenge row with status badge |
| `apps/web/src/components/catalog/empty-state.tsx` | No results message |
| `apps/web/src/hooks/use-packs.ts` | usePackList and useChallenges React Query hooks |

### Patterns and Decisions

- **URL-driven filter state** -- filters are stored in search params rather than component state, making filtered views shareable and bookmarkable.
- **Pack slug as query param** -- the `?pack=` param threads pack context through challenge navigation (catalog -> pack -> challenge -> results), enabling "Back to pack" navigation without re-fetching.

### Spring Boot Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/packs` | List packs with language/difficulty/tags filters |
| `GET /api/packs/{slug}` | Get pack detail with challenge list |
| `GET /api/search?q=` | Full-text search on challenge titles |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/packs` | GET | List packs with filters |
| `/api/v1/packs/[slug]` | GET | Pack detail with challenges |
| `/api/v1/search` | GET | Search challenges |

## Test Coverage

### E2E Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| CTLG-01 | `apps/web/e2e/catalog.spec.ts` | renders pack cards on home page |
| CTLG-03 | `apps/web/e2e/catalog.spec.ts` | clicking a pack card navigates to pack page |
| CTLG-08 | `apps/web/e2e/catalog.spec.ts` | pack page shows challenge details |
| CTLG-04 | `apps/web/e2e/catalog.spec.ts` | language filter narrows results |
| CTLG-05, CTLG-06 | `apps/web/e2e/catalog.spec.ts` | difficulty filter badges update URL |

### Spring Boot Tests

| Criterion | Test Location | Test Description |
|-----------|--------------|-----------------|
| CTLG-01 | `services/api/src/test/java/...` | PackController integration test: list returns all packs |
| CTLG-04 | `services/api/src/test/java/...` | PackController integration test: list filters by language |
| CTLG-08 | `services/api/src/test/java/...` | PackController integration test: get pack by slug returns challenges |

## Open Questions

- None at this time.
