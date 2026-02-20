'use client';

import { ChallengeRow } from './challenge-row';
import { ChallengeListSkeleton } from './challenge-list-skeleton';
import { EmptyState } from './empty-state';
import type { Difficulty } from '@nthtime/shared';

interface ChallengeData {
  _id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  timeEstimateSeconds: number;
  order: number;
  status: 'not-attempted' | 'failed' | 'passed';
}

interface ChallengeListProps {
  challenges: ChallengeData[] | undefined;
  isLoading: boolean;
}

export function ChallengeList({ challenges, isLoading }: ChallengeListProps) {
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
          difficulty={challenge.difficulty as Difficulty}
          tags={challenge.tags}
          timeEstimateSeconds={challenge.timeEstimateSeconds}
          status={challenge.status}
        />
      ))}
    </div>
  );
}
