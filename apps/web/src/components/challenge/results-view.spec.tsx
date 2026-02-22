import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createStore } from 'zustand/vanilla';
import type { EditorStore } from '@nthtime/editor';
import { FeedbackLevel } from '@nthtime/shared';
import type { VerificationResult } from '@nthtime/shared';
import { buildEditorStore, MOCK_VERIFICATION_RESULT } from '../../test-utils';
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

const RESULTS_DEFAULTS: Partial<EditorStore> = {
  submittedFiles: {
    'app.js': { path: 'app.js', content: 'function greet() {}' },
  },
  viewMode: 'results',
  verificationResult: MOCK_VERIFICATION_RESULT,
  timer: { startedAt: null, elapsedSeconds: 42 },
  hintsRevealed: 0,
  totalHints: 2,
  hints: ['Try adding a farewell function', 'Make sure to export greet'],
};

function renderResultsView(feedbackLevel: FeedbackLevel, storeOverrides?: Partial<EditorStore>) {
  mockFeedbackLevel = feedbackLevel;
  const store = buildEditorStore({ ...RESULTS_DEFAULTS, ...storeOverrides });
  const result = render(
    <EditorStoreContext.Provider value={store}>
      <ResultsView />
    </EditorStoreContext.Provider>,
  );
  return { ...result, store };
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

  it('hint reveal: clicking "Show next hint" calls revealNextHint', () => {
    const { store } = renderResultsView(FeedbackLevel.Hints);
    fireEvent.click(screen.getByText('Show next hint'));
    expect(store.getState().revealNextHint).toHaveBeenCalledOnce();
  });

  it('revealed hints display in order', () => {
    renderResultsView(FeedbackLevel.Hints, {
      hintsRevealed: 2,
      totalHints: 3,
      hints: ['hint A', 'hint B', 'hint C'],
    });
    // First two revealed, third not yet
    expect(screen.getByText('hint A')).toBeInTheDocument();
    expect(screen.getByText('hint B')).toBeInTheDocument();
    expect(screen.queryByText('hint C')).not.toBeInTheDocument();
    expect(screen.getByText('Hints (2/3)')).toBeInTheDocument();
  });

  it('hint button hidden when all hints revealed', () => {
    renderResultsView(FeedbackLevel.Hints, {
      hintsRevealed: 2,
      totalHints: 2,
      hints: ['hint A', 'hint B'],
    });
    // When hintsRevealed === totalHints, the hint section (with button) is hidden
    expect(screen.queryByText('Show next hint')).not.toBeInTheDocument();
  });

  it('cross-file assertion section renders with "Cross-file" heading at L1+', () => {
    renderResultsView(FeedbackLevel.PassFail);
    expect(screen.getByText('Cross-file')).toBeInTheDocument();
    expect(screen.getByText('greet is exported')).toBeInTheDocument();
  });

  it('timer displays formatted elapsed time in banner', () => {
    renderResultsView(FeedbackLevel.None, { timer: { startedAt: null, elapsedSeconds: 125 } });
    // formatTime(125) produces "02:05" (zero-padded)
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('diff button at L4 toggles diff view', () => {
    renderResultsView(FeedbackLevel.FullDiagnostics);
    // Click Diff to show diff view
    fireEvent.click(screen.getByText('Diff'));
    expect(screen.getByTestId('diff-view')).toBeInTheDocument();
    // Click again to hide
    fireEvent.click(screen.getByText('Diff'));
    expect(screen.queryByTestId('diff-view')).not.toBeInTheDocument();
  });
});
