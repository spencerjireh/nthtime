'use client';

import { useEditorStore } from './editor-store-context';
import { PromptText } from './prompt-text';
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

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="mb-4">
        <h2 className="font-sans text-lg font-semibold text-foreground">{title}</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {difficulty && (
            <Badge variant={difficulty}>{difficulty}</Badge>
          )}
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="prose prose-sm prose-invert mb-6 max-w-none flex-1 text-muted-foreground">
        <PromptText prompt={prompt} />
      </div>

      <div className="border-t border-border pt-4">
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
    </div>
  );
}
