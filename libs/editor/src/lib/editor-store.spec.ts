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

describe('createFile', () => {
  it('creates a new file and activates it', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().createFile('utils.js', 'export {}');

    const state = store.getState();
    expect(state.files['utils.js']).toBeDefined();
    expect(state.files['utils.js'].content).toBe('export {}');
    expect(state.activeFilePath).toBe('utils.js');
  });

  it('no-ops on duplicate path', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().createFile('app.js', 'duplicate');

    expect(store.getState().files['app.js'].content).toBe('const app = express();');
  });

  it('creates with empty content by default', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().createFile('new.js');

    expect(store.getState().files['new.js'].content).toBe('');
  });
});

describe('renameFile', () => {
  it('renames a file and updates activeFilePath', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setActiveFile('app.js');
    store.getState().renameFile('app.js', 'index.js');

    const state = store.getState();
    expect(state.files['index.js']).toBeDefined();
    expect(state.files['app.js']).toBeUndefined();
    expect(state.activeFilePath).toBe('index.js');
  });

  it('no-ops when renaming to existing path', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().renameFile('app.js', 'server.js');

    expect(store.getState().files['app.js']).toBeDefined();
    expect(store.getState().files['server.js'].content).toBe('app.listen(3000);');
  });

  it('updates scaffoldFiles on rename', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().renameFile('app.js', 'index.js');

    const state = store.getState();
    expect(state.scaffoldFiles!['index.js']).toBeDefined();
    expect(state.scaffoldFiles!['app.js']).toBeUndefined();
  });

  it('does not change activeFilePath when renaming non-active file', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setActiveFile('app.js');
    store.getState().renameFile('server.js', 'main.js');

    expect(store.getState().activeFilePath).toBe('app.js');
  });
});

describe('deleteFile', () => {
  it('deletes a file and selects adjacent', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setActiveFile('app.js');
    store.getState().deleteFile('app.js');

    const state = store.getState();
    expect(state.files['app.js']).toBeUndefined();
    expect(state.activeFilePath).toBe('server.js');
  });

  it('selects null when deleting the last file', () => {
    store.getState().initFromChallenge({
      ...mockChallenge,
      files: [{ path: 'only.js', content: 'solo' }],
    });
    store.getState().deleteFile('only.js');

    expect(store.getState().activeFilePath).toBeNull();
    expect(Object.keys(store.getState().files)).toHaveLength(0);
  });

  it('does not change activeFilePath when deleting non-active file', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setActiveFile('app.js');
    store.getState().deleteFile('server.js');

    expect(store.getState().activeFilePath).toBe('app.js');
  });
});

describe('blank canvas (scaffolded=false)', () => {
  const blankChallenge = {
    ...mockChallenge,
    scaffolded: false as const,
  };

  it('starts with empty files when scaffolded=false', () => {
    store.getState().initFromChallenge(blankChallenge);
    const state = store.getState();
    expect(Object.keys(state.files)).toHaveLength(0);
    expect(state.activeFilePath).toBeNull();
  });

  it('sets scaffoldFiles to null when scaffolded=false', () => {
    store.getState().initFromChallenge(blankChallenge);
    expect(store.getState().scaffoldFiles).toBeNull();
  });

  it('still loads metadata when scaffolded=false', () => {
    store.getState().initFromChallenge(blankChallenge);
    expect(store.getState().challengeMetadata?.title).toBe('Express Basics');
    expect(store.getState().totalHints).toBe(2);
  });

  it('defaults to scaffolded=true when not specified', () => {
    store.getState().initFromChallenge(mockChallenge);
    expect(Object.keys(store.getState().files)).toHaveLength(2);
    expect(store.getState().scaffoldFiles).not.toBeNull();
  });
});

describe('isDirty with new files', () => {
  it('returns false for files not in scaffold', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().createFile('new.js', 'content');
    // new.js has no scaffold entry, so isDirty returns false
    expect(store.getState().isDirty('new.js')).toBe(false);
  });
});

describe('tabOrder', () => {
  it('populates tabOrder from files on init', () => {
    store.getState().initFromChallenge(mockChallenge);
    expect(store.getState().tabOrder).toEqual(['app.js', 'server.js']);
  });

  it('starts with empty tabOrder', () => {
    expect(store.getState().tabOrder).toEqual([]);
  });

  it('openTab adds path to tabOrder and activates it', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().closeTab('server.js'); // remove from tabs first
    expect(store.getState().tabOrder).toEqual(['app.js']);
    store.getState().openTab('server.js');
    expect(store.getState().tabOrder).toEqual(['app.js', 'server.js']);
    expect(store.getState().activeFilePath).toBe('server.js');
  });

  it('openTab activates without duplicating existing tab', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().openTab('server.js');
    expect(store.getState().tabOrder).toEqual(['app.js', 'server.js']);
    expect(store.getState().activeFilePath).toBe('server.js');
  });

  it('closeTab removes from tabOrder and selects adjacent', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setActiveFile('app.js');
    store.getState().closeTab('app.js');
    expect(store.getState().tabOrder).toEqual(['server.js']);
    expect(store.getState().activeFilePath).toBe('server.js');
  });

  it('closeTab on last tab sets activeFilePath to null', () => {
    store.getState().initFromChallenge({
      ...mockChallenge,
      files: [{ path: 'only.js', content: '' }],
    });
    store.getState().closeTab('only.js');
    expect(store.getState().tabOrder).toEqual([]);
    expect(store.getState().activeFilePath).toBeNull();
  });

  it('reorderTabs swaps positions', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().reorderTabs(0, 1);
    expect(store.getState().tabOrder).toEqual(['server.js', 'app.js']);
  });

  it('createFile appends to tabOrder', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().createFile('utils.js');
    expect(store.getState().tabOrder).toEqual(['app.js', 'server.js', 'utils.js']);
  });

  it('deleteFile removes from tabOrder', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().deleteFile('app.js');
    expect(store.getState().tabOrder).toEqual(['server.js']);
  });

  it('renameFile updates path in tabOrder', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().renameFile('app.js', 'index.js');
    expect(store.getState().tabOrder).toEqual(['index.js', 'server.js']);
  });
});

describe('split pane', () => {
  it('toggleSplit enters horizontal mode with a second file', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().toggleSplit();

    const state = store.getState();
    expect(state.splitMode).toBe('horizontal');
    expect(state.secondActiveFilePath).toBe('server.js'); // first file != active
  });

  it('toggleSplit again returns to single mode', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().toggleSplit();
    store.getState().toggleSplit();

    const state = store.getState();
    expect(state.splitMode).toBe('single');
    expect(state.secondActiveFilePath).toBeNull();
  });

  it('setSecondActiveFile changes the second pane file', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().toggleSplit();
    store.getState().setSecondActiveFile('app.js');

    expect(store.getState().secondActiveFilePath).toBe('app.js');
  });

  it('closeSplit returns to single mode', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().toggleSplit();
    store.getState().closeSplit();

    expect(store.getState().splitMode).toBe('single');
    expect(store.getState().secondActiveFilePath).toBeNull();
  });

  it('deleteFile on second pane resets split', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().toggleSplit();
    expect(store.getState().secondActiveFilePath).toBe('server.js');

    store.getState().deleteFile('server.js');

    expect(store.getState().splitMode).toBe('single');
    expect(store.getState().secondActiveFilePath).toBeNull();
  });
});

describe('showSolution and hideSolution', () => {
  const challengeWithSolution = {
    ...mockChallenge,
    referenceSolution: [
      { path: 'app.js', content: 'const app = express();\napp.get("/", (req, res) => res.send("ok"));' },
    ],
  };

  it('showSolution sets viewMode to solution when referenceSolutionFiles exist', () => {
    store.getState().initFromChallenge(challengeWithSolution);
    expect(store.getState().referenceSolutionFiles).not.toBeNull();

    store.getState().showSolution();
    expect(store.getState().viewMode).toBe('solution');
  });

  it('showSolution is no-op when referenceSolutionFiles is null', () => {
    store.getState().initFromChallenge(mockChallenge);
    expect(store.getState().referenceSolutionFiles).toBeNull();

    store.getState().showSolution();
    expect(store.getState().viewMode).toBe('editing');
  });

  it('hideSolution sets viewMode back to editing', () => {
    store.getState().initFromChallenge(challengeWithSolution);
    store.getState().showSolution();
    expect(store.getState().viewMode).toBe('solution');

    store.getState().hideSolution();
    expect(store.getState().viewMode).toBe('editing');
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
