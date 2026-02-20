'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createEditorStore } from '@nthtime/editor';
import { EditorStoreContext, useEditorStore } from './editor-store-context';
import { PromptPanel } from './prompt-panel';
import { EditorPanel } from './editor-panel';
import { OutputPanel } from './output-panel';
import { ChallengeToolbar } from './challenge-toolbar';
import { ResultsView } from './results-view';
import { ResultsNavigation } from './results-navigation';
import { MOCK_CHALLENGE, getMockChallenge } from '@/lib/mock-challenge';
import { runVerification } from '@/lib/run-verification';
import type { Challenge } from '@nthtime/shared';

interface ChallengeViewProps {
  challengeId: string;
  packSlug?: string;
  challenge?: Challenge;
}

export function ChallengeView({
  challengeId,
  packSlug,
  challenge,
}: ChallengeViewProps) {
  const storeRef = useRef(createEditorStore());
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const challengeData = challenge ?? getMockChallenge(challengeId) ?? MOCK_CHALLENGE;

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

    const files = store.getAllFileEntries();
    const result = await runVerification(challengeData.assertions, files);

    store.setVerificationResult(result);
    store.setRunState('complete');
    store.submit();

    // Clear draft on successful submission
    if (result.passed) {
      store.clearDraft();
    }
  }, [challengeData.assertions]);

  const handleRetry = useCallback(() => {
    storeRef.current.getState().retry();
  }, []);

  return (
    <EditorStoreContext value={storeRef.current}>
      <ChallengeViewInner
        onRun={handleRun}
        onRetry={handleRetry}
        packSlug={packSlug}
      />
    </EditorStoreContext>
  );
}

function ChallengeViewInner({
  onRun,
  onRetry,
  packSlug,
}: {
  onRun: () => void;
  onRetry: () => void;
  packSlug?: string;
}) {
  const viewMode = useEditorStore((s) => s.viewMode);

  if (viewMode === 'results') {
    return (
      <ResultsView>
        <ResultsNavigation onRetry={onRetry} packSlug={packSlug} />
      </ResultsView>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="grid flex-1 grid-cols-[minmax(280px,1fr)_minmax(400px,2fr)_minmax(280px,1fr)] overflow-hidden">
        <PromptPanel />
        <EditorPanel />
        <OutputPanel />
      </div>
      <ChallengeToolbar onRun={onRun} />
    </div>
  );
}
