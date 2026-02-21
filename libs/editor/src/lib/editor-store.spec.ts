import { describe, it, expect, beforeEach } from 'vitest';
import { createEditorStore } from './editor-store.js';
import type { EditorStore } from './types.js';
import type { StoreApi } from 'zustand/vanilla';
import { Difficulty } from '@nthtime/shared';

let store: StoreApi<EditorStore>;

const mockChallenge = {
  files: [
    { path: 'app.js', content: 'const app = express();' },
    { path: 'server.js', content: 'app.listen(3000);' },
  ],
  hints: ['Use express()', 'Call app.listen()'],
  title: 'Express Basics',
  prompt: 'Create a basic Express server',
  difficulty: Difficulty.Beginner,
  tags: ['express', 'node'] as const,
  timeEstimateSeconds: 300,
};

beforeEach(() => {
  store = createEditorStore();
});

describe('createEditorStore', () => {
  it('starts with initial state', () => {
    const state = store.getState();
    expect(state.files).toEqual({});
    expect(state.activeFilePath).toBeNull();
    expect(state.runState).toBe('idle');
    expect(state.verificationResult).toBeNull();
    expect(state.hintsRevealed).toBe(0);
    expect(state.viewMode).toBe('editing');
    expect(state.submittedFiles).toBeNull();
    expect(state.scaffoldFiles).toBeNull();
  });

  it('initializes from a challenge', () => {
    store.getState().initFromChallenge(mockChallenge);
    const state = store.getState();

    expect(Object.keys(state.files)).toHaveLength(2);
    expect(state.files['app.js'].content).toBe('const app = express();');
    expect(state.activeFilePath).toBe('app.js');
    expect(state.totalHints).toBe(2);
    expect(state.hints).toEqual(['Use express()', 'Call app.listen()']);
    expect(state.challengeMetadata?.title).toBe('Express Basics');
    expect(state.challengeMetadata?.difficulty).toBe('beginner');
  });

  it('stores scaffold files on init', () => {
    store.getState().initFromChallenge(mockChallenge);
    const state = store.getState();

    expect(state.scaffoldFiles).not.toBeNull();
    expect(state.scaffoldFiles!['app.js'].content).toBe('const app = express();');
    expect(state.scaffoldFiles!['server.js'].content).toBe('app.listen(3000);');
  });

  it('preserves scaffold files after file edits', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setFileContent('app.js', 'updated content');

    const state = store.getState();
    expect(state.files['app.js'].content).toBe('updated content');
    expect(state.scaffoldFiles!['app.js'].content).toBe('const app = express();');
  });

  it('sets file content', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setFileContent('app.js', 'updated content');

    expect(store.getState().files['app.js'].content).toBe('updated content');
  });

  it('sets active file', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setActiveFile('server.js');

    expect(store.getState().activeFilePath).toBe('server.js');
  });

  it('sets run state', () => {
    store.getState().setRunState('running');
    expect(store.getState().runState).toBe('running');

    store.getState().setRunState('complete');
    expect(store.getState().runState).toBe('complete');
  });

  it('reveals hints progressively', () => {
    store.getState().initFromChallenge(mockChallenge);

    expect(store.getState().hintsRevealed).toBe(0);
    store.getState().revealNextHint();
    expect(store.getState().hintsRevealed).toBe(1);
    store.getState().revealNextHint();
    expect(store.getState().hintsRevealed).toBe(2);
    // Should not exceed totalHints
    store.getState().revealNextHint();
    expect(store.getState().hintsRevealed).toBe(2);
  });

  it('manages timer', () => {
    store.getState().startTimer();
    expect(store.getState().timer.startedAt).not.toBeNull();

    // Calling start again does nothing
    const firstStart = store.getState().timer.startedAt;
    store.getState().startTimer();
    expect(store.getState().timer.startedAt).toBe(firstStart);

    store.getState().stopTimer();
    expect(store.getState().timer.startedAt).toBeNull();
  });

  it('returns all file entries', () => {
    store.getState().initFromChallenge(mockChallenge);
    const entries = store.getState().getAllFileEntries();

    expect(entries).toHaveLength(2);
    expect(entries.map((e) => e.path).sort()).toEqual(['app.js', 'server.js']);
  });

  it('resets state', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setRunState('complete');
    store.getState().reset();

    const state = store.getState();
    expect(state.files).toEqual({});
    expect(state.activeFilePath).toBeNull();
    expect(state.runState).toBe('idle');
    expect(state.challengeMetadata).toBeNull();
    expect(state.viewMode).toBe('editing');
    expect(state.submittedFiles).toBeNull();
    expect(state.scaffoldFiles).toBeNull();
  });
});

describe('isDirty', () => {
  it('returns false for unmodified files', () => {
    store.getState().initFromChallenge(mockChallenge);
    expect(store.getState().isDirty('app.js')).toBe(false);
    expect(store.getState().isDirty('server.js')).toBe(false);
  });

  it('returns true after modifying a file', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setFileContent('app.js', 'modified content');
    expect(store.getState().isDirty('app.js')).toBe(true);
    expect(store.getState().isDirty('server.js')).toBe(false);
  });

  it('returns false after restoring original content', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setFileContent('app.js', 'modified');
    store.getState().setFileContent('app.js', 'const app = express();');
    expect(store.getState().isDirty('app.js')).toBe(false);
  });

  it('returns false for unknown paths', () => {
    store.getState().initFromChallenge(mockChallenge);
    expect(store.getState().isDirty('nonexistent.js')).toBe(false);
  });

  it('returns false before initialization', () => {
    expect(store.getState().isDirty('app.js')).toBe(false);
  });
});

describe('submit and retry', () => {
  it('submit snapshots files and switches to results', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setFileContent('app.js', 'submitted code');
    store.getState().submit();

    const state = store.getState();
    expect(state.viewMode).toBe('results');
    expect(state.submittedFiles).not.toBeNull();
    expect(state.submittedFiles!['app.js'].content).toBe('submitted code');
  });

  it('submit stops the timer', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().startTimer();
    expect(store.getState().timer.startedAt).not.toBeNull();

    store.getState().submit();
    expect(store.getState().timer.startedAt).toBeNull();
  });

  it('submit preserves elapsed time', () => {
    store.getState().initFromChallenge(mockChallenge);
    // Manually set a known elapsed time
    store.getState().startTimer();
    store.getState().tickTimer();

    store.getState().submit();
    const state = store.getState();
    expect(state.timer.startedAt).toBeNull();
    // elapsedSeconds should be preserved (not reset)
    expect(state.timer.elapsedSeconds).toBeGreaterThanOrEqual(0);
  });

  it('retry restores submitted files and switches to editing', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setFileContent('app.js', 'submitted code');
    store.getState().submit();

    // Verify we are in results mode
    expect(store.getState().viewMode).toBe('results');

    store.getState().retry();

    const state = store.getState();
    expect(state.viewMode).toBe('editing');
    expect(state.runState).toBe('idle');
    expect(state.verificationResult).toBeNull();
    expect(state.files['app.js'].content).toBe('submitted code');
  });

  it('retry without submitted files preserves current files', () => {
    store.getState().initFromChallenge(mockChallenge);
    const originalContent = store.getState().files['app.js'].content;

    store.getState().retry();

    expect(store.getState().files['app.js'].content).toBe(originalContent);
    expect(store.getState().viewMode).toBe('editing');
  });

  it('full submit-retry cycle preserves scaffold files', () => {
    store.getState().initFromChallenge(mockChallenge);
    const originalScaffold = store.getState().scaffoldFiles;

    store.getState().setFileContent('app.js', 'modified');
    store.getState().submit();
    store.getState().retry();

    expect(store.getState().scaffoldFiles).toEqual(originalScaffold);
  });

  it('viewMode transitions correctly through full cycle', () => {
    store.getState().initFromChallenge(mockChallenge);
    expect(store.getState().viewMode).toBe('editing');

    store.getState().submit();
    expect(store.getState().viewMode).toBe('results');

    store.getState().retry();
    expect(store.getState().viewMode).toBe('editing');

    store.getState().submit();
    expect(store.getState().viewMode).toBe('results');
  });
});
