import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { createStore } from 'zustand/vanilla';
import type { EditorStore } from '@nthtime/editor';
import { FeedbackLevel } from '@nthtime/shared';
import type { VerificationResult } from '@nthtime/shared';
import { EditorStoreContext } from './editor-store-context';

// Stub MonacoWrapper and DiffView since they depend on browser-only Monaco APIs
vi.mock('./monaco-wrapper', () => ({
  MonacoWrapper: (props: Record<string, unknown>) => (
    <div data-testid="monaco-wrapper" data-language={props.language} />
  ),
}));
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const Stub = (props: Record<string, unknown>) => (
      <div data-testid="diff-view" data-original={props.originalContent} />
    );
    Stub.displayName = 'DiffViewLazy';
    return Stub;
  },
}));
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}));

// Control feedback level via a module-level variable
let mockFeedbackLevel = FeedbackLevel.FullDiagnostics;
vi.mock('@/lib/settings-store', () => ({
  getSettingsStore: () =>
    createStore(() => ({
      settings: { get feedbackLevel() { return mockFeedbackLevel; } },
    })),
}));

import { ResultsView } from './results-view';

const MOCK_RESULT: VerificationResult = {
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

function buildEditorStore(overrides?: Partial<EditorStore>) {
  const defaults: EditorStore = {
    files: { 'app.js': { content: 'function greet() {}', language: 'javascript' } },
    activeFilePath: 'app.js',
    tabOrder: ['app.js'],
    splitMode: 'single',
    secondActiveFilePath: null,
    scaffoldFiles: { 'app.js': { content: '', language: 'javascript' } },
    submittedFiles: { 'app.js': { content: 'function greet() {}', language: 'javascript' } },
    viewMode: 'results',
    verificationResult: MOCK_RESULT,
    timer: { startedAt: null, elapsedSeconds: 42 },
    hintsRevealed: 0,
    totalHints: 2,
    hints: ['Try adding a farewell function', 'Make sure to export greet'],
    initFromChallenge: vi.fn(),
    setActiveFile: vi.fn(),
    setFileContent: vi.fn(),
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
    submit: vi.fn(),
    retry: vi.fn(),
    setViewMode: vi.fn(),
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
    ...overrides,
  };
  return createStore<EditorStore>(() => defaults);
}

function renderResultsView(feedbackLevel: FeedbackLevel, storeOverrides?: Partial<EditorStore>) {
  mockFeedbackLevel = feedbackLevel;
  const store = buildEditorStore(storeOverrides);
  return render(
    <EditorStoreContext.Provider value={store}>
      <ResultsView />
    </EditorStoreContext.Provider>,
  );
}

describe('ResultsView feedback levels', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: () => null,
    });
  });

  it('L0 (None): shows only the pass/fail banner', () => {
    renderResultsView(FeedbackLevel.None);

    // Banner always shows
    expect(screen.getByText('Some Failed')).toBeInTheDocument();
    expect(screen.getByText(/1\/3 assertions passed/)).toBeInTheDocument();

    // No assertion details at L0
    expect(screen.queryByText('greet function exists')).not.toBeInTheDocument();
    expect(screen.queryByText('farewell function exists')).not.toBeInTheDocument();
    expect(screen.queryByText('Show next hint')).not.toBeInTheDocument();
    expect(screen.queryByText('Diff')).not.toBeInTheDocument();
  });

  it('L1 (PassFail): shows pass/fail per assertion but no details', () => {
    renderResultsView(FeedbackLevel.PassFail);

    // Assertion descriptions visible
    expect(screen.getByText('greet function exists')).toBeInTheDocument();
    expect(screen.getByText('farewell function exists')).toBeInTheDocument();
    expect(screen.getByText('[pass]')).toBeInTheDocument();
    expect(screen.getAllByText('[fail]')).toHaveLength(2); // file + cross-file

    // No detail messages or locations at L1
    expect(screen.queryByText(/Missing function farewell/)).not.toBeInTheDocument();
    expect(screen.queryByText(/line 5/)).not.toBeInTheDocument();
    expect(screen.queryByText('Show next hint')).not.toBeInTheDocument();
    expect(screen.queryByText('Diff')).not.toBeInTheDocument();
  });

  it('L2 (Hints): shows hints section', () => {
    renderResultsView(FeedbackLevel.Hints);

    expect(screen.getByText('Show next hint')).toBeInTheDocument();
    expect(screen.getByText('Hints (0/2)')).toBeInTheDocument();
    // Still no details at L2
    expect(screen.queryByText(/Missing function farewell/)).not.toBeInTheDocument();
    expect(screen.queryByText('Diff')).not.toBeInTheDocument();
  });

  it('L3 (AssertionDetails): shows failure messages and line numbers', () => {
    renderResultsView(FeedbackLevel.AssertionDetails);

    expect(screen.getByText(/Missing function farewell/)).toBeInTheDocument();
    expect(screen.getByText(/line 5/)).toBeInTheDocument();
    // No diff button at L3
    expect(screen.queryByText('Diff')).not.toBeInTheDocument();
  });

  it('L4 (FullDiagnostics): shows diff button', () => {
    renderResultsView(FeedbackLevel.FullDiagnostics);

    expect(screen.getByText('Diff')).toBeInTheDocument();
    expect(screen.getByText(/Missing function farewell/)).toBeInTheDocument();
    expect(screen.getByText(/line 5/)).toBeInTheDocument();
  });

  it('shows all-pass banner when result.passed is true', () => {
    const passingResult: VerificationResult = {
      passed: true,
      totalAssertions: 1,
      passedAssertions: 1,
      fileResults: [
        {
          file: 'app.js',
          passed: true,
          results: [
            {
              assertion: { type: 'functionDeclaration', name: 'greet', description: 'greet fn' },
              passed: true,
              message: 'Found',
            },
          ],
        },
      ],
      crossFileResults: [],
    };
    renderResultsView(FeedbackLevel.PassFail, { verificationResult: passingResult });

    expect(screen.getByText('All Passed')).toBeInTheDocument();
  });
});
