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
  });
});
