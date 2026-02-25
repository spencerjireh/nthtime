'use client';

import { useState } from 'react';
import { useStore } from 'zustand';
import Link from 'next/link';
import {
  Group,
  Panel,
  Separator,
} from 'react-resizable-panels';
import { Badge } from '@/components/ui/badge';
import { MonacoWrapper } from './monaco-wrapper';
import { useDataAccess } from '@/lib/data-access';
import { getSettingsStore } from '@/lib/settings-store';
import { challengeHref } from '@/lib/routes';
import { getMonacoLanguage } from '@nthtime/editor';
import { PromptText } from './prompt-text';
import { cn } from '@/lib/utils';

interface SolutionViewProps {
  challengeId: string;
  packSlug?: string;
}

export function SolutionView({ challengeId, packSlug }: SolutionViewProps) {
  const { useChallenge } = useDataAccess();
  const { challenge, isLoading } = useChallenge(challengeId);
  const showSolution = useStore(
    getSettingsStore(),
    (s) => s.settings.feedback.showSolution,
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <div className="text-muted-foreground text-sm">Challenge not found</div>
      </div>
    );
  }

  if (!showSolution) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">
          Enable &quot;Show reference solution&quot; in settings to view.
        </p>
        <Link
          href={challengeHref(challengeId, packSlug, 'details')}
          className="text-primary text-sm hover:underline"
        >
          Back to challenge
        </Link>
      </div>
    );
  }

  if (!challenge.referenceSolution?.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">
          No reference solution available for this challenge.
        </p>
        <Link
          href={challengeHref(challengeId, packSlug, 'details')}
          className="text-primary text-sm hover:underline"
        >
          Back to challenge
        </Link>
      </div>
    );
  }

  return (
    <SolutionViewContent
      challenge={challenge}
      challengeId={challengeId}
      packSlug={packSlug}
    />
  );
}

function SolutionViewContent({
  challenge,
  challengeId,
  packSlug,
}: {
  challenge: {
    title: string;
    prompt: string;
    difficulty: string;
    tags: readonly string[];
    referenceSolution?: readonly { path: string; content: string }[];
  };
  challengeId: string;
  packSlug?: string;
}) {
  const files = challenge.referenceSolution!;
  const [activeFilePath, setActiveFilePath] = useState(files[0].path);
  const activeFile = files.find((f) => f.path === activeFilePath) ?? files[0];
  const language = getMonacoLanguage(activeFile.path);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <Group
          id="nthtime-solution"
          orientation="horizontal"
        >
          <Panel id="solution-prompt" defaultSize="30%" minSize="15%">
            <div className="flex h-full flex-col overflow-y-auto p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Reference Solution
                </span>
              </div>
              <h2 className="mb-2 font-sans text-lg font-semibold text-foreground">
                {challenge.title}
              </h2>
              <div className="mb-4 flex flex-wrap gap-1.5">
                <Badge variant={challenge.difficulty as 'beginner' | 'intermediate' | 'advanced'}>
                  {challenge.difficulty}
                </Badge>
                {challenge.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="prose prose-sm prose-invert max-w-none flex-1 text-muted-foreground">
                <PromptText prompt={challenge.prompt} />
              </div>
            </div>
          </Panel>
          <Separator className="w-1 bg-border transition-colors hover:bg-primary active:bg-primary" />
          <Panel id="solution-code" defaultSize="70%" minSize="25%">
            <div className="flex h-full flex-col">
              {files.length > 1 && (
                <div className="flex shrink-0 border-b border-border bg-muted/30">
                  {files.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setActiveFilePath(file.path)}
                      className={cn(
                        'px-3 py-1.5 text-xs transition-colors',
                        file.path === activeFilePath
                          ? 'bg-background text-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {file.path}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1">
                <MonacoWrapper
                  value={activeFile.content}
                  language={language}
                  theme="vs-dark"
                  options={{ readOnly: true }}
                />
              </div>
            </div>
          </Panel>
        </Group>
      </div>
      <div className="shrink-0 border-t border-border">
        <div className="flex items-center px-4 py-2">
          <Link
            href={challengeHref(challengeId, packSlug, 'details')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back to challenge
          </Link>
        </div>
      </div>
    </div>
  );
}
