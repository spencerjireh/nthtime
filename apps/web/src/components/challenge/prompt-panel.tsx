'use client';

import { useCallback, useState } from 'react';
import { useEditorStore } from './editor-store-context';
import { PromptText } from './prompt-text';
import { CollapsibleSection } from './collapsible-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const EMPTY_TAGS: string[] = [];

export function PromptPanel() {
  const title = useEditorStore((s) => s.challengeMetadata?.title ?? '');
  const prompt = useEditorStore((s) => s.challengeMetadata?.prompt ?? '');
  const difficulty = useEditorStore((s) => s.challengeMetadata?.difficulty);
  const tags = useEditorStore((s) => s.challengeMetadata?.tags ?? EMPTY_TAGS);
  const hints = useEditorStore((s) => s.hints);
  const hintsRevealed = useEditorStore((s) => s.hintsRevealed);
  const totalHints = useEditorStore((s) => s.totalHints);
  const revealNextHint = useEditorStore((s) => s.revealNextHint);

  const [challengeOpen, setChallengeOpen] = useState(true);
  const [hintsOpen, setHintsOpen] = useState(false);

  const toggleChallenge = useCallback(() => {
    // Cannot close if it's the last open section
    if (challengeOpen && !hintsOpen) return;
    setChallengeOpen((o) => !o);
  }, [challengeOpen, hintsOpen]);

  const toggleHints = useCallback(() => {
    // Cannot close if it's the last open section
    if (hintsOpen && !challengeOpen) return;
    setHintsOpen((o) => !o);
  }, [hintsOpen, challengeOpen]);

  const unrevealed = totalHints - hintsRevealed;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <CollapsibleSection title="Challenge" open={challengeOpen} onToggle={toggleChallenge}>
        <h2 className="font-sans text-lg font-semibold text-foreground">{title}</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {difficulty && <Badge variant={difficulty}>{difficulty}</Badge>}
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="prose prose-sm dark:prose-invert mt-4 max-w-none text-muted-foreground">
          <PromptText prompt={prompt} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Hints"
        open={hintsOpen}
        onToggle={toggleHints}
        badge={unrevealed > 0 ? `${unrevealed} available` : undefined}
      >
        {hintsRevealed > 0 && (
          <ul className="mb-3 space-y-1.5">
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
        {hintsRevealed < totalHints && (
          <Button variant="ghost" size="sm" onClick={revealNextHint}>
            Show next hint
          </Button>
        )}
        {totalHints === 0 && (
          <p className="text-sm text-muted-foreground">No hints available</p>
        )}
      </CollapsibleSection>
    </div>
  );
}
