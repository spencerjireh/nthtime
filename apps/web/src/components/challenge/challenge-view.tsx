'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { createEditorStore, type EditorStore } from '@nthtime/editor';
import type { StoreApi } from 'zustand/vanilla';
import { EditorStoreContext, useEditorStore } from './editor-store-context';
import dynamic from 'next/dynamic';
import { ResultsView } from './results-view';
import { ResultsNavigation } from './results-navigation';
import { ChallengeDetailView } from './challenge-detail-view';
import { runVerification } from '@/lib/run-verification';
import { formatAllFiles } from '@/lib/formatter';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { getSettingsStore } from '@/lib/settings-store';
import { useDataAccess } from '@/lib/data-access';
import type { Challenge } from '@nthtime/shared';

const DockableLayout = dynamic(() =>
  import('./dockable-layout').then((m) => ({ default: m.DockableLayout })),
  { ssr: false },
);

const InlineSolutionLayout = dynamic(() => import('./inline-solution-layout'), {
  ssr: false,
});

interface ChallengeViewProps {
  challengeId: string;
  packSlug?: string;
  challenge?: Challenge;
  initialView?: 'details';
}

export function ChallengeView({
  challengeId,
  packSlug,
  challenge,
  initialView,
}: ChallengeViewProps) {
  const { useChallenge } = useDataAccess();
  const { challenge: fetched, isLoading } = useChallenge(challengeId);

  const challengeData = challenge ?? fetched;

  if (isLoading && !challengeData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading challenge...</div>
      </div>
    );
  }

  if (!challengeData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <div className="text-muted-foreground text-sm">Challenge not found</div>
        {packSlug && (
          <a href={`/pack/${packSlug}`} className="text-primary text-sm hover:underline">
            Back to pack
          </a>
        )}
      </div>
    );
  }

  if (initialView === 'details') {
    return (
      <ChallengeDetailView
        challenge={challengeData}
        challengeId={challengeId}
        packSlug={packSlug}
      />
    );
  }

  return (
    <ChallengeViewEditor
      challengeId={challengeId}
      packSlug={packSlug}
      challengeData={challengeData}
    />
  );
}

function ChallengeViewEditor({
  challengeId,
  packSlug,
  challengeData,
}: {
  challengeId: string;
  packSlug?: string;
  challengeData: Challenge;
}) {
  const storeRef = useRef<StoreApi<EditorStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createEditorStore();
  }
  const store = storeRef.current;
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const { useCreateAttempt, useChallenges } = useDataAccess();
  const createAttempt = useCreateAttempt();
  const { challenges } = useChallenges(packSlug);
  const challengeIds = useMemo(
    () => [...challenges].sort((a, b) => a.order - b.order).map((c) => c._id),
    [challenges],
  );

  useEffect(() => {
    store.getState().initFromChallenge(challengeData, challengeId);
  }, [challengeId, challengeData]);

  // Debounced draft saving on file changes
  useEffect(() => {
    const unsubscribe = store.subscribe((state, prevState) => {
      if (state.files !== prevState.files && state.viewMode === 'editing') {
        if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
        draftTimerRef.current = setTimeout(() => {
          store.getState().saveDraft();
        }, 500);
      }
    });
    return () => {
      unsubscribe();
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, []);

  const handleRun = useCallback(async () => {
    const state = store.getState();
    state.setRunState('running');

    // Format on submit if enabled
    const { formatter } = getSettingsStore().getState().settings;
    if (formatter.defaults.trigger === 'onSubmit') {
      const changed = await formatAllFiles(state.files, formatter.defaults);
      changed.forEach((content, path) => state.setFileContent(path, content));
    }

    const files = state.getAllFileEntries();
    const result = await runVerification(challengeData.assertions, files);

    state.setVerificationResult(result);
    state.setRunState('complete');
    state.submit();

    // Persist attempt (fire-and-forget)
    createAttempt({
      challengeId,
      passed: result.passed,
      assertionResults: result.fileResults,
      hintsUsed: state.hintsRevealed,
      timeSeconds: state.timer.elapsedSeconds,
    });

    // Clear draft on successful submission
    if (result.passed) {
      state.clearDraft();
    }
  }, [challengeData.assertions, challengeId, createAttempt, store]);

  const handleRetry = useCallback(() => {
    store.getState().retry();
  }, [store]);

  return (
    <EditorStoreContext value={store}>
      <ChallengeViewInner
        onRun={handleRun}
        onRetry={handleRetry}
        challengeId={challengeId}
        packSlug={packSlug}
        challengeIds={challengeIds}
      />
    </EditorStoreContext>
  );
}

function ChallengeViewInner({
  onRun,
  onRetry,
  challengeId,
  packSlug,
  challengeIds,
}: {
  onRun: () => void;
  onRetry: () => void;
  challengeId: string;
  packSlug?: string;
  challengeIds?: string[];
}) {
  const viewMode = useEditorStore((s) => s.viewMode);

  if (viewMode === 'results') {
    return (
      <ResultsView>
        <ResultsNavigation
          onRetry={onRetry}
          packSlug={packSlug}
          challengeIds={challengeIds}
        />
      </ResultsView>
    );
  }

  if (viewMode === 'solution' && isFeatureEnabled('solutionView')) {
    return <InlineSolutionLayout />;
  }

  return <DockableLayout onRun={onRun} challengeId={challengeId} packSlug={packSlug} />;
}
