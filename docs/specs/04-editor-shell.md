# Phase 4: Editor Shell

> **Status:** Complete
> **Spec ID prefix:** `EDIT`
> **Phase:** 4
> **Completed:** 2026-02-20

## Overview

The editor shell provides the interactive coding environment where users solve challenges. Built on a Zustand vanilla store (`@nthtime/editor`), it manages file state, tab order, split panes, run state, and view mode transitions. The web frontend wraps the store in React context and renders a 3-panel CSS Grid layout (prompt | editor | output) with a lazy-loaded Monaco editor. The store is framework-agnostic -- the CLI reuses the same verification logic without the Monaco UI.

## Dependencies

- [DSST-02] (Challenge type with referenceSolution)
- [DSST-05] (VerificationResult)
- [DSST-07] (UserSettings for fileStubs)
- [VRFY-06] (WASM grammar loading for browser verification)

## User Flows

### Opening a Challenge

1. User navigates to a challenge page
2. EditorStore initializes from the challenge data via `initFromChallenge()`
3. If fileStubs is enabled (default), empty files are created at expected paths
4. If a draft exists in localStorage, it is restored instead
5. Reference solution files are stored for later diff comparison
6. Monaco editor renders the active file with appropriate language highlighting

### Editing Code

1. User types in the Monaco editor
2. `setFileContent()` updates the file in the store
3. Draft auto-saves via debounced localStorage persistence
4. User can create, rename, or delete files via the file tree
5. User can open multiple tabs and reorder them
6. User can toggle split pane to view two files side-by-side

### Multi-File Navigation

1. File tree panel lists all files in the challenge
2. Clicking a file switches the active tab
3. Tab bar shows open files with close buttons
4. Tabs can be reordered by drag
5. Split pane mode shows two editors side-by-side

## Acceptance Criteria

### Store Initialization

- [ ] **EDIT-01** -- `createEditorStore()` returns a Zustand vanilla store with initial state (no files, null activeFilePath, idle runState).
- [ ] **EDIT-02** -- `initFromChallenge()` populates files from challenge data. When fileStubs is true (default), empty files are created at expected paths. When false, no files are created.
- [ ] **EDIT-03** -- `initFromChallenge()` stores the reference solution files for later diff/solution view.

### File Operations

- [ ] **EDIT-04** -- `createFile()` adds a new file, opens a tab, and activates it. Duplicate paths are no-ops.
- [ ] **EDIT-05** -- `renameFile()` updates the file path in files, tabOrder, and activeFilePath. Renaming to an existing path is a no-op.
- [ ] **EDIT-06** -- `deleteFile()` removes the file and tab, selecting an adjacent file. Deleting the second pane file resets split mode.
- [ ] **EDIT-07** -- `setFileContent()` updates the content of an existing file.
- [ ] **EDIT-08** -- `getAllFileEntries()` returns all files as a FileEntry array.

### Tab Management

- [ ] **EDIT-09** -- `openTab()` adds a path to tabOrder and activates it without duplicating existing tabs.
- [ ] **EDIT-10** -- `closeTab()` removes from tabOrder and selects an adjacent tab. Closing the last tab sets activeFilePath to null.
- [ ] **EDIT-11** -- `reorderTabs()` swaps tab positions by index.

### Split Pane

- [ ] **EDIT-12** -- `toggleSplit()` enters horizontal mode with a second file and toggles back to single mode.
- [ ] **EDIT-13** -- `setSecondActiveFile()` changes the file in the second pane.
- [ ] **EDIT-14** -- `closeSplit()` returns to single mode.

### View Mode and Submit/Retry

- [ ] **EDIT-15** -- `submit()` snapshots current files to submittedFiles and switches viewMode to 'results'.
- [ ] **EDIT-16** -- `retry()` restores submitted files as current files and switches viewMode back to 'editing'.
- [ ] **EDIT-17** -- `setResultsCodeView()` switches between 'submitted', 'solution', and 'diff' views. `submit()` resets it to 'submitted'.

### Layout

- [ ] **EDIT-18** -- The challenge page renders a 3-panel layout: prompt panel (left), editor panel (center), and output/results panel (right).
- [ ] **EDIT-19** -- Multi-file challenges show a file tree for navigation and tab bar for open files.

### Language Mapping

- [ ] **EDIT-20** -- `getMonacoLanguage()` maps file extensions to Monaco language IDs (js->javascript, ts->typescript, py->python, html->html, css->css, json->json) with plaintext fallback.

## Technical Context

### Key Files

| File | Role |
|------|------|
| `libs/editor/src/index.ts` | Public API: createEditorStore, types, draft storage, language mapping |
| `libs/editor/src/lib/editor-store.ts` | Zustand vanilla store factory with all state and actions |
| `libs/editor/src/lib/draft-storage.ts` | localStorage draft persistence (save/load/clear) |
| `libs/editor/src/lib/language.ts` | File extension to Monaco language mapping |
| `apps/web/src/components/challenge/challenge-view.tsx` | Main challenge component orchestrating editor + results |
| `apps/web/src/components/challenge/dockable-layout.tsx` | 3-panel CSS Grid layout |
| `apps/web/src/components/challenge/monaco-wrapper.tsx` | Monaco editor wrapper with theme and keybindings |
| `apps/web/src/components/challenge/file-tree.tsx` | File list for multi-file challenges |
| `apps/web/src/components/challenge/tab-bar.tsx` | Editor tabs with close and reorder |
| `apps/web/src/components/challenge/split-resize-handle.tsx` | Draggable split separator |

### Patterns and Decisions

- **Zustand vanilla store** -- `createStore()` instead of `create()` keeps the store framework-agnostic. A React context bridge provides hooks.
- **Monaco lazy loading** -- `next/dynamic` with `ssr: false` avoids server-side rendering of the editor.
- **Monaco not hoisted** -- `monaco-editor` is excluded from pnpm hoisting. Types must come from `@monaco-editor/react` (`OnMount`, `EditorProps`), never from `monaco-editor` directly.
- **monaco-emacs shim** -- `monaco-emacs` calls `require('monaco-editor')` which resolves to the AMD bundle. `next.config.js` aliases `monaco-editor$` to a shim that re-exports `window.monaco`.
- **FileStubs default** -- `initFromChallenge()` defaults fileStubs to true, creating empty files at expected paths. When false, the editor starts blank.

## Test Coverage

### Unit Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| EDIT-01 | `libs/editor/src/lib/editor-store.spec.ts` | starts with initial state |
| EDIT-02 | `libs/editor/src/lib/editor-store.spec.ts` | initializes from a challenge with file stubs; starts with empty files when fileStubs=false |
| EDIT-03 | `libs/editor/src/lib/editor-store.spec.ts` | stores reference solution files on init |
| EDIT-04 | `libs/editor/src/lib/editor-store.spec.ts` | creates a new file and activates it; no-ops on duplicate |
| EDIT-05 | `libs/editor/src/lib/editor-store.spec.ts` | renames a file and updates activeFilePath |
| EDIT-06 | `libs/editor/src/lib/editor-store.spec.ts` | deletes a file and selects adjacent; deleteFile on second pane resets split |
| EDIT-07 | `libs/editor/src/lib/editor-store.spec.ts` | sets file content |
| EDIT-08 | `libs/editor/src/lib/editor-store.spec.ts` | returns all file entries |
| EDIT-09 | `libs/editor/src/lib/editor-store.spec.ts` | openTab adds path and activates; activates without duplicating |
| EDIT-10 | `libs/editor/src/lib/editor-store.spec.ts` | closeTab removes and selects adjacent; on last tab sets null |
| EDIT-11 | `libs/editor/src/lib/editor-store.spec.ts` | reorderTabs swaps positions |
| EDIT-12 | `libs/editor/src/lib/editor-store.spec.ts` | toggleSplit enters horizontal mode; toggles back |
| EDIT-13 | `libs/editor/src/lib/editor-store.spec.ts` | setSecondActiveFile changes second pane |
| EDIT-14 | `libs/editor/src/lib/editor-store.spec.ts` | closeSplit returns to single mode |
| EDIT-15 | `libs/editor/src/lib/editor-store.spec.ts` | submit snapshots files and switches to results |
| EDIT-16 | `libs/editor/src/lib/editor-store.spec.ts` | retry restores submitted files; full submit-retry cycle |
| EDIT-17 | `libs/editor/src/lib/editor-store.spec.ts` | setResultsCodeView changes view; submit resets to submitted |
| EDIT-20 | `libs/editor/src/lib/language.spec.ts` | maps JS, TS, Python, HTML, CSS, JSON; plaintext fallback |

### E2E Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| EDIT-18 | `apps/web/e2e/challenge-flow.spec.ts` | renders 3-panel layout with prompt and editor |
| EDIT-04, EDIT-19 | `apps/web/e2e/multi-file.spec.ts` | create new file via file tree |
| EDIT-19 | `apps/web/e2e/multi-file.spec.ts` | switch between files using file tree |

## Open Questions

- None at this time.
