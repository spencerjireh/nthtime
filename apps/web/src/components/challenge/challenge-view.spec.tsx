import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createStore } from 'zustand/vanilla';
import type { EditorStore } from '@nthtime/editor';
import { buildEditorStore, MOCK_VERIFICATION_RESULT } from '../../test-utils';

// vi.hoisted() runs before vi.mock() factories, making these accessible in mock scopes
const {
  mockStore: mockStoreRef,
  mockRunVerification,
  mockFormatAllFiles,
  mockCreateAttempt,
  mockFormatterTrigger,
  MOCK_CHALLENGE_DATA,
} = vi.hoisted(() => {
  return {
    mockStore: { current: null as ReturnType<typeof createStore<EditorStore>> | null },
    mockRunVerification: vi.fn(),
    mockFormatAllFiles: vi.fn().mockResolvedValue(new Map()),
    mockCreateAttempt: vi.fn().mockResolvedValue(undefined),
    mockFormatterTrigger: { value: 'manual' },
    MOCK_CHALLENGE_DATA: {
      id: 'ch_test_1',
      title: 'Test Challenge',
      prompt: 'Write a test',
      difficulty: 'beginner' as const,
      tags: ['test'] as const,
      hints: ['hint 1', 'hint 2'],
      assertions: { perFile: [{ file: 'app.js', assertions: [] }], crossFile: [] },
      referenceSolution: [{ path: 'app.js', content: 'const a = 1;' }],
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
vi.mock('./challenge-detail-view', () => ({
  ChallengeDetailView: () => <div data-testid="challenge-detail-view" />,
}));

// Mock dynamic imports -- challenge-view.tsx calls dynamic() for DockableLayout
vi.mock('next/dynamic', () => {
  return {
    __esModule: true,
    default: () => {
      const Stub = (props: { onRun: () => void; onRetry: () => void }) => (
        <div data-testid="dockable-layout">
          <div data-testid="prompt-panel" />
          <div data-testid="editor-panel" />
          <button data-testid="run-button" onClick={props.onRun}>
            Run
          </button>
          <button data-testid="retry-button" onClick={props.onRetry}>
            Retry
          </button>
        </div>
      );
      Stub.displayName = 'DockableLayoutStub';
      return Stub;
    },
  };
});

// --- Mock external dependencies ---
vi.mock('@/lib/run-verification', () => ({
  runVerification: (...args: unknown[]) => mockRunVerification(...args),
}));
vi.mock('@/lib/formatter', () => ({
  formatAllFiles: (...args: unknown[]) => mockFormatAllFiles(...args),
}));
vi.mock('@/hooks/use-challenge', () => ({
  useChallenge: () => ({ challenge: MOCK_CHALLENGE_DATA, isLoading: false }),
}));
vi.mock('@/hooks/use-attempts', () => ({
  useCreateAttempt: () => mockCreateAttempt,
}));
vi.mock('@/hooks/use-packs', () => ({
  useChallenges: () => ({ pack: null, challenges: [], isLoading: false }),
}));
vi.mock('@/lib/settings-store', () => ({
  getSettingsStore: () =>
    createStore(() => ({
      settings: {
        fileStubs: true,
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
      true,
    );
  });

  it('renders editing layout with prompt, editor, and toolbar', () => {
    render(<ChallengeView challengeId="ch_test_1" />);
    expect(screen.getByTestId('prompt-panel')).toBeInTheDocument();
    expect(screen.getByTestId('editor-panel')).toBeInTheDocument();
    expect(screen.getByTestId('run-button')).toBeInTheDocument();
  });

  it('always renders dockable layout regardless of viewMode', () => {
    mockStoreRef.current = buildEditorStore({ viewMode: 'results' });
    render(<ChallengeView challengeId="ch_test_1" />);
    expect(screen.getByTestId('dockable-layout')).toBeInTheDocument();
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
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

    expect(mockFormatAllFiles).toHaveBeenCalled();
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
