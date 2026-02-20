'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createEditorStore } from '@nthtime/editor';
import { EditorStoreContext } from './editor-store-context';
import { PromptPanel } from './prompt-panel';
import { EditorPanel } from './editor-panel';
import { OutputPanel } from './output-panel';
import { ChallengeToolbar } from './challenge-toolbar';
import { MOCK_CHALLENGE } from '@/lib/mock-challenge';
import { runVerification } from '@/lib/run-verification';

interface ChallengeViewProps {
  challengeId: string;
}

export function ChallengeView({ challengeId }: ChallengeViewProps) {
  const storeRef = useRef(createEditorStore());
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    // Initialize from challenge data (draft auto-restores if present)
    storeRef.current.getState().initFromChallenge(MOCK_CHALLENGE, challengeId);
  }, [challengeId]);

  // Debounced draft saving on file changes
  useEffect(() => {
    const unsubscribe = storeRef.current.subscribe((state, prevState) => {
      if (state.files !== prevState.files) {
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
    const result = await runVerification(MOCK_CHALLENGE.assertions, files);

    store.setVerificationResult(result);
    store.setRunState('complete');

    // Clear draft on successful submission
    if (result.passed) {
      store.clearDraft();
    }
  }, []);

  return (
    <EditorStoreContext value={storeRef.current}>
      <div className="flex h-full flex-col">
        <div className="grid flex-1 grid-cols-[minmax(280px,1fr)_minmax(400px,2fr)_minmax(280px,1fr)] overflow-hidden">
          <PromptPanel />
          <EditorPanel />
          <OutputPanel />
        </div>
        <ChallengeToolbar onRun={handleRun} />
      </div>
    </EditorStoreContext>
  );
}
