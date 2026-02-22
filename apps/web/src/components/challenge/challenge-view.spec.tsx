import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createStore } from 'zustand/vanilla';
import type { EditorStore } from '@nthtime/editor';
import { buildEditorStore, MOCK_VERIFICATION_RESULT } from '../../test-utils';

// vi.hoisted() runs before vi.mock() factories, making these accessible in mock scopes
const {
  mockStore: mockStoreRef,
  mockRunVerification,
  mockFormatCode,
  mockCreateAttempt,
  mockFormatterTrigger,
  MOCK_CHALLENGE_DATA,
} = vi.hoisted(() => {
  return {
    mockStore: { current: null as ReturnType<typeof createStore<EditorStore>> | null },
    mockRunVerification: vi.fn(),
    mockFormatCode: vi.fn((code: string) => Promise.resolve(code)),
    mockCreateAttempt: vi.fn().mockResolvedValue(undefined),
    mockFormatterTrigger: { value: 'manual' },
    MOCK_CHALLENGE_DATA: {
      id: 'ch_test_1',
      title: 'Test Challenge',
      prompt: 'Write a test',
      difficulty: 'beginner' as const,
      tags: ['test'] as const,
      timeEstimateSeconds: 300,
      hints: ['hint 1', 'hint 2'],
      assertions: { perFile: [{ file: 'app.js', assertions: [] }], crossFile: [] },
      files: [{ path: 'app.js', content: 'const a = 1;' }],
      scaffolded: true,
    },
  };
});

// --- Mock createEditorStore to return our controlled store ---
vi.mock('@nthtime/editor', async (importOriginal) => {
  const orig = await importOriginal<typeof import('@nthtime/editor')>();
  return {
    ...orig,
    createEditorStore: () => mockStoreRef.current,
  };
});

// --- Mock child components as simple stubs ---
vi.mock('./prompt-panel', () => ({
  PromptPanel: () => <div data-testid="prompt-panel" />,
}));
vi.mock('./editor-panel', () => ({
  EditorPanel: () => <div data-testid="editor-panel" />,
}));
vi.mock('./output-panel', () => ({
  OutputPanel: () => <div data-testid="output-panel" />,
}));
vi.mock('./challenge-toolbar', () => ({
  ChallengeToolbar: ({ onRun }: { onRun: () => void }) => (
    <button data-testid="run-button" onClick={onRun}>
      Run
    </button>
  ),
}));
vi.mock('./results-view', () => ({
  ResultsView: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="results-view">{children}</div>
  ),
}));
vi.mock('./results-navigation', () => ({
  ResultsNavigation: ({ onRetry }: { onRetry: () => void }) => (
    <button data-testid="retry-button" onClick={onRetry}>
      Retry
    </button>
  ),
}));

// --- Mock external dependencies ---
vi.mock('@/lib/run-verification', () => ({
  runVerification: (...args: unknown[]) => mockRunVerification(...args),
}));
vi.mock('@/lib/formatter', () => ({
  formatCode: (...args: unknown[]) => mockFormatCode(...args),
}));
vi.mock('@/lib/data-access', () => ({
  useDataAccess: () => ({
    useCreateAttempt: () => mockCreateAttempt,
  }),
}));
vi.mock('@/lib/settings-store', () => ({
  getSettingsStore: () =>
    createStore(() => ({
      settings: {
        formatter: {
          defaults: {
            enabled: true,
            get trigger() {
              return mockFormatterTrigger.value;
            },
            tabSize: 2,
            useTabs: false,
          },
        },
      },
    })),
}));
vi.mock('@/lib/mock-challenge', () => ({
  MOCK_CHALLENGE: MOCK_CHALLENGE_DATA,
  getMockChallenge: () => MOCK_CHALLENGE_DATA,
}));

import { ChallengeView } from './challenge-view';

describe('ChallengeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormatterTrigger.value = 'manual';
    mockStoreRef.current = buildEditorStore();
    mockRunVerification.mockResolvedValue(MOCK_VERIFICATION_RESULT);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function getStore() {
    return mockStoreRef.current!;
  }

  it('calls initFromChallenge on mount', () => {
    render(<ChallengeView challengeId="ch_test_1" />);
    expect(getStore().getState().initFromChallenge).toHaveBeenCalledWith(
      MOCK_CHALLENGE_DATA,
      'ch_test_1',
    );
  });

  it('renders editing layout with prompt, editor, output, and toolbar', () => {
    render(<ChallengeView challengeId="ch_test_1" />);
    expect(screen.getByTestId('prompt-panel')).toBeInTheDocument();
    expect(screen.getByTestId('editor-panel')).toBeInTheDocument();
    expect(screen.getByTestId('output-panel')).toBeInTheDocument();
    expect(screen.getByTestId('run-button')).toBeInTheDocument();
  });

  it('renders results view when store viewMode is results', () => {
    mockStoreRef.current = buildEditorStore({ viewMode: 'results' });
    render(<ChallengeView challengeId="ch_test_1" />);
    expect(screen.getByTestId('results-view')).toBeInTheDocument();
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    expect(screen.queryByTestId('prompt-panel')).not.toBeInTheDocument();
  });

  it('handleRun: calls setRunState, runVerification, setVerificationResult, submit', async () => {
    render(<ChallengeView challengeId="ch_test_1" />);

    await act(async () => {
      screen.getByTestId('run-button').click();
    });

    const state = getStore().getState();
    expect(state.setRunState).toHaveBeenCalledWith('running');
    expect(mockRunVerification).toHaveBeenCalled();
    expect(state.setVerificationResult).toHaveBeenCalledWith(MOCK_VERIFICATION_RESULT);
    expect(state.setRunState).toHaveBeenCalledWith('complete');
    expect(state.submit).toHaveBeenCalled();
  });

  it('handleRun: calls createAttempt with correct args', async () => {
    render(<ChallengeView challengeId="ch_test_1" />);

    await act(async () => {
      screen.getByTestId('run-button').click();
    });

    expect(mockCreateAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        challengeId: 'ch_test_1',
        passed: MOCK_VERIFICATION_RESULT.passed,
        assertionResults: MOCK_VERIFICATION_RESULT.fileResults,
      }),
    );
  });

  it('handleRun: calls clearDraft when result.passed is true', async () => {
    const passingResult = { ...MOCK_VERIFICATION_RESULT, passed: true };
    mockRunVerification.mockResolvedValue(passingResult);

    render(<ChallengeView challengeId="ch_test_1" />);

    await act(async () => {
      screen.getByTestId('run-button').click();
    });

    expect(getStore().getState().clearDraft).toHaveBeenCalled();
  });

  it('handleRun: does NOT call clearDraft when result.passed is false', async () => {
    mockRunVerification.mockResolvedValue({ ...MOCK_VERIFICATION_RESULT, passed: false });

    render(<ChallengeView challengeId="ch_test_1" />);

    await act(async () => {
      screen.getByTestId('run-button').click();
    });

    expect(getStore().getState().clearDraft).not.toHaveBeenCalled();
  });

  it('format on submit: calls formatCode when trigger is onSubmit', async () => {
    mockFormatterTrigger.value = 'onSubmit';

    render(<ChallengeView challengeId="ch_test_1" />);

    await act(async () => {
      screen.getByTestId('run-button').click();
    });

    expect(mockFormatCode).toHaveBeenCalled();
  });

  it('handleRetry: calls store.retry()', () => {
    mockStoreRef.current = buildEditorStore({ viewMode: 'results' });

    render(<ChallengeView challengeId="ch_test_1" />);
    screen.getByTestId('retry-button').click();

    expect(getStore().getState().retry).toHaveBeenCalled();
  });

  it('draft save: file change triggers debounced saveDraft after 500ms', async () => {
    vi.useFakeTimers();

    render(<ChallengeView challengeId="ch_test_1" />);

    // Simulate a file change by updating the store's files reference
    const newFiles = {
      'app.js': { path: 'app.js', content: 'changed' },
    };
    act(() => {
      getStore().setState({ files: newFiles });
    });

    // saveDraft should not be called before 500ms
    expect(getStore().getState().saveDraft).not.toHaveBeenCalled();

    // Advance past the 500ms debounce
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(getStore().getState().saveDraft).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
