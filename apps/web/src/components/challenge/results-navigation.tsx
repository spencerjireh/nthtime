'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useEditorStore } from './editor-store-context';
import { Button } from '@/components/ui/button';
import { challengeHref } from '@/lib/routes';
import { MOCK_CHALLENGES } from '@/lib/mock-packs';

interface ResultsNavigationProps {
  onRetry: () => void;
  packSlug?: string;
}

export function ResultsNavigation({
  onRetry,
  packSlug,
}: ResultsNavigationProps) {
  const challengeId = useEditorStore((s) => s.challengeId);
  const passed = useEditorStore((s) => s.verificationResult?.passed ?? false);

  const nextChallengeId = useMemo(() => {
    if (!packSlug) return null;

    // Look up challenges for this pack from mock data
    const challenges = MOCK_CHALLENGES[packSlug];
    if (!challenges) return null;

    // Find current challenge position by matching ID
    const currentIndex = challenges.findIndex((c) => c._id === challengeId);
    if (currentIndex === -1 || currentIndex >= challenges.length - 1) return null;

    return challenges[currentIndex + 1]._id;
  }, [packSlug, challengeId]);

  return (
    <div className="flex shrink-0 items-center justify-between border-t border-border bg-muted/30 px-4 py-3">
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
            <Link href={challengeHref(nextChallengeId, packSlug)}>
              Next challenge
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
