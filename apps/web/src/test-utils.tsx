import { render, type RenderOptions } from '@testing-library/react';
import { createStore } from 'zustand/vanilla';
import type { EditorStore } from '@nthtime/editor';
import type { VerificationResult } from '@nthtime/shared';
import { EditorStoreContext } from './components/challenge/editor-store-context';

/**
 * Creates a Zustand vanilla store with full EditorStore defaults + vi.fn() stubs.
 * Pass overrides for any state or action you want to control.
 */
export function buildEditorStore(
  overrides?: Partial<EditorStore>,
): ReturnType<typeof createStore<EditorStore>> {
  const defaults: EditorStore = {
    challengeId: null,
    files: {
      'app.js': { path: 'app.js', content: 'const a = 1;' },
      'server.js': { path: 'server.js', content: 'const b = 2;' },
    },
    activeFilePath: 'app.js',
    tabOrder: ['app.js', 'server.js'],
    runState: 'idle',
    splitMode: 'single',
    secondActiveFilePath: null,
    scaffoldFiles: {
      'app.js': { path: 'app.js', content: '' },
      'server.js': { path: 'server.js', content: '' },
    },
    submittedFiles: null,
    referenceSolutionFiles: null,
    viewMode: 'editing',
    verificationResult: null,
    timer: { startedAt: null, elapsedSeconds: 0 },
    hintsRevealed: 0,
    totalHints: 0,
    hints: [],
    challengeMetadata: null,
    initFromChallenge: vi.fn(),
    setActiveFile: vi.fn(),
    setFileContent: vi.fn(),
    setRunState: vi.fn(),
    startTimer: vi.fn(),
    tickTimer: vi.fn(),
    stopTimer: vi.fn(),
    submit: vi.fn(),
    retry: vi.fn(),
    reset: vi.fn(),
    setVerificationResult: vi.fn(),
    revealNextHint: vi.fn(),
    saveDraft: vi.fn(),
    loadDraft: vi.fn().mockReturnValue(false),
    clearDraft: vi.fn(),
    isDirty: vi.fn().mockReturnValue(false),
    createFile: vi.fn(),
    renameFile: vi.fn(),
    deleteFile: vi.fn(),
    openTab: vi.fn(),
    closeTab: vi.fn(),
    reorderTabs: vi.fn(),
    toggleSplit: vi.fn(),
    setSecondActiveFile: vi.fn(),
    closeSplit: vi.fn(),
    getAllFileEntries: vi.fn().mockReturnValue([
      { path: 'app.js', content: 'const a = 1;' },
      { path: 'server.js', content: 'const b = 2;' },
    ]),
    ...overrides,
  };
  return createStore<EditorStore>(() => defaults);
}

/**
 * Wraps render() in an EditorStoreContext.Provider with the given store overrides.
 */
export function renderWithEditorStore(
  ui: React.ReactElement,
  overrides?: Partial<EditorStore>,
  renderOptions?: Omit<RenderOptions, 'wrapper'>,
) {
  const store = buildEditorStore(overrides);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <EditorStoreContext.Provider value={store}>{children}</EditorStoreContext.Provider>
  );
  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Reusable failing verification result with 3 assertions (1 pass, 2 fail).
 * Used across ResultsView and ChallengeView tests.
 */
export const MOCK_VERIFICATION_RESULT: VerificationResult = {
  passed: false,
  totalAssertions: 3,
  passedAssertions: 1,
  fileResults: [
    {
      file: 'app.js',
      passed: false,
      results: [
        {
          assertion: {
            type: 'functionDeclaration',
            name: 'greet',
            description: 'greet function exists',
          },
          passed: true,
          message: 'Found function greet',
        },
        {
          assertion: {
            type: 'functionDeclaration',
            name: 'farewell',
            description: 'farewell function exists',
          },
          passed: false,
          message: 'Missing function farewell',
          location: { file: 'app.js', line: 5, column: 1 },
        },
      ],
    },
  ],
  crossFileResults: [
    {
      assertion: {
        type: 'exportPresence',
        name: 'greet',
        exportKind: 'named',
        description: 'greet is exported',
      },
      passed: false,
      message: 'greet is not exported',
    },
  ],
};
