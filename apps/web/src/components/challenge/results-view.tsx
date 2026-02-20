'use client';

import { useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { useEditorStore } from './editor-store-context';
import { MonacoWrapper } from './monaco-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSettingsStore } from '@/lib/settings-store';
import { FeedbackLevel } from '@nthtime/shared';
import { getMonacoLanguage, formatTime } from '@nthtime/editor';
import { cn } from '@/lib/utils';
import type { VerificationResult, FileVerificationResult } from '@nthtime/shared';

interface ResultsViewProps {
  children?: React.ReactNode;
}

export function ResultsView({ children }: ResultsViewProps) {
  const result = useEditorStore((s) => s.verificationResult);
  const submittedFiles = useEditorStore((s) => s.submittedFiles);
  const scaffoldFiles = useEditorStore((s) => s.scaffoldFiles);
  const timer = useEditorStore((s) => s.timer);
  const hintsRevealed = useEditorStore((s) => s.hintsRevealed);
  const hints = useEditorStore((s) => s.hints);
  const totalHints = useEditorStore((s) => s.totalHints);
  const revealNextHint = useEditorStore((s) => s.revealNextHint);
  const feedbackLevel = useStore(getSettingsStore(), (s) => s.settings.feedbackLevel);

  const filePaths = useMemo(
    () => (submittedFiles ? Object.keys(submittedFiles) : []),
    [submittedFiles],
  );
  const [activeFile, setActiveFile] = useState(() => filePaths[0] ?? null);
  const [showDiff, setShowDiff] = useState(false);

  if (!result || !submittedFiles) return null;

  const activeContent = activeFile ? submittedFiles[activeFile]?.content ?? '' : '';
  const language = activeFile ? getMonacoLanguage(activeFile) : 'plaintext';

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Banner */}
      <ResultsBanner result={result} elapsedSeconds={timer.elapsedSeconds} />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: assertion details */}
        <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-r border-border p-4">
          {feedbackLevel >= FeedbackLevel.PassFail && (
            <AssertionDetails result={result} feedbackLevel={feedbackLevel} />
          )}

          {feedbackLevel >= FeedbackLevel.Hints && hintsRevealed < totalHints && (
            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Hints ({hintsRevealed}/{totalHints})
                </span>
                <Button variant="ghost" size="sm" onClick={revealNextHint}>
                  Show next hint
                </Button>
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
        </div>

        {/* Right: code viewer */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* File tabs */}
          <div className="flex shrink-0 items-center border-b border-border bg-muted/30">
            <div className="flex flex-1">
              {filePaths.map((path) => (
                <button
                  key={path}
                  onClick={() => {
                    setActiveFile(path);
                    setShowDiff(false);
                  }}
                  className={cn(
                    'border-r border-border px-3 py-1.5 text-xs transition-colors',
                    path === activeFile && !showDiff
                      ? 'bg-background text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {path}
                  <FileStatusBadge
                    fileResult={result.fileResults.find((f) => f.file === path)}
                  />
                </button>
              ))}
            </div>
            {feedbackLevel >= FeedbackLevel.FullDiagnostics && scaffoldFiles && (
              <button
                onClick={() => setShowDiff(!showDiff)}
                className={cn(
                  'border-l border-border px-3 py-1.5 text-xs transition-colors',
                  showDiff
                    ? 'bg-background text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                Diff
              </button>
            )}
          </div>

          {/* Code view */}
          <div className="flex-1">
            {showDiff && activeFile && scaffoldFiles ? (
              <DiffViewLazy
                originalContent={scaffoldFiles[activeFile]?.content ?? ''}
                modifiedContent={activeContent}
                language={language}
              />
            ) : (
              <MonacoWrapper
                value={activeContent}
                language={language}
                theme="vs-dark"
                options={{ readOnly: true }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      {children}
    </div>
  );
}

function ResultsBanner({
  result,
  elapsedSeconds,
}: {
  result: VerificationResult;
  elapsedSeconds: number;
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-between px-4 py-3',
        result.passed ? 'bg-pass/10' : 'bg-fail/10',
      )}
    >
      <div className="flex items-center gap-3">
        <Badge variant={result.passed ? 'pass' : 'fail'} className="text-sm">
          {result.passed ? 'All Passed' : 'Some Failed'}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {result.passedAssertions}/{result.totalAssertions} assertions passed
        </span>
      </div>
      <span className="font-mono text-xs text-muted-foreground">
        {formatTime(elapsedSeconds)}
      </span>
    </div>
  );
}

function FileStatusBadge({
  fileResult,
}: {
  fileResult?: FileVerificationResult;
}) {
  if (!fileResult) return null;
  return (
    <span
      className={cn(
        'ml-1.5 inline-block h-1.5 w-1.5 rounded-full',
        fileResult.passed ? 'bg-pass' : 'bg-fail',
      )}
    />
  );
}

function AssertionDetails({
  result,
  feedbackLevel,
}: {
  result: VerificationResult;
  feedbackLevel: FeedbackLevel;
}) {
  return (
    <div className="space-y-3">
      {result.fileResults.map((fileResult) => (
        <div key={fileResult.file}>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">
              {fileResult.file}
            </span>
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
                <span className="mr-1.5">
                  {r.passed ? '[pass]' : '[fail]'}
                </span>
                {r.assertion.description}
                {!r.passed &&
                  feedbackLevel >= FeedbackLevel.AssertionDetails && (
                    <span className="ml-1 text-muted-foreground">
                      -- {r.message}
                    </span>
                  )}
                {!r.passed &&
                  feedbackLevel >= FeedbackLevel.AssertionDetails &&
                  r.location &&
                  r.location.line > 0 && (
                    <span className="ml-1 text-muted-foreground">
                      (line {r.location.line})
                    </span>
                  )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {result.crossFileResults.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-medium text-foreground">
            Cross-file
          </div>
          <ul className="space-y-1">
            {result.crossFileResults.map((r, i) => (
              <li
                key={i}
                className={cn(
                  'rounded px-2 py-1 text-xs',
                  r.passed ? 'bg-pass/10 text-pass' : 'bg-fail/10 text-fail',
                )}
              >
                <span className="mr-1.5">
                  {r.passed ? '[pass]' : '[fail]'}
                </span>
                {r.assertion.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Lazy-loaded diff view to avoid loading Monaco DiffEditor upfront
import dynamic from 'next/dynamic';

const DiffViewLazy = dynamic(
  () => import('./diff-view').then((m) => ({ default: m.DiffView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-background text-muted-foreground">
        Loading diff view...
      </div>
    ),
  },
);
