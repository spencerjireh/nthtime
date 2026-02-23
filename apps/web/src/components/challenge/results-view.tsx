'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import type { OnMount } from '@monaco-editor/react';
import { useEditorStore } from './editor-store-context';
import { MonacoWrapper } from './monaco-wrapper';
import { SolutionPanel } from './solution-panel';
import { FileTree } from './file-tree';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSettingsStore } from '@/lib/settings-store';
import { getMonacoLanguage, formatTime } from '@nthtime/editor';
import { cn } from '@/lib/utils';
import { buildDecorationInputs } from '@/lib/build-result-decorations';
import type { VerificationResult } from '@nthtime/shared';

type CodeView = 'submitted' | 'diff' | 'solution';

const neverDirty = () => false;

interface ResultsViewProps {
  children?: React.ReactNode;
}

export function ResultsView({ children }: ResultsViewProps) {
  const result = useEditorStore((s) => s.verificationResult);
  const submittedFiles = useEditorStore((s) => s.submittedFiles);
  const scaffoldFiles = useEditorStore((s) => s.scaffoldFiles);
  const referenceSolutionFiles = useEditorStore((s) => s.referenceSolutionFiles);
  const timer = useEditorStore((s) => s.timer);
  const hintsRevealed = useEditorStore((s) => s.hintsRevealed);
  const hints = useEditorStore((s) => s.hints);
  const totalHints = useEditorStore((s) => s.totalHints);
  const revealNextHint = useEditorStore((s) => s.revealNextHint);
  const feedback = useStore(getSettingsStore(), (s) => s.settings.feedback);

  const filePaths = useMemo(
    () => (submittedFiles ? Object.keys(submittedFiles) : []),
    [submittedFiles],
  );
  const [activeFile, setActiveFile] = useState(() => filePaths[0] ?? null);
  const [codeView, setCodeView] = useState<CodeView>('submitted');

  const [resultsEditor, setResultsEditor] = useState<Parameters<OnMount>[0] | null>(null);
  const [resultsMonaco, setResultsMonaco] = useState<Parameters<OnMount>[1] | null>(null);
  const decorationRef = useRef<ReturnType<Parameters<OnMount>[0]['createDecorationsCollection']> | null>(null);

  const handleResultsMount: OnMount = useCallback((ed, mon) => {
    setResultsEditor(ed);
    setResultsMonaco(mon);
    ed.onDidDispose(() => {
      decorationRef.current = null;
      setResultsEditor(null);
      setResultsMonaco(null);
    });
  }, []);

  // Apply decorations for failed assertions when showAssertionDetails is on
  useEffect(() => {
    if (!resultsEditor || !resultsMonaco || !result || !activeFile) return;
    if (!feedback.showAssertionDetails) {
      if (decorationRef.current) {
        decorationRef.current.clear();
        decorationRef.current = null;
      }
      return;
    }

    const fileResult = result.fileResults.find((f) => f.file === activeFile);
    if (!fileResult) return;

    const inputs = buildDecorationInputs(fileResult.results);
    const decorations = inputs.map((d) => ({
      range: new resultsMonaco.Range(d.startLine, d.startColumn, d.endLine, d.endColumn),
      options: {
        isWholeLine: true,
        className: 'decoration-fail-line',
        glyphMarginClassName: 'decoration-fail-glyph',
        hoverMessage: { value: `**${d.description}**\n\n${d.message}` },
      },
    }));

    if (decorationRef.current) {
      decorationRef.current.clear();
    }
    decorationRef.current = resultsEditor.createDecorationsCollection(decorations);

    return () => {
      if (decorationRef.current) {
        decorationRef.current.clear();
        decorationRef.current = null;
      }
    };
  }, [resultsEditor, resultsMonaco, result, activeFile, feedback.showAssertionDetails]);

  const getFileStatus = useCallback(
    (path: string): 'pass' | 'fail' | null => {
      if (!result) return null;
      const fileResult = result.fileResults.find((f) => f.file === path);
      if (!fileResult) return null;
      return fileResult.passed ? 'pass' : 'fail';
    },
    [result],
  );

  if (!result || !submittedFiles) return null;

  const activeContent = activeFile ? submittedFiles[activeFile]?.content ?? '' : '';
  const language = activeFile ? getMonacoLanguage(activeFile) : 'plaintext';
  const showGlyphMargin = feedback.showAssertionDetails;
  const canShowDiff = feedback.showDiff && !!scaffoldFiles;
  const canShowSolution = feedback.showSolution && !!referenceSolutionFiles;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Banner */}
      <ResultsBanner result={result} elapsedSeconds={timer.elapsedSeconds} />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: assertion details */}
        <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-r border-border p-4">
          {feedback.showPassFail && (
            <AssertionDetails result={result} showDetails={feedback.showAssertionDetails} />
          )}

          {feedback.showHints && hintsRevealed < totalHints && (
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

        {/* FileTree sidebar */}
        <FileTree
          files={filePaths}
          activeFile={activeFile}
          isDirty={neverDirty}
          onSelect={setActiveFile}
          fileStatus={getFileStatus}
        />

        {/* Right: code viewer */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar: Diff / Solution toggles */}
          {(canShowDiff || canShowSolution) && (
            <div className="flex shrink-0 items-center justify-end border-b border-border bg-muted/30">
              {canShowDiff && (
                <button
                  onClick={() => setCodeView(codeView === 'diff' ? 'submitted' : 'diff')}
                  className={cn(
                    'border-l border-border px-3 py-1.5 text-xs transition-colors',
                    codeView === 'diff'
                      ? 'bg-background text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  Diff
                </button>
              )}
              {canShowSolution && (
                <button
                  onClick={() => setCodeView(codeView === 'solution' ? 'submitted' : 'solution')}
                  className={cn(
                    'border-l border-border px-3 py-1.5 text-xs transition-colors',
                    codeView === 'solution'
                      ? 'bg-background text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  Solution
                </button>
              )}
            </div>
          )}

          {/* Code view */}
          <div className="flex-1">
            {codeView === 'solution' && referenceSolutionFiles && activeFile ? (
              <SolutionPanel
                content={referenceSolutionFiles[activeFile]?.content ?? ''}
                language={language}
              />
            ) : codeView === 'diff' && activeFile && scaffoldFiles ? (
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
                onMount={handleResultsMount}
                options={{ readOnly: true, glyphMargin: showGlyphMargin }}
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
                {!r.passed && showDetails && (
                  <span className="ml-1 text-muted-foreground">
                    -- {r.message}
                  </span>
                )}
                {!r.passed &&
                  showDetails &&
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
