import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createStore } from 'zustand/vanilla';
import type { EditorStore } from '@nthtime/editor';
import { DEFAULT_FEEDBACK } from '@nthtime/shared';
import type { FeedbackConfig, VerificationResult } from '@nthtime/shared';
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
vi.mock('./solution-panel', () => ({
  SolutionPanel: (props: Record<string, unknown>) => (
    <div data-testid="solution-panel" data-content={props.content} data-language={props.language} />
  ),
}));
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}));

// Control feedback config via a module-level variable
let mockFeedback: FeedbackConfig = { ...DEFAULT_FEEDBACK };
vi.mock('@/lib/settings-store', () => ({
  getSettingsStore: () =>
    createStore(() => ({
      settings: { get feedback() { return mockFeedback; } },
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
  referenceSolutionFiles: {
    'app.js': { path: 'app.js', content: 'function greet() {}\nfunction farewell() {}' },
  },
};

function renderResultsView(
  feedback: Partial<FeedbackConfig>,
  storeOverrides?: Partial<EditorStore>,
) {
  mockFeedback = { ...DEFAULT_FEEDBACK, ...feedback };
  const store = buildEditorStore({ ...RESULTS_DEFAULTS, ...storeOverrides });
  const result = render(
    <EditorStoreContext.Provider value={store}>
      <ResultsView />
    </EditorStoreContext.Provider>,
  );
  return { ...result, store };
}

describe('ResultsView feedback flags', () => {
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

  it('all flags off: shows only the pass/fail banner', () => {
    renderResultsView({
      showPassFail: false,
      showHints: false,
      showAssertionDetails: false,
      showDiff: false,
      showSolution: false,
    });

    // Banner always shows
    expect(screen.getByText('Some Failed')).toBeInTheDocument();
    expect(screen.getByText(/1\/3 assertions passed/)).toBeInTheDocument();

    // No assertion details
    expect(screen.queryByText('greet function exists')).not.toBeInTheDocument();
    expect(screen.queryByText('farewell function exists')).not.toBeInTheDocument();
    expect(screen.queryByText('Show next hint')).not.toBeInTheDocument();
    expect(screen.queryByText('Diff')).not.toBeInTheDocument();
    expect(screen.queryByText('Solution')).not.toBeInTheDocument();
  });

  it('showPassFail only: shows pass/fail per assertion but no details', () => {
    renderResultsView({
      showPassFail: true,
      showHints: false,
      showAssertionDetails: false,
      showDiff: false,
      showSolution: false,
    });

    // Assertion descriptions visible
    expect(screen.getByText('greet function exists')).toBeInTheDocument();
    expect(screen.getByText('farewell function exists')).toBeInTheDocument();
    expect(screen.getByText('[pass]')).toBeInTheDocument();
    expect(screen.getAllByText('[fail]')).toHaveLength(2); // file + cross-file

    // No detail messages or locations
    expect(screen.queryByText(/Missing function farewell/)).not.toBeInTheDocument();
    expect(screen.queryByText(/line 5/)).not.toBeInTheDocument();
    expect(screen.queryByText('Show next hint')).not.toBeInTheDocument();
    expect(screen.queryByText('Diff')).not.toBeInTheDocument();
  });

  it('showHints: shows hints section', () => {
    renderResultsView({ showHints: true, showAssertionDetails: false });

    expect(screen.getByText('Show next hint')).toBeInTheDocument();
    expect(screen.getByText('Hints (0/2)')).toBeInTheDocument();
    // Still no details
    expect(screen.queryByText(/Missing function farewell/)).not.toBeInTheDocument();
    expect(screen.queryByText('Diff')).not.toBeInTheDocument();
  });

  it('showAssertionDetails: shows failure messages and line numbers', () => {
    renderResultsView({ showAssertionDetails: true, showDiff: false });

    expect(screen.getByText(/Missing function farewell/)).toBeInTheDocument();
    expect(screen.getByText(/line 5/)).toBeInTheDocument();
    // No diff button
    expect(screen.queryByText('Diff')).not.toBeInTheDocument();
  });

  it('showDiff: shows diff button', () => {
    renderResultsView({ showDiff: true });

    expect(screen.getByText('Diff')).toBeInTheDocument();
  });

  it('showSolution: shows solution button', () => {
    renderResultsView({ showSolution: true });

    expect(screen.getByText('Solution')).toBeInTheDocument();
  });

  it('showSolution hidden when no reference solution files', () => {
    renderResultsView({ showSolution: true }, { referenceSolutionFiles: null });

    expect(screen.queryByText('Solution')).not.toBeInTheDocument();
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
    renderResultsView({ showPassFail: true }, { verificationResult: passingResult });

    expect(screen.getByText('All Passed')).toBeInTheDocument();
  });

  it('hint reveal: clicking "Show next hint" calls revealNextHint', () => {
    const { store } = renderResultsView({ showHints: true });
    fireEvent.click(screen.getByText('Show next hint'));
    expect(store.getState().revealNextHint).toHaveBeenCalledOnce();
  });

  it('revealed hints display in order', () => {
    renderResultsView({ showHints: true }, {
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
    renderResultsView({ showHints: true }, {
      hintsRevealed: 2,
      totalHints: 2,
      hints: ['hint A', 'hint B'],
    });
    // When hintsRevealed === totalHints, the hint section (with button) is hidden
    expect(screen.queryByText('Show next hint')).not.toBeInTheDocument();
  });

  it('cross-file assertion section renders with "Cross-file" heading', () => {
    renderResultsView({ showPassFail: true });
    expect(screen.getByText('Cross-file')).toBeInTheDocument();
    expect(screen.getByText('greet is exported')).toBeInTheDocument();
  });

  it('timer displays formatted elapsed time in banner', () => {
    renderResultsView({}, { timer: { startedAt: null, elapsedSeconds: 125 } });
    // formatTime(125) produces "02:05" (zero-padded)
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('diff button toggles diff view', () => {
    renderResultsView({ showDiff: true });
    // Click Diff to show diff view
    fireEvent.click(screen.getByText('Diff'));
    expect(screen.getByTestId('diff-view')).toBeInTheDocument();
    // Click again to hide
    fireEvent.click(screen.getByText('Diff'));
    expect(screen.queryByTestId('diff-view')).not.toBeInTheDocument();
  });

  it('solution and diff are mutually exclusive', () => {
    renderResultsView({ showDiff: true, showSolution: true });

    // Click Solution
    fireEvent.click(screen.getByText('Solution'));
    expect(screen.queryByTestId('diff-view')).not.toBeInTheDocument();
    expect(screen.getByTestId('solution-panel')).toBeInTheDocument();

    // Click Diff -- should deactivate Solution
    fireEvent.click(screen.getByText('Diff'));
    expect(screen.getByTestId('diff-view')).toBeInTheDocument();
    expect(screen.queryByTestId('solution-panel')).not.toBeInTheDocument();
  });

  it('clicking a file tab while in Diff mode stays in Diff mode', () => {
    const multiFileResult: VerificationResult = {
      passed: false,
      totalAssertions: 2,
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
        {
          file: 'server.js',
          passed: false,
          results: [
            {
              assertion: { type: 'functionDeclaration', name: 'init', description: 'init fn' },
              passed: false,
              message: 'Missing',
            },
          ],
        },
      ],
      crossFileResults: [],
    };
    renderResultsView(
      { showDiff: true },
      {
        submittedFiles: {
          'app.js': { path: 'app.js', content: 'function greet() {}' },
          'server.js': { path: 'server.js', content: 'const x = 1;' },
        },
        scaffoldFiles: {
          'app.js': { path: 'app.js', content: '' },
          'server.js': { path: 'server.js', content: '' },
        },
        verificationResult: multiFileResult,
      },
    );

    // Enter Diff mode
    fireEvent.click(screen.getByText('Diff'));
    expect(screen.getByTestId('diff-view')).toBeInTheDocument();

    // Click the second file tab (use getAllByText to avoid collision with assertion sidebar)
    const serverTabs = screen.getAllByText('server.js');
    const serverTabButton = serverTabs.find((el) => el.closest('button'));
    fireEvent.click(serverTabButton!);

    // Should still be in Diff mode
    expect(screen.getByTestId('diff-view')).toBeInTheDocument();
  });

  it('clicking a file tab while in Solution mode stays in Solution mode', () => {
    renderResultsView(
      { showSolution: true },
      {
        submittedFiles: {
          'app.js': { path: 'app.js', content: 'function greet() {}' },
          'server.js': { path: 'server.js', content: 'const x = 1;' },
        },
        referenceSolutionFiles: {
          'app.js': { path: 'app.js', content: 'function greet() { return "hi"; }' },
          'server.js': { path: 'server.js', content: 'function init() {}' },
        },
      },
    );

    // Enter Solution mode
    fireEvent.click(screen.getByText('Solution'));
    expect(screen.getByTestId('solution-panel')).toBeInTheDocument();

    // Click the second file tab (use getAllByText to avoid collision with assertion sidebar)
    const serverTabs = screen.getAllByText('server.js');
    const serverTabButton = serverTabs.find((el) => el.closest('button'));
    fireEvent.click(serverTabButton!);

    // Should still be in Solution mode
    expect(screen.getByTestId('solution-panel')).toBeInTheDocument();
  });

  it('Solution view renders SolutionPanel with active file content', () => {
    renderResultsView({ showSolution: true });

    fireEvent.click(screen.getByText('Solution'));
    const panel = screen.getByTestId('solution-panel');
    expect(panel).toBeInTheDocument();

    // Verify active file's reference solution content was passed
    expect(panel.getAttribute('data-content')).toBe('function greet() {}\nfunction farewell() {}');
    expect(panel.getAttribute('data-language')).toBe('javascript');
  });
});
