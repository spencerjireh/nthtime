# Phase 7: Challenge Flow

> **Status:** Complete
> **Spec ID prefix:** `CHAL`
> **Phase:** 7
> **Completed:** 2026-02-20

## Overview

The challenge flow is the core user journey: writing code, submitting it for verification, viewing results, and iterating. When the user submits, the verification engine runs client-side via Tree-sitter WASM, producing a VerificationResult. The results view shows a pass/fail banner, assertion details gated by feedback level settings, and optional diff comparison against the reference solution. Users can retry (restoring their submitted code) or navigate to the next challenge. Attempts are persisted to Convex for tracking progress.

## Dependencies

- [EDIT-01] through [EDIT-19] (EditorStore, file management, view modes)
- [VRFY-01] through [VRFY-05] (verification pipeline)
- [DRFT-05] (feedback settings control result visibility)
- [AUTH-06] (attempts table)
- [AUTH-11] (AttemptRepository)

## User Flows

### Submit and View Results

1. User writes code in the editor
2. User clicks Submit
3. EditorStore snapshots current files and switches to results view
4. Verification engine runs with submitted files and challenge assertions
5. Results panel shows pass/fail banner
6. Based on feedback settings, additional detail is shown:
   - Pass/fail badges per assertion (showPassFail)
   - Hints (showHints)
   - Assertion details with source locations (showAssertionDetails)
   - Diff view comparing submitted vs reference solution (showDiff)
   - Reference solution view (showSolution)
7. Attempt is persisted to Convex with pass/fail status and assertion results

### Retry

1. From the results view, user clicks Retry
2. EditorStore restores the submitted code snapshot
3. View switches back to editing mode
4. User can modify code and submit again

### Navigation

1. Results view shows "Back to pack" button linking to the pack page with `?pack=` context
2. Results view shows "Next challenge" button for sequential progression
3. Header logo navigates back to the catalog

## Acceptance Criteria

### Verification

- [ ] **CHAL-01** -- Clicking Submit runs the verification engine client-side with the current files and challenge assertions, producing a VerificationResult.
- [ ] **CHAL-02** -- The verification engine uses Tree-sitter WASM grammars loaded from `/tree-sitter/` in the browser.
- [ ] **CHAL-03** -- After submission, the results view displays a pass/fail banner indicating whether all assertions passed.

### Feedback Level Gating

- [ ] **CHAL-04** -- When all feedback flags are off, only the pass/fail banner is visible (no assertion details, no badges).
- [ ] **CHAL-05** -- When showPassFail is enabled, individual assertion pass/fail badges are visible.
- [ ] **CHAL-06** -- When showHints is enabled, hints are available for reveal.
- [ ] **CHAL-07** -- When showAssertionDetails is enabled, assertion details and source locations are shown.
- [ ] **CHAL-08** -- When showDiff is enabled, a Diff button is visible that opens Monaco DiffEditor comparing submitted vs reference solution.
- [ ] **CHAL-09** -- When showSolution is enabled, the reference solution is viewable.
- [ ] **CHAL-10** -- Feature flag `NEXT_PUBLIC_FF_SOLUTION_VIEW` gates the solution view independently (defaults to enabled).

### Results View

- [ ] **CHAL-11** -- The results view shows submitted code in a read-only Monaco editor.
- [ ] **CHAL-12** -- The `?pack=` query param threads pack context through the challenge URL for navigation.

### Navigation

- [ ] **CHAL-13** -- Results navigation includes a "Back to pack" button that returns to the pack page.
- [ ] **CHAL-14** -- Results navigation includes a Retry button that restores submitted code and returns to editing mode.
- [ ] **CHAL-15** -- Results navigation includes a "Next challenge" button that navigates to the next challenge in pack order.
- [ ] **CHAL-16** -- The header logo navigates to the catalog root.

### Attempt Persistence

- [ ] **CHAL-17** -- Submitting a challenge creates an attempt record in Convex with challengeId, passed, assertionResults, and hintsUsed.
- [ ] **CHAL-18** -- Attempt records accurately reflect whether the submission passed or failed.

## Technical Context

### Key Files

| File | Role |
|------|------|
| `apps/web/src/components/challenge/challenge-view.tsx` | Orchestrates submit, verification, and view mode transitions |
| `apps/web/src/components/challenge/results-panel.tsx` | Pass/fail banner, assertion details, feedback gating |
| `apps/web/src/components/challenge/diff-view.tsx` | Monaco DiffEditor for submitted vs reference comparison |
| `apps/web/src/components/challenge/solution-view.tsx` | Reference solution viewer |
| `apps/web/src/components/challenge/solution-panel.tsx` | Solution code display |
| `apps/web/src/lib/run-verification.ts` | Calls verify() with wasmBasePath: '/tree-sitter/' |
| `apps/web/src/hooks/use-attempts.ts` | useCreateAttempt and useAttemptList hooks |
| `apps/web/src/lib/feature-flags.ts` | NEXT_PUBLIC_FF_AUTH and NEXT_PUBLIC_FF_SOLUTION_VIEW |

### Patterns and Decisions

- **Client-side verification** -- verification runs entirely in the browser via Tree-sitter WASM. No server round-trip needed for checking code.
- **Feedback level gating** -- five independent boolean flags (not a single level) control what appears in results. This is more flexible than the old integer feedbackLevel approach.
- **File snapshot on submit** -- `submit()` deep-copies current files to `submittedFiles` so the user's code is preserved even if they modify files before viewing results.
- **Pack context via query param** -- `?pack=<slug>` threads through all navigation so "Back to pack" knows which pack to return to.

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/attempts` | POST | Create attempt record |
| `/api/v1/challenges/[id]/attempts` | GET | List user attempts for challenge |

### Convex Functions

| Function | Type | Purpose |
|----------|------|---------|
| `attempts.create` | mutation | Store attempt with rate limiting |
| `attempts.list` | query | List attempts for user + challenge |

## Test Coverage

### Unit Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| CHAL-10 | `apps/web/src/lib/feature-flags.spec.ts` | isFeatureEnabled returns true/false based on env var |
| CHAL-03 | `apps/web/src/lib/build-result-decorations.spec.ts` | buildDecorationInputs for pass/fail results |

### E2E Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| CHAL-01, CHAL-03 | `apps/web/e2e/challenge-flow.spec.ts` | submit reference solution and see results |
| CHAL-14 | `apps/web/e2e/challenge-flow.spec.ts` | retry returns to editor |
| CHAL-12 | `apps/web/e2e/navigation.spec.ts` | pack slug threads through challenge URL |
| CHAL-13, CHAL-14 | `apps/web/e2e/navigation.spec.ts` | results navigation shows Back to pack and Retry |
| CHAL-13 | `apps/web/e2e/navigation.spec.ts` | Back to pack returns to pack page |
| CHAL-16 | `apps/web/e2e/navigation.spec.ts` | header logo navigates to catalog |
| CHAL-03 | `apps/web/e2e/multi-file.spec.ts` | submit multi-file challenge, results show file tabs |
| CHAL-04 | `apps/web/e2e/feedback-levels.spec.ts` | all feedback off: only banner visible |
| CHAL-05 | `apps/web/e2e/feedback-levels.spec.ts` | showPassFail on: pass/fail badges visible |
| CHAL-08 | `apps/web/e2e/feedback-levels.spec.ts` | showDiff on: Diff button visible |
| CHAL-17 | `apps/web/e2e/attempt-persistence.spec.ts` | submit challenge and verify attempt persists |
| CHAL-18 | `apps/web/e2e/attempt-persistence.spec.ts` | attempt records correct pass/fail status |

### Convex Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| CHAL-17 | `convex/__tests__/attempts.spec.ts` | create stores an attempt for authenticated user |
| CHAL-18 | `convex/__tests__/attempts.spec.ts` | list returns attempts for authenticated user |

## Open Questions

- None at this time.
