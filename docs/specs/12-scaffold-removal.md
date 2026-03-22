# Phase 12: Scaffold Removal

> **Status:** Complete
> **Spec ID prefix:** `SCAF`
> **Phase:** 12
> **Completed:** 2026-02-28

## Overview

This refactoring phase removed the scaffold/starter template feature and replaced it with a simpler `fileStubs` setting. Previously, challenges could define a separate scaffold (starter code) distinct from the reference solution. This added complexity to the data model, editor initialization, and authoring workflow without providing sufficient value -- most challenges either had identical scaffolds (just empty files) or no scaffold at all. The replacement is a boolean `fileStubs` setting: when enabled (default), the editor creates empty files at expected paths; when disabled, the editor starts with a blank canvas.

## Dependencies

- [EDIT-02] (EditorStore initFromChallenge with fileStubs parameter)
- [DSST-07] (UserSettings with fileStubs field)
- [AUTH-07] (Spring Boot UserSettings JPA entity with fileStubs column)
- [CLI-07], [CLI-08] (CLI scaffolding respects fileStubs)

## User Flows

### Starting a Challenge with File Stubs (Default)

1. User opens a challenge
2. EditorStore calls `initFromChallenge(challenge, challengeId, true)`
3. Empty files are created at all expected file paths from the challenge's `expectedFiles`
4. File tree shows the expected structure
5. User writes code in the pre-created files

### Starting a Challenge without File Stubs

1. User disables fileStubs in settings
2. User opens a challenge
3. EditorStore calls `initFromChallenge(challenge, challengeId, false)`
4. No files are created -- editor starts blank
5. User creates files manually as needed

## Acceptance Criteria

### File Stubs Setting

- [ ] **SCAF-01** -- `UserSettings.fileStubs` is a boolean field that defaults to true.
- [ ] **SCAF-02** -- When fileStubs is true, `initFromChallenge()` creates empty files at expected paths from the challenge data.
- [ ] **SCAF-03** -- When fileStubs is false, `initFromChallenge()` creates no files (blank canvas).
- [ ] **SCAF-04** -- The fileStubs setting persists in both localStorage and Spring Boot user_settings table.

### Scaffold Removal

- [ ] **SCAF-05** -- Challenge JSON no longer contains a `scaffold` or `starterTemplate` field. The `files` field is the reference solution.
- [ ] **SCAF-06** -- The Spring Boot Challenge JPA entity uses `referenceSolution` for reference solutions with no scaffold-related columns.
- [ ] **SCAF-07** -- The author challenge editor has no "Scaffold" tab -- only Metadata, Solution, Assertions, and Validate.

### CLI Compatibility

- [ ] **SCAF-08** -- CLI `initChallengeFiles()` respects the fileStubs configuration, creating empty stubs (true) or an empty directory (false).

## Technical Context

### Key Files

| File | Role |
|------|------|
| `libs/shared/src/lib/types/settings.ts` | UserSettings with fileStubs boolean |
| `libs/editor/src/lib/editor-store.ts` | initFromChallenge with fileStubs parameter |
| `services/api/src/main/java/.../entity/Challenge.java` | Challenge entity with referenceSolution (no scaffold) |
| `apps/web/src/components/author/challenge-editor.tsx` | 4-tab editor (no Scaffold tab) |
| `apps/cli/src/scaffold.ts` | initChallengeFiles with fileStubs parameter |

### Patterns and Decisions

- **Simplification over flexibility** -- the scaffold feature added data model complexity (separate scaffold field, scaffold tab in editor, scaffold/solution distinction in the author UI) for a use case that was almost always "empty files at expected paths." The fileStubs boolean captures the same intent with zero per-challenge configuration.
- **expectedFiles derived from assertions** -- the set of expected file paths is derived from the assertion set's `perFile` keys, not stored separately. This eliminates the need for a scaffold to declare which files exist.
- **No migration needed** -- challenge JSON never had a widely-used scaffold field. The `files` field has always been the reference solution. The only change is removing UI and code paths that referenced scaffold.

## Test Coverage

### Unit Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| SCAF-02 | `libs/editor/src/lib/editor-store.spec.ts` | initializes from a challenge with file stubs |
| SCAF-03 | `libs/editor/src/lib/editor-store.spec.ts` | starts with empty files when fileStubs=false |
| SCAF-01 | `libs/editor/src/lib/editor-store.spec.ts` | defaults to fileStubs=true when not specified |
| SCAF-08 | `apps/cli/src/__tests__/scaffold.spec.ts` | creates empty stubs when fileStubs true; empty dir when false |

## Open Questions

- None at this time.
