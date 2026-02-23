'use client';

import { useState } from 'react';
import { useStore } from 'zustand';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SolutionPanel } from './solution-panel';
import { getAssertionTechnicalDetail } from './assertion-detail';
import { getSettingsStore } from '@/lib/settings-store';
import { getMonacoLanguage, formatTime } from '@nthtime/editor';
import { challengeHref } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { Challenge, Assertion } from '@nthtime/shared';

interface ChallengeDetailViewProps {
  challenge: Challenge;
  challengeId: string;
  packSlug?: string;
}

export function ChallengeDetailView({
  challenge,
  challengeId,
  packSlug,
}: ChallengeDetailViewProps) {
  const feedback = useStore(getSettingsStore(), (s) => s.settings.feedback);
  const language = challenge.files.length > 0
    ? getMonacoLanguage(challenge.files[0].path)
    : undefined;

  const editorHref = challengeHref(challengeId, packSlug);
  const backHref = packSlug ? `/pack/${packSlug}` : '/';

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-6 py-8">
        {/* Back link */}
        <Link
          href={backHref}
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; {packSlug ? 'Back to pack' : 'Back to catalog'}
        </Link>

        {/* Header */}
        <header className="mb-8">
          <h1 className="mb-3 text-2xl font-bold text-foreground">{challenge.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={challenge.difficulty}>{challenge.difficulty}</Badge>
            {language && (
              <Badge variant="outline">{language}</Badge>
            )}
            {challenge.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {challenge.timeEstimateSeconds > 0 && (
              <span className="text-sm text-muted-foreground">
                est. {formatTime(challenge.timeEstimateSeconds)}
              </span>
            )}
          </div>
        </header>

        {/* Description */}
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Description</h2>
          <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
            {challenge.prompt.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <p key={i} className="font-semibold text-foreground">
                    {line.replace(/\*\*/g, '')}
                  </p>
                );
              }
              if (line.startsWith('- ') || line.match(/^\d+\./)) {
                return (
                  <p key={i} className="ml-2">
                    {line}
                  </p>
                );
              }
              if (line.trim() === '') return <br key={i} />;
              return <p key={i}>{line}</p>;
            })}
          </div>
        </section>

        {/* Assertions */}
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Assertions</h2>
          <div className="space-y-3">
            {Object.entries(challenge.assertions.perFile).map(([file, assertions]) => (
              <AssertionFileGroup
                key={file}
                file={file}
                assertions={assertions}
                showDetails={feedback.showAssertionDetails}
                showHints={feedback.showHints}
              />
            ))}
            {challenge.assertions.crossFile.length > 0 && (
              <AssertionFileGroup
                file="Cross-file"
                assertions={challenge.assertions.crossFile}
                showDetails={feedback.showAssertionDetails}
                showHints={feedback.showHints}
              />
            )}
          </div>
        </section>

        {/* Hints */}
        {feedback.showHints && challenge.hints.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Hints</h2>
            <ul className="space-y-2">
              {challenge.hints.map((hint, i) => (
                <li
                  key={i}
                  className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
                >
                  {hint}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Reference Solution */}
        {challenge.referenceSolution !== undefined && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Reference Solution</h2>
            {feedback.showSolution ? (
              <ReferenceSolutionViewer files={challenge.referenceSolution} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Enable &quot;Show reference solution&quot; in settings to view.
              </p>
            )}
          </section>
        )}

        {/* CTA */}
        <div className="border-t border-border pt-8">
          <Button asChild size="lg">
            <Link href={editorHref}>Start Challenge</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function AssertionFileGroup({
  file,
  assertions,
  showDetails,
  showHints,
}: {
  file: string;
  assertions: readonly Assertion[];
  showDetails: boolean;
  showHints: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted/30"
      >
        <span className="text-sm font-medium text-foreground">{file}</span>
        <span className="text-xs text-muted-foreground">
          {assertions.length} assertion{assertions.length !== 1 ? 's' : ''}
        </span>
      </button>
      {expanded && (
        <ul className="border-t border-border px-4 py-2 space-y-1.5">
          {assertions.map((assertion, i) => (
            <li key={i} className="text-sm">
              <span className="text-muted-foreground">{assertion.description}</span>
              {showDetails && (
                <span className="ml-2 font-mono text-xs text-muted-foreground/70">
                  {getAssertionTechnicalDetail(assertion)}
                </span>
              )}
              {showHints && assertion.hint && (
                <p className="ml-4 mt-0.5 text-xs text-muted-foreground/70">
                  Hint: {assertion.hint}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReferenceSolutionViewer({
  files,
}: {
  files: readonly { path: string; content: string }[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFile = files[activeIndex];
  const language = activeFile ? getMonacoLanguage(activeFile.path) : 'plaintext';

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {files.length > 1 && (
        <div className="flex border-b border-border bg-muted/30">
          {files.map((file, i) => (
            <button
              key={file.path}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'px-3 py-1.5 text-xs transition-colors',
                i === activeIndex
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {file.path}
            </button>
          ))}
        </div>
      )}
      {activeFile && (
        <div className="h-80">
          <SolutionPanel content={activeFile.content} language={language} />
        </div>
      )}
    </div>
  );
}
