# Phase 1: Design System and Shared Types

> **Status:** Complete
> **Spec ID prefix:** `DSST`
> **Phase:** 1
> **Completed:** 2026-02-20

## Overview

Defines the core type system shared across all packages and establishes the design system used by the web frontend. The `@nthtime/shared` library exports pure types for packs, challenges, assertions (as a discriminated union), verification results, attempts, and user settings. These types form the contract between the verification engine, editor store, data access layer, and Spring Boot backend.

## Dependencies

- [FOUND-01] (Nx monorepo with workspace linking)

## User Flows

### Library Consumer

1. Import types from `@nthtime/shared` in any workspace package
2. Use discriminated union narrowing on `Assertion` type to handle different assertion kinds
3. Reference `Difficulty` enum for challenge difficulty levels
4. Use `DEFAULT_FEEDBACK` constant for settings initialization

## Acceptance Criteria

### Type Definitions

- [ ] **DSST-01** -- `Pack` interface includes name, slug, description, language, framework (optional), version, author, tags, and challenges.
- [ ] **DSST-02** -- `Challenge` interface includes id, slug, title, prompt, difficulty, tags, timeEstimateSeconds, hints, assertions (AssertionSet), and referenceSolution (FileEntry[]).
- [ ] **DSST-03** -- `Assertion` is a discriminated union of 12 types: functionDeclaration, variableDeclaration, importDeclaration, exportDeclaration, methodCall, returnStatement, classDeclaration, jsxElement, pythonFunctionDef, pythonClassDef, pythonImport, sexpression.
- [ ] **DSST-04** -- `AssertionSet` has `perFile` (Record<string, Assertion[]>) and `crossFile` (Assertion[]) fields for organizing assertions by scope.
- [ ] **DSST-05** -- `VerificationResult` includes passed, fileResults, crossFileResults, totalAssertions, and passedAssertions fields.
- [ ] **DSST-06** -- `Difficulty` is an enum with Beginner, Intermediate, and Advanced values.
- [ ] **DSST-07** -- `UserSettings` includes feedback (FeedbackConfig), difficulty, keybindings, formatter, darkMode, autocomplete, promptCollapsed, and fileStubs fields.

### Design System

- [ ] **DSST-08** -- The web frontend uses shadcn/ui components with Tailwind CSS v3 and a teal/cyan design system.

### Defaults

- [ ] **DSST-09** -- `DEFAULT_FEEDBACK` provides sensible defaults for all FeedbackConfig boolean flags.

## Technical Context

### Key Files

| File | Role |
|------|------|
| `libs/shared/src/index.ts` | Re-exports all types from `./lib/types/` |
| `libs/shared/src/lib/types/pack.ts` | Pack and FileEntry interfaces |
| `libs/shared/src/lib/types/challenge.ts` | Challenge interface |
| `libs/shared/src/lib/types/assertion.ts` | Assertion discriminated union (12 variants) and AssertionSet |
| `libs/shared/src/lib/types/verification.ts` | VerificationResult, AssertionResult, SourceLocation |
| `libs/shared/src/lib/types/attempt.ts` | Attempt interface |
| `libs/shared/src/lib/types/settings.ts` | UserSettings, FeedbackConfig, Difficulty enum, formatter types |

### Patterns and Decisions

- **Discriminated union for assertions** -- Each assertion variant has a `type` field as the discriminant. This enables exhaustive `switch` narrowing in evaluators and UI components.
- **Pure types library** -- `@nthtime/shared` has zero runtime dependencies. It exports only types, interfaces, enums, and constants.
- **AssertionSet dual scope** -- `perFile` assertions are checked against individual files; `crossFile` assertions run against the combined file set. This models both file-local constraints (e.g., "this file must export X") and project-wide constraints (e.g., "some file must import Y").

## Test Coverage

### Unit Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| DSST-06 | `libs/shared/src/lib/types/types.spec.ts` | Difficulty enum has three string values |
| DSST-09 | `libs/shared/src/lib/types/types.spec.ts` | FeedbackConfig defaults has correct default values |
| DSST-03 | `libs/shared/src/lib/types/types.spec.ts` | Assertion discriminated union narrows correctly |
| DSST-04 | `libs/shared/src/lib/types/types.spec.ts` | AssertionSet shape is valid |
| DSST-01 | `libs/shared/src/lib/types/types.spec.ts` | Pack references Challenge and FileEntry |
| DSST-07 | `libs/shared/src/lib/types/types.spec.ts` | UserSettings has all required fields |

## Open Questions

- None at this time.
