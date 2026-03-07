# Editor Store (`@nthtime/editor`)

The `@nthtime/editor` library provides a framework-agnostic Zustand vanilla store for managing editor state, along with helpers for language mapping, time formatting, and draft persistence.

```
npm: @nthtime/editor
Source: libs/editor/src/
```

## Store

### createEditorStore

Creates a new Zustand vanilla store instance. The store is framework-agnostic -- React integration is done via a context bridge in `apps/web`.

```typescript
function createEditorStore(): StoreApi<EditorStore>;
```

The returned store exposes both state and actions as a single `EditorStore` type:

```typescript
type EditorStore = EditorState & EditorActions;
```

---

## State

### EditorState

```typescript
interface EditorState {
  challengeId: string | null;
  files: Record<string, EditorFile>;
  activeFilePath: string | null;
  tabOrder: string[];
  runState: RunState;
  verificationResult: VerificationResult | null;
  hintsRevealed: number;
  totalHints: number;
  hints: string[];
  timer: TimerState;
  challengeMetadata: ChallengeMetadata | null;
  viewMode: ViewMode;
  submittedFiles: Record<string, EditorFile> | null;
  scaffoldFiles: Record<string, EditorFile> | null;
}
```

| Field | Description |
|---|---|
| `challengeId` | ID of the currently loaded challenge, or `null` if none loaded. |
| `files` | All files in the editor, keyed by path. |
| `activeFilePath` | Path of the file shown in the primary editor pane. |
| `tabOrder` | Ordered list of open tab paths. |
| `runState` | Current verification execution state. |
| `verificationResult` | Result from the last verification run, or `null`. |
| `hintsRevealed` | Number of hints the user has revealed so far. |
| `totalHints` | Total number of hints available for the current challenge. |
| `hints` | Array of hint strings for the current challenge. |
| `timer` | Timer tracking state. |
| `challengeMetadata` | Metadata about the current challenge (title, prompt, difficulty, etc.). |
| `viewMode` | Whether the user is editing or viewing results. |
| `submittedFiles` | Snapshot of files at the time of submission. |
| `scaffoldFiles` | Original scaffold files for dirty-checking. |

---

## Helper Types

### EditorFile

```typescript
interface EditorFile {
  readonly path: string;
  content: string;
}
```

### RunState

```typescript
type RunState = 'idle' | 'running' | 'complete';
```

### ViewMode

```typescript
type ViewMode = 'editing' | 'results';
```

### TimerState

```typescript
interface TimerState {
  startedAt: number | null;
  elapsedSeconds: number;
}
```

- `startedAt` -- epoch timestamp (from `Date.now()`) when the timer was started, or `null` if stopped.
- `elapsedSeconds` -- computed elapsed time in whole seconds.

### ChallengeMetadata

```typescript
interface ChallengeMetadata {
  readonly title: string;
  readonly prompt: string;
  readonly difficulty: Difficulty;
  readonly tags: readonly string[];
  readonly timeEstimateSeconds: number;
}
```

---

## Actions

### EditorActions

```typescript
interface EditorActions {
  initFromChallenge(challenge: {
    files: readonly { path: string; content: string }[];
    hints: readonly string[];
    title: string;
    prompt: string;
    difficulty: Difficulty;
    tags: readonly string[];
    timeEstimateSeconds: number;
    scaffolded?: boolean;
  }, challengeId?: string): void;

  setFileContent(path: string, content: string): void;
  setActiveFile(path: string): void;
  createFile(path: string, content?: string): void;
  renameFile(oldPath: string, newPath: string): void;
  deleteFile(path: string): void;

  openTab(path: string): void;
  closeTab(path: string): void;
  reorderTabs(fromIndex: number, toIndex: number): void;

  setRunState(state: RunState): void;
  setVerificationResult(result: VerificationResult | null): void;
  revealNextHint(): void;

  startTimer(): void;
  tickTimer(): void;
  stopTimer(): void;

  submit(): void;
  retry(): void;
  reset(): void;

  getAllFileEntries(): { path: string; content: string }[];
  saveDraft(): void;
  loadDraft(challengeId: string): boolean;
  clearDraft(): void;
  isDirty(path: string): boolean;
}
```

### Action Details

#### Challenge Lifecycle

| Action | Description |
|---|---|
| `initFromChallenge(challenge, challengeId?)` | Initializes the store with a challenge's files, hints, and metadata. Automatically restores a saved draft if one exists for the given `challengeId`. Resets all state (timer, verification, view mode) to initial values. |
| `submit()` | Snapshots current files into `submittedFiles`, stops the timer (recording final elapsed time), and switches `viewMode` to `'results'`. |
| `retry()` | Restores `submittedFiles` back into the editor, resets `runState` to `'idle'`, clears `verificationResult`, and switches `viewMode` to `'editing'`. |
| `reset()` | Resets the entire store to initial state (all fields to defaults). |

#### File Management

| Action | Description |
|---|---|
| `setFileContent(path, content)` | Updates the content of an existing file. |
| `createFile(path, content?)` | Creates a new file. No-op if a file at the path already exists. Sets the new file as active and appends it to tab order. |
| `renameFile(oldPath, newPath)` | Renames a file, updating active file path, tab order, and scaffold files if applicable. No-op if source is missing or target exists. |
| `deleteFile(path)` | Removes a file. Selects an adjacent tab if the deleted file was active. |

#### Tab Management

| Action | Description |
|---|---|
| `setActiveFile(path)` | Sets the active file path without modifying tab order. |
| `openTab(path)` | Sets a file as active and adds it to the tab bar if not already present. |
| `closeTab(path)` | Removes a tab from the tab bar. Selects an adjacent tab if the closed tab was active. |
| `reorderTabs(fromIndex, toIndex)` | Moves a tab from one position to another. |

#### Verification

| Action | Description |
|---|---|
| `setRunState(state)` | Sets the verification run state (`'idle'`, `'running'`, or `'complete'`). |
| `setVerificationResult(result)` | Stores the verification result (or `null` to clear). |
| `revealNextHint()` | Increments `hintsRevealed` by one, capped at `totalHints`. |

#### Timer

| Action | Description |
|---|---|
| `startTimer()` | Records `Date.now()` as the start time. No-op if already started. |
| `tickTimer()` | Recomputes `elapsedSeconds` from the start time. No-op if the timer has not started. |
| `stopTimer()` | Sets `startedAt` to `null`, freezing `elapsedSeconds` at its current value. |

#### Drafts and Dirty State

| Action | Description |
|---|---|
| `saveDraft()` | Persists current files and `hintsRevealed` to localStorage. No-op if `challengeId` is null. |
| `loadDraft(challengeId)` | Loads a draft from localStorage into the store. Returns `true` if a draft was found and applied. |
| `clearDraft()` | Removes the draft for the current `challengeId` from localStorage. |
| `isDirty(path)` | Returns `true` if the file at `path` differs from its scaffold version. Returns `false` if scaffoldFiles is null or the file does not exist in both maps. |
| `getAllFileEntries()` | Returns all files as an array of `{ path, content }` objects. |

---

## Utilities

### getMonacoLanguage

Maps a file path's extension to a Monaco editor language identifier.

```typescript
function getMonacoLanguage(filePath: string): string;
```

Returns `'plaintext'` for unrecognized extensions.

**Supported mappings:**

| Extension | Monaco Language |
|---|---|
| `.js`, `.jsx` | `javascript` |
| `.ts`, `.tsx` | `typescript` |
| `.py` | `python` |
| `.html` | `html` |
| `.css` | `css` |
| `.json` | `json` |
| `.md` | `markdown` |
| `.yaml`, `.yml` | `yaml` |
| `.toml` | `toml` |
| `.sh`, `.bash` | `shell` |
| `.txt` | `plaintext` |

### formatTime

Formats a duration in seconds to a human-readable time string.

```typescript
function formatTime(totalSeconds: number): string;
```

- Returns `"mm:ss"` for durations under one hour (e.g., `"05:30"`).
- Returns `"hh:mm:ss"` for durations of one hour or more (e.g., `"01:05:30"`).
- Minutes and seconds are always zero-padded to two digits.

---

## Draft Storage

The draft storage API persists editor state to `localStorage` using the key pattern `nthtime:draft:{challengeId}`.

### DraftData

```typescript
interface DraftData {
  files: Record<string, { path: string; content: string }>;
  hintsRevealed: number;
  timestamp: number;
}
```

### Functions

```typescript
function getDraftKey(challengeId: string): string;
function saveDraft(challengeId: string, data: DraftData): void;
function loadDraft(challengeId: string): DraftData | null;
function clearDraft(challengeId: string): void;
function clearAllDrafts(): void;
```

| Function | Description |
|---|---|
| `getDraftKey(challengeId)` | Returns the localStorage key: `"nthtime:draft:{challengeId}"`. |
| `saveDraft(challengeId, data)` | Serializes `DraftData` to JSON and writes to localStorage. Silently ignores errors (e.g., storage full). |
| `loadDraft(challengeId)` | Reads and parses draft data. Returns `null` if not found or corrupt. Removes corrupt entries automatically. |
| `clearDraft(challengeId)` | Removes a single draft entry from localStorage. |
| `clearAllDrafts()` | Removes all entries with the `nthtime:draft:` prefix from localStorage. |
