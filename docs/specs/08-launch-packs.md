# Phase 8: Launch Packs

> **Status:** Complete
> **Spec ID prefix:** `PACK`
> **Phase:** 8
> **Completed:** 2026-02-20

## Overview

Launch packs are the initial set of curated challenge packs that ship with the platform. Three packs cover JavaScript (Express), React (TSX), and Python (FastAPI) with 10 challenges each, totaling 30 challenges. Each pack is defined as JSON files in `packs/` and seeded to Spring Boot via `tools/seed.ts`. A validation tool (`tools/validate-packs.ts`) ensures all reference solutions pass their assertions before deployment. Behavioral tests verify that reference solutions work at runtime (not just structurally).

## Dependencies

- [VRFY-01] through [VRFY-19] (verification engine for validating assertions)
- [AUTH-04], [AUTH-05] (Spring Boot JPA entities for storing packs/challenges)
- [DSST-01], [DSST-02], [DSST-03] (Pack, Challenge, Assertion types)

## User Flows

### Pack Validation (Author Time)

1. Author writes pack JSON (`packs/<pack-slug>/pack.json`) and challenge JSONs (`packs/<pack-slug>/challenges/*.json`)
2. Author runs `pnpm validate` to verify all reference solutions pass their assertions
3. Structural validation checks assertion format and reference solution completeness
4. Behavioral tests (`pnpm validate:behavioral` / `pnpm validate:python`) run reference solutions against runtime test suites

### Pack Seeding (Deployment)

1. Admin sets `SPRING_BOOT_URL` and `ADMIN_SECRET`
2. Admin runs `pnpm seed` to upsert packs and challenges to Spring Boot
3. With `--sync` flag, stale packs not in the local set are deleted

## Acceptance Criteria

### Pack Content

- [ ] **PACK-01** -- Three launch packs exist: express-basics (JavaScript), react-fundamentals (TSX), and fastapi-basics (Python), each with 10 challenges.
- [ ] **PACK-02** -- Each challenge has a reference solution that passes all its assertions when verified by the verification engine.
- [ ] **PACK-03** -- Challenges are ordered by difficulty within each pack (Beginner -> Intermediate -> Advanced).

### Structural Validation

- [ ] **PACK-04** -- `pnpm validate` runs the verification engine against every challenge's reference solution and reports pass/fail per challenge.
- [ ] **PACK-05** -- Validation exits with a non-zero code if any challenge fails.

### Behavioral Validation

- [ ] **PACK-06** -- `pnpm validate:behavioral` runs Express and React behavioral tests using supertest and @testing-library/react respectively.
- [ ] **PACK-07** -- `pnpm validate:python` runs FastAPI behavioral tests using pytest via uv.
- [ ] **PACK-08** -- All 65 behavioral tests pass (25 Express + 30 React + 10 FastAPI).

### Seeding

- [ ] **PACK-09** -- `pnpm seed` upserts all packs and challenges to Spring Boot via POST /api/admin/seed, matching by slug. Existing packs are updated, new packs are created.
- [ ] **PACK-10** -- `pnpm seed -- --sync` deletes Spring Boot packs whose slugs are not in the local pack set via POST /api/admin/sync.

## Technical Context

### Key Files

| File | Role |
|------|------|
| `packs/express-basics/pack.json` | Express.js pack metadata |
| `packs/react-fundamentals/pack.json` | React pack metadata |
| `packs/fastapi-basics/pack.json` | FastAPI pack metadata |
| `packs/express-basics/challenges/*.json` | 10 Express challenge definitions |
| `packs/react-fundamentals/challenges/*.json` | 10 React challenge definitions |
| `packs/fastapi-basics/challenges/*.json` | 10 FastAPI challenge definitions |
| `tools/validate-packs.ts` | Structural validation via verification engine |
| `tools/seed.ts` | Spring Boot seeding via POST /api/admin/seed and POST /api/admin/sync |
| `packs/vitest.config.mts` | Behavioral test config (root resolves via __dirname) |
| `packs/test-helpers.ts` | writeChallengeToTmp, importModule helpers |
| `packs/python-test-helpers.ts` | uv-based Python test execution |
| `packs/requirements.txt` | Python test dependencies (fastapi, httpx, pytest, pydantic) |

### Patterns and Decisions

- **JSON-based challenge definitions** -- challenges are static JSON, not code. The reference solution is stored as `files` (FileEntry array) in the JSON.
- **Pack files map to referenceSolution** -- the `files` field in pack JSON maps directly to `referenceSolution` in Spring Boot. No naming transformation.
- **tools/ use direct imports** -- `tools/` scripts import from relative paths, not workspace packages, since the repo root is not a workspace dep consumer.
- **`fileURLToPath(import.meta.url)`** -- used for `__dirname` in tools/ scripts because `import.meta.dirname` is undefined in `npx tsx`.
- **uv for Python** -- all Python operations use `uv` (not pip/python). Behavioral tests create a shared venv and run pytest via `uv run`.

### Spring Boot Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/admin/seed` | Upsert packs and their challenges |
| `POST /api/admin/sync` | Upsert all packs, delete stale ones |

## Test Coverage

### Behavioral Tests (Express)

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| PACK-02, PACK-06 | `packs/express-basics/__tests__/01-hello-world.test.ts` | GET /api/hello returns correct response |
| PACK-02, PACK-06 | `packs/express-basics/__tests__/02-route-params.test.ts` | GET /api/users/:id returns user |
| PACK-02, PACK-06 | `packs/express-basics/__tests__/03-post-json.test.ts` | POST /api/items accepts JSON |
| PACK-02, PACK-06 | `packs/express-basics/__tests__/04-query-filtering.test.ts` | GET /api/items filters by category |
| PACK-02, PACK-06 | `packs/express-basics/__tests__/05-multiple-routes.test.ts` | GET + POST /api/items |
| PACK-02, PACK-06 | `packs/express-basics/__tests__/06-custom-middleware.test.ts` | middleware calls next() |
| PACK-02, PACK-06 | `packs/express-basics/__tests__/07-error-handling.test.ts` | error middleware returns 500 |
| PACK-02, PACK-06 | `packs/express-basics/__tests__/08-express-router.test.ts` | router-mounted endpoints |
| PACK-02, PACK-06 | `packs/express-basics/__tests__/09-static-and-cors.test.ts` | CORS headers + health endpoint |
| PACK-02, PACK-06 | `packs/express-basics/__tests__/10-full-rest-api.test.ts` | Full CRUD lifecycle |

### Behavioral Tests (React)

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| PACK-02, PACK-06 | `packs/react-fundamentals/__tests__/01-counter.test.tsx` | Counter increments on click |
| PACK-02, PACK-06 | `packs/react-fundamentals/__tests__/02-props-display.test.tsx` | Renders name prop |
| PACK-02, PACK-06 | `packs/react-fundamentals/__tests__/03-useeffect-loader.test.tsx` | Fetches and renders data |
| PACK-02, PACK-06 | `packs/react-fundamentals/__tests__/04-conditional-rendering.test.tsx` | Renders based on status |
| PACK-02, PACK-06 | `packs/react-fundamentals/__tests__/05-event-handling.test.tsx` | Toggle on/off |
| PACK-02, PACK-06 | `packs/react-fundamentals/__tests__/06-list-with-keys.test.tsx` | Renders todo list |
| PACK-02, PACK-06 | `packs/react-fundamentals/__tests__/07-custom-hook.test.tsx` | useLocalStorage persistence |
| PACK-02, PACK-06 | `packs/react-fundamentals/__tests__/08-controlled-form.test.tsx` | Controlled inputs + submit |
| PACK-02, PACK-06 | `packs/react-fundamentals/__tests__/09-component-composition.test.tsx` | Card with children |
| PACK-02, PACK-06 | `packs/react-fundamentals/__tests__/10-usereducer-todo.test.tsx` | useReducer add/toggle |

### Behavioral Tests (Python)

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| PACK-02, PACK-07 | `packs/fastapi-basics/__tests__/*.py` | 10 FastAPI endpoint tests via pytest |

### Spring Boot Tests

| Criterion | Test Location | Test Description |
|-----------|--------------|-----------------|
| PACK-09 | `services/api/src/test/java/...` | AdminController integration test: seed creates a pack and challenges |
| PACK-09 | `services/api/src/test/java/...` | AdminController integration test: seed upserts on duplicate slug |
| PACK-10 | `services/api/src/test/java/...` | AdminController integration test: sync creates and cleans up stale |

## Open Questions

- None at this time.
