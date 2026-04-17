# Phase 9: Polish, E2E, and Deploy

> **Status:** Complete
> **Spec ID prefix:** `DPLO`
> **Phase:** 9
> **Completed:** 2026-02-20

## Overview

This phase adds production readiness: end-to-end tests covering all major user flows, a Docker deployment pipeline, CI automation, and a health check endpoint. The E2E test suite uses Playwright against a real dev server with a Spring Boot + PostgreSQL backend. The Docker setup produces a 3-container Docker Compose stack (PostgreSQL + Spring Boot + Next.js). CI runs on push/PR to main with affected-only testing for performance.

## Dependencies

- All previous phases (E2E tests exercise the full stack)

## User Flows

### E2E Test Execution

1. CI or developer runs `pnpm e2e`
2. Playwright starts the Next.js dev server
3. Tests navigate through catalog, challenge flow, settings, drafts, and navigation
4. Each test verifies observable behavior against the live application
5. Failures produce screenshots and trace files for debugging

### Docker Deployment

1. Operator creates `.env` with `DB_PASSWORD`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ADMIN_SECRET`, `FRONTEND_URL`
2. `docker compose build` builds PostgreSQL, Spring Boot, and Next.js containers
3. `docker compose up` starts the full stack (Next.js on port 3000, Spring Boot internal, PostgreSQL internal)
4. Health check polls `/api/health`

### CI Pipeline

1. Push to `main` or PR triggers the pipeline
2. Steps: validate packs -> lint (affected) -> typecheck (all) -> test (affected) -> build (affected) -> Spring Boot build+test -> start Spring Boot -> seed test data -> Playwright E2E -> Docker compose build verify
3. CI starts Spring Boot + PostgreSQL via Docker, seeds via `pnpm seed`

## Acceptance Criteria

### Health Check

- [ ] **DPLO-01** -- `GET /api/health` returns `{ status: "ok", timestamp: <epoch_ms> }` with HTTP 200.

### E2E Test Suite

- [ ] **DPLO-02** -- Playwright E2E tests cover catalog browsing (pack grid, filters, pack page).
- [ ] **DPLO-03** -- Playwright E2E tests cover the challenge flow (3-panel layout, submit, results, retry).
- [ ] **DPLO-04** -- Playwright E2E tests cover draft persistence (navigate away and back restores content).
- [ ] **DPLO-05** -- Playwright E2E tests cover settings (toggle feedback, keybinding persistence).
- [ ] **DPLO-06** -- Playwright E2E tests cover navigation (pack query param, back to pack, logo to catalog).
- [ ] **DPLO-07** -- Playwright E2E tests cover multi-file challenges (create file, switch files, submit).
- [ ] **DPLO-08** -- Playwright E2E tests cover feedback level gating (all off, showPassFail, showDiff).
- [ ] **DPLO-09** -- Playwright E2E tests cover attempt persistence to Spring Boot.

### Docker

- [ ] **DPLO-10** -- Multi-stage Dockerfile produces a 3-container Docker Compose stack (PostgreSQL + Spring Boot + Next.js) with standalone Next.js output.
- [ ] **DPLO-11** -- Docker healthcheck uses `curl` to poll `/api/health`.

## Technical Context

### Key Files

| File | Role |
|------|------|
| `apps/web/src/app/api/health/route.ts` | Health check endpoint |
| `apps/web/e2e/catalog.spec.ts` | Catalog browsing E2E tests |
| `apps/web/e2e/challenge-flow.spec.ts` | Submit and results E2E tests |
| `apps/web/e2e/drafts.spec.ts` | Draft persistence E2E tests |
| `apps/web/e2e/settings.spec.ts` | Settings dialog E2E tests |
| `apps/web/e2e/navigation.spec.ts` | Navigation flow E2E tests |
| `apps/web/e2e/multi-file.spec.ts` | Multi-file challenge E2E tests |
| `apps/web/e2e/feedback-levels.spec.ts` | Feedback gating E2E tests |
| `apps/web/e2e/attempt-persistence.spec.ts` | Attempt persistence E2E tests |
| `apps/web/e2e/helpers.ts` | E2E test utilities |
| `Dockerfile` | Multi-stage production build |
| `docker-compose.yml` | Container orchestration with healthcheck |
| `docker-compose.dev.yml` | PostgreSQL only for local development |
| `services/api/Dockerfile` | Spring Boot multi-stage build (Gradle -> eclipse-temurin:25-jre-alpine) |
| `.github/workflows/ci.yml` | CI pipeline definition |

### Patterns and Decisions

- **Real backend for E2E** -- tests run against Docker Compose stack (PostgreSQL + Spring Boot + Next.js), seeded via `/api/admin/packs/seed`. No mocks.
- **Monaco interaction via `page.evaluate`** -- Playwright cannot type directly into Monaco. Tests use `window.monaco.editor.getEditors()[0].setValue()` to inject code.
- **Alpine-based image** -- Next.js uses `node:22-alpine` for minimal image size. Spring Boot uses `eclipse-temurin:25-jre-alpine`.
- **Standalone output** -- Next.js `output: 'standalone'` produces a self-contained server without node_modules, reducing image size to ~100-200MB.

## Test Coverage

### E2E Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| DPLO-02 | `apps/web/e2e/catalog.spec.ts` | All 5 catalog tests |
| DPLO-03 | `apps/web/e2e/challenge-flow.spec.ts` | All 3 challenge flow tests |
| DPLO-04 | `apps/web/e2e/drafts.spec.ts` | Draft restore test |
| DPLO-05 | `apps/web/e2e/settings.spec.ts` | Settings toggle and persistence tests |
| DPLO-06 | `apps/web/e2e/navigation.spec.ts` | All 4 navigation tests |
| DPLO-07 | `apps/web/e2e/multi-file.spec.ts` | All 3 multi-file tests |
| DPLO-08 | `apps/web/e2e/feedback-levels.spec.ts` | All 3 feedback level tests |
| DPLO-09 | `apps/web/e2e/attempt-persistence.spec.ts` | All 2 attempt persistence tests |

## Open Questions

- None at this time.
