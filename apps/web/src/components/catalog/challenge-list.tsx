'use client';

import { ChallengeRow } from './challenge-row';
import { ChallengeListSkeleton } from './challenge-list-skeleton';
import { EmptyState } from './empty-state';
import type { ChallengeSummary } from '@nthtime/data-access';

interface ChallengeListProps {
  challenges: ChallengeSummary[] | undefined;
  isLoading: boolean;
  packSlug?: string;
}

export function ChallengeList({
  challenges,
  isLoading,
  packSlug,
}: ChallengeListProps) {
  if (isLoading) {
    return <ChallengeListSkeleton />;
  }

  if (!challenges || challenges.length === 0) {
    return <EmptyState variant="no-challenges" />;
  }

  const sorted = [...challenges].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((challenge) => (
        <ChallengeRow
          key={challenge._id}
          id={challenge._id}
          order={challenge.order}
          title={challenge.title}
          difficulty={challenge.difficulty}
          tags={challenge.tags}
          status={challenge.status}
          packSlug={packSlug}
        />
      ))}
    </div>
  );
}
