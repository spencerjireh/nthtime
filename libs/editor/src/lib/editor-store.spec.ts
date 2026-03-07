import { describe, it, expect, beforeEach } from 'vitest';
import { createEditorStore } from './editor-store.js';
import type { EditorStore } from './types.js';
import type { StoreApi } from 'zustand/vanilla';
import { Difficulty } from '@nthtime/shared';

let store: StoreApi<EditorStore>;

const mockChallenge = {
  referenceSolution: [
    { path: 'app.js', content: 'const app = express();' },
    { path: 'server.js', content: 'app.listen(3000);' },
  ],
  hints: ['Use express()', 'Call app.listen()'],
  title: 'Express Basics',
  prompt: 'Create a basic Express server',
  difficulty: Difficulty.Beginner,
  tags: ['express', 'node'] as const,
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
    expect(state.resultsCodeView).toBe('submitted');
  });

  it('initializes from a challenge with file stubs', () => {
    store.getState().initFromChallenge(mockChallenge);
    const state = store.getState();

    expect(Object.keys(state.files)).toHaveLength(2);
    expect(state.files['app.js'].content).toBe('');
    expect(state.files['server.js'].content).toBe('');
    expect(state.activeFilePath).toBe('app.js');
    expect(state.totalHints).toBe(2);
    expect(state.hints).toEqual(['Use express()', 'Call app.listen()']);
    expect(state.challengeMetadata?.title).toBe('Express Basics');
    expect(state.challengeMetadata?.difficulty).toBe('beginner');
  });

  it('stores reference solution files on init', () => {
    store.getState().initFromChallenge(mockChallenge);
    const { referenceSolutionFiles } = store.getState();

    if (!referenceSolutionFiles) throw new Error('Expected referenceSolutionFiles to be set');
    expect(referenceSolutionFiles['app.js'].content).toBe('const app = express();');
    expect(referenceSolutionFiles['server.js'].content).toBe('app.listen(3000);');
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

  it('returns all file entries', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setFileContent('app.js', 'some code');
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
    store.getState().setFileContent('app.js', 'original');
    store.getState().createFile('app.js', 'duplicate');

    expect(store.getState().files['app.js'].content).toBe('original');
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
      referenceSolution: [{ path: 'only.js', content: 'solo' }],
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

describe('fileStubs=false (blank canvas)', () => {
  it('starts with empty files when fileStubs=false', () => {
    store.getState().initFromChallenge(mockChallenge, undefined, false);
    const state = store.getState();
    expect(Object.keys(state.files)).toHaveLength(0);
    expect(state.activeFilePath).toBeNull();
  });

  it('still builds referenceSolutionFiles when fileStubs=false', () => {
    store.getState().initFromChallenge(mockChallenge, undefined, false);
    const { referenceSolutionFiles } = store.getState();
    if (!referenceSolutionFiles) throw new Error('Expected referenceSolutionFiles to be set');
    expect(referenceSolutionFiles['app.js'].content).toBe('const app = express();');
  });

  it('still loads metadata when fileStubs=false', () => {
    store.getState().initFromChallenge(mockChallenge, undefined, false);
    expect(store.getState().challengeMetadata?.title).toBe('Express Basics');
    expect(store.getState().totalHints).toBe(2);
  });

  it('defaults to fileStubs=true when not specified', () => {
    store.getState().initFromChallenge(mockChallenge);
    expect(Object.keys(store.getState().files)).toHaveLength(2);
  });
});

describe('tabOrder', () => {
  it('populates tabOrder from file stubs on init', () => {
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
      referenceSolution: [{ path: 'only.js', content: '' }],
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

describe('submit and retry', () => {
  it('submit snapshots files and switches to results', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setFileContent('app.js', 'submitted code');
    store.getState().submit();

    const state = store.getState();
    expect(state.viewMode).toBe('results');
    if (!state.submittedFiles) throw new Error('Expected submittedFiles to be set after submit');
    expect(state.submittedFiles['app.js'].content).toBe('submitted code');
    expect(state.resultsCodeView).toBe('submitted');
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
    expect(state.resultsCodeView).toBe('submitted');
  });

  it('retry without submitted files preserves current files', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().setFileContent('app.js', 'content');
    const currentContent = store.getState().files['app.js'].content;

    store.getState().retry();

    expect(store.getState().files['app.js'].content).toBe(currentContent);
    expect(store.getState().viewMode).toBe('editing');
  });

  it('full submit-retry cycle preserves reference solution files', () => {
    store.getState().initFromChallenge(mockChallenge);
    const originalRef = store.getState().referenceSolutionFiles;

    store.getState().setFileContent('app.js', 'modified');
    store.getState().submit();
    store.getState().retry();

    expect(store.getState().referenceSolutionFiles).toEqual(originalRef);
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

describe('resultsCodeView', () => {
  it('setResultsCodeView changes the results code view', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().submit();
    expect(store.getState().resultsCodeView).toBe('submitted');

    store.getState().setResultsCodeView('diff');
    expect(store.getState().resultsCodeView).toBe('diff');

    store.getState().setResultsCodeView('solution');
    expect(store.getState().resultsCodeView).toBe('solution');
  });

  it('submit resets resultsCodeView to submitted', () => {
    store.getState().initFromChallenge(mockChallenge);
    store.getState().submit();
    store.getState().setResultsCodeView('diff');
    store.getState().retry();
    store.getState().submit();
    expect(store.getState().resultsCodeView).toBe('submitted');
  });
});
