'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from 'zustand';
import { useEditorStore } from './editor-store-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSettingsStore } from '@/lib/settings-store';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { challengeHref } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { VerificationResult } from '@nthtime/shared';

interface ResultsPanelProps {
  onRetry: () => void;
  packSlug?: string;
  challengeIds?: string[];
}

export function ResultsPanel({ onRetry, packSlug, challengeIds }: ResultsPanelProps) {
  const result = useEditorStore((s) => s.verificationResult);
  const challengeId = useEditorStore((s) => s.challengeId);
  const hintsRevealed = useEditorStore((s) => s.hintsRevealed);
  const hints = useEditorStore((s) => s.hints);
  const totalHints = useEditorStore((s) => s.totalHints);
  const revealNextHint = useEditorStore((s) => s.revealNextHint);
  const resultsCodeView = useEditorStore((s) => s.resultsCodeView);
  const setResultsCodeView = useEditorStore((s) => s.setResultsCodeView);
  const referenceSolutionFiles = useEditorStore((s) => s.referenceSolutionFiles);
  const feedback = useStore(getSettingsStore(), (s) => s.settings.feedback);

  const nextChallengeId = useMemo(() => {
    if (!challengeIds?.length || !challengeId) return null;
    const currentIndex = challengeIds.indexOf(challengeId);
    if (currentIndex === -1 || currentIndex >= challengeIds.length - 1) return null;
    return challengeIds[currentIndex + 1];
  }, [challengeIds, challengeId]);

  if (!result) return null;

  const canShowDiff = feedback.showDiff && !!referenceSolutionFiles;
  const canShowSolution =
    isFeatureEnabled('solutionView') && feedback.showSolution && !!referenceSolutionFiles;
  const passed = result.passed;

  return (
    <div className="flex h-full flex-col">
      {/* Banner */}
      <div
        className={cn(
          'flex shrink-0 items-center gap-3 px-4 py-3',
          passed ? 'bg-pass/10' : 'bg-fail/10',
        )}
      >
        <Badge variant={passed ? 'pass' : 'fail'} className="text-sm">
          {passed ? 'All Passed' : 'Some Failed'}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {result.passedAssertions}/{result.totalAssertions}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Assertion details */}
        {feedback.showPassFail && (
          <AssertionDetails result={result} showDetails={feedback.showAssertionDetails} />
        )}

        {/* Hints */}
        {feedback.showHints && totalHints > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Hints ({hintsRevealed}/{totalHints})
              </span>
              {hintsRevealed < totalHints && (
                <Button variant="ghost" size="sm" onClick={revealNextHint}>
                  Show next hint
                </Button>
              )}
            </div>
            {hintsRevealed > 0 && (
              <ul className="space-y-1.5">
                {hints.slice(0, hintsRevealed).map((hint, i) => (
                  <li
                    key={i}
                    className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
                  >
                    {hint}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Code view toggles */}
        {(canShowDiff || canShowSolution) && (
          <div className="mt-4 border-t border-border pt-4">
            <span className="mb-2 block text-sm font-medium text-foreground">View</span>
            <div className="flex gap-1">
              <CodeViewButton
                active={resultsCodeView === 'submitted'}
                onClick={() => setResultsCodeView('submitted')}
              >
                Submitted
              </CodeViewButton>
              {canShowDiff && (
                <CodeViewButton
                  active={resultsCodeView === 'diff'}
                  onClick={() => setResultsCodeView('diff')}
                >
                  Diff
                </CodeViewButton>
              )}
              {canShowSolution && (
                <CodeViewButton
                  active={resultsCodeView === 'solution'}
                  onClick={() => setResultsCodeView('solution')}
                >
                  Solution
                </CodeViewButton>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-3">
        <div>
          {packSlug && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/pack/${packSlug}`}>Back to pack</Link>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
          {nextChallengeId && passed && (
            <Button size="sm" asChild>
              <Link href={challengeHref(nextChallengeId, packSlug)}>Next</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded px-2 py-1 text-xs transition-colors',
        active
          ? 'bg-background text-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function AssertionDetails({
  result,
  showDetails,
}: {
  result: VerificationResult;
  showDetails: boolean;
}) {
  return (
    <div className="space-y-3">
      {result.fileResults.map((fileResult) => (
        <div key={fileResult.file}>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">{fileResult.file}</span>
            <Badge
              variant={fileResult.passed ? 'pass' : 'fail'}
              className="px-1.5 py-0 text-[10px]"
            >
              {fileResult.passed ? 'pass' : 'fail'}
            </Badge>
          </div>
          <ul className="space-y-1">
            {fileResult.results.map((r, i) => (
              <li
                key={i}
                className={cn(
                  'rounded px-2 py-1 text-xs',
                  r.passed ? 'bg-pass/10 text-pass' : 'bg-fail/10 text-fail',
                )}
              >
                <span className="mr-1.5">{r.passed ? '[pass]' : '[fail]'}</span>
                {r.assertion.description}
                {!r.passed && showDetails && (
                  <span className="ml-1 text-muted-foreground">-- {r.message}</span>
                )}
                {!r.passed && showDetails && r.location && r.location.line > 0 && (
                  <span className="ml-1 text-muted-foreground">(line {r.location.line})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {result.crossFileResults.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-medium text-foreground">Cross-file</div>
          <ul className="space-y-1">
            {result.crossFileResults.map((r, i) => (
              <li
                key={i}
                className={cn(
                  'rounded px-2 py-1 text-xs',
                  r.passed ? 'bg-pass/10 text-pass' : 'bg-fail/10 text-fail',
                )}
              >
                <span className="mr-1.5">{r.passed ? '[pass]' : '[fail]'}</span>
                {r.assertion.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
