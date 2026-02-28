# Phase 6: Drafts, Settings, and Timer

> **Status:** Complete
> **Spec ID prefix:** `DRFT`
> **Phase:** 6
> **Completed:** 2026-02-20

## Overview

This phase adds persistence and personalization to the editor experience. Draft storage automatically saves in-progress work to localStorage so users can navigate away and return without losing code. The settings system provides a dialog for configuring feedback levels, keybindings (default/vim/emacs), autocomplete, and formatter preferences, with local persistence and optional Convex sync for authenticated users. The timer tracks elapsed time from first keystroke, displayed in the status bar.

## Dependencies

- [EDIT-01] (EditorStore)
- [EDIT-07] (setFileContent for triggering draft saves)
- [AUTH-07] (userSettings Convex table)
- [AUTH-12] (SettingsRepository interface)
- [DSST-07] (UserSettings type, FeedbackConfig, EditorKeybindings)

## User Flows

### Draft Auto-Save

1. User opens a challenge and starts typing
2. After 500ms of inactivity, the current file state is saved to localStorage
3. User navigates away (to another challenge, pack, or page)
4. User returns to the same challenge
5. EditorStore detects a saved draft and restores file contents and hint count

### Settings Configuration

1. User opens the settings dialog
2. User toggles feedback checkboxes (pass/fail badges, hints, assertion details, diff, solution)
3. User selects keybinding mode (default, vim, or emacs)
4. User configures formatter preferences (tab size, use tabs, trigger)
5. Settings persist to localStorage immediately
6. If authenticated, settings sync to Convex with debounced writes

### Timer

1. User opens a challenge -- timer is at 0:00
2. User makes their first edit -- timer starts
3. Timer increments every second while editing
4. Timer value is displayed in the status bar
5. On submit, the elapsed time is included in the attempt record

## Acceptance Criteria

### Draft Storage

- [ ] **DRFT-01** -- Drafts are saved to localStorage with key pattern `nthtime:draft:{challengeId}` containing file contents and hints revealed.
- [ ] **DRFT-02** -- When opening a challenge with an existing draft, the editor restores the draft's file contents instead of the default file stubs.
- [ ] **DRFT-03** -- `clearDraft()` removes the draft for a specific challenge. `clearAllDrafts()` removes all nthtime draft entries.
- [ ] **DRFT-04** -- Corrupt or malformed draft JSON is handled gracefully (returns null, does not crash).

### Settings

- [ ] **DRFT-05** -- Settings dialog allows toggling individual feedback flags: showPassFail, showHints, showAssertionDetails, showDiff, showSolution.
- [ ] **DRFT-06** -- Settings dialog allows selecting keybinding mode (default, vim, emacs) and toggling autocomplete.
- [ ] **DRFT-07** -- Settings persist to localStorage and are restored on page load.
- [ ] **DRFT-08** -- Settings store starts with DEFAULT_FEEDBACK defaults when no saved settings exist.
- [ ] **DRFT-09** -- `setFeedback()` merges partial feedback updates (does not overwrite unset flags).
- [ ] **DRFT-10** -- When authenticated, `useSettingsSync` fetches settings from Convex and merges them with local state. Saves are debounced at 1000ms.
- [ ] **DRFT-11** -- Legacy `feedbackLevel` from localStorage is migrated to the new FeedbackConfig format on first load.

### Timer

- [ ] **DRFT-12** -- Timer starts at 0:00 and begins counting when the user makes their first edit.
- [ ] **DRFT-13** -- Elapsed time (in seconds) is included when creating an attempt record.

## Technical Context

### Key Files

| File | Role |
|------|------|
| `libs/editor/src/lib/draft-storage.ts` | saveDraft, loadDraft, clearDraft, clearAllDrafts |
| `libs/editor/src/lib/editor-store.ts` | Draft integration in initFromChallenge, saveDraft, loadDraft actions |
| `apps/web/src/lib/settings-store.ts` | Singleton Zustand vanilla store for user settings |
| `apps/web/src/hooks/use-settings-query.ts` | useSettingsSync hook for Convex sync |
| `apps/web/src/components/challenge/challenge-view.tsx` | Debounced draft save subscription (500ms) |
| `apps/web/src/components/challenge/status-bar.tsx` | Timer display and run state |

### Patterns and Decisions

- **localStorage for drafts** -- chosen for simplicity and offline support. Drafts are per-challenge, keyed by Convex challenge ID. No server sync for drafts.
- **Singleton settings store** -- a single Zustand vanilla store instance manages all settings. It hydrates from localStorage on creation and syncs to Convex when authenticated.
- **Debounced persistence** -- draft saves are debounced at 500ms (triggered by file content changes); settings saves to Convex are debounced at 1000ms.
- **Migration path** -- the old `feedbackLevel` (integer 0-4) in localStorage is automatically migrated to the new `FeedbackConfig` (individual boolean flags) on first load.

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/settings` | GET | Read user settings from Convex |
| `/api/v1/settings` | PATCH | Update user settings in Convex |

## Test Coverage

### Unit Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| DRFT-01 | `libs/editor/src/lib/draft-storage.spec.ts` | generates deterministic keys; saves and loads a draft |
| DRFT-02 | `libs/editor/src/lib/draft-storage.spec.ts` | isolates drafts by challenge ID |
| DRFT-03 | `libs/editor/src/lib/draft-storage.spec.ts` | clears a single draft; clears all drafts |
| DRFT-04 | `libs/editor/src/lib/draft-storage.spec.ts` | handles corrupt JSON gracefully; handles malformed draft objects |
| DRFT-08 | `apps/web/src/lib/settings-store.spec.ts` | starts with default settings; hydrate from empty localStorage |
| DRFT-05 | `apps/web/src/lib/settings-store.spec.ts` | setFeedback updates individual flags and persists |
| DRFT-09 | `apps/web/src/lib/settings-store.spec.ts` | setFeedback merges multiple flags |
| DRFT-06 | `apps/web/src/lib/settings-store.spec.ts` | setKeybindings, setAutocomplete updates and persists |
| DRFT-07 | `apps/web/src/lib/settings-store.spec.ts` | round-trip: mutate -> hydrate fresh store -> state matches |
| DRFT-10 | `apps/web/src/lib/settings-store.spec.ts` | syncFromServer overrides local state; preserves unincluded settings |
| DRFT-11 | `apps/web/src/lib/settings-store.spec.ts` | migrates old feedbackLevel from localStorage |

### E2E Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| DRFT-01, DRFT-02 | `apps/web/e2e/drafts.spec.ts` | typed content is restored after navigating away and back |
| DRFT-05, DRFT-06 | `apps/web/e2e/settings.spec.ts` | can open settings dialog and toggle feedback checkboxes |
| DRFT-07 | `apps/web/e2e/settings.spec.ts` | keybindings selection persists |

### Convex Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| DRFT-08 | `convex/__tests__/settings.spec.ts` | get returns defaults for new user |
| DRFT-10 | `convex/__tests__/settings.spec.ts` | update creates/patches settings |

## Open Questions

- None at this time.
