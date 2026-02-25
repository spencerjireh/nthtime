'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { createEditorStore } from '@nthtime/editor';
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
  const storeRef = useRef(createEditorStore());
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const { useCreateAttempt, useChallenges } = useDataAccess();
  const createAttempt = useCreateAttempt();
  const { challenges } = useChallenges(packSlug ?? '');
  const challengeIds = useMemo(
    () => [...challenges].sort((a, b) => a.order - b.order).map((c) => c._id),
    [challenges],
  );

  useEffect(() => {
    storeRef.current.getState().initFromChallenge(challengeData, challengeId);
  }, [challengeId, challengeData]);

  // Debounced draft saving on file changes
  useEffect(() => {
    const unsubscribe = storeRef.current.subscribe((state, prevState) => {
      if (state.files !== prevState.files && state.viewMode === 'editing') {
        if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
        draftTimerRef.current = setTimeout(() => {
          storeRef.current.getState().saveDraft();
        }, 500);
      }
    });
    return () => {
      unsubscribe();
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, []);

  const handleRun = useCallback(async () => {
    const store = storeRef.current.getState();
    store.setRunState('running');

    // Format on submit if enabled
    const { formatter } = getSettingsStore().getState().settings;
    if (formatter.defaults.trigger === 'onSubmit') {
      const changed = await formatAllFiles(store.files, formatter.defaults);
      changed.forEach((content, path) => store.setFileContent(path, content));
    }

    const files = store.getAllFileEntries();
    const result = await runVerification(challengeData.assertions, files);

    store.setVerificationResult(result);
    store.setRunState('complete');
    store.submit();

    // Persist attempt (fire-and-forget)
    createAttempt({
      challengeId,
      passed: result.passed,
      assertionResults: result.fileResults,
      hintsUsed: store.hintsRevealed,
      timeSeconds: store.timer.elapsedSeconds,
    });

    // Clear draft on successful submission
    if (result.passed) {
      store.clearDraft();
    }
  }, [challengeData.assertions, challengeId, createAttempt]);

  const handleRetry = useCallback(() => {
    storeRef.current.getState().retry();
  }, []);

  return (
    <EditorStoreContext value={storeRef.current}>
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
