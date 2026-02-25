'use client';

import { use } from 'react';
import Link from 'next/link';
import { useAuthorPack, useAuthorChallenge } from '@/hooks/use-author';
import { ChallengeView } from '@/components/challenge/challenge-view';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Challenge, Difficulty, AssertionSet } from '@nthtime/shared';

interface PreviewRouteProps {
  params: Promise<{ slug: string; order: string }>;
}

export default function PreviewRoute({ params }: PreviewRouteProps) {
  const { slug, order } = use(params);
  return <PreviewLoader packSlug={slug} order={parseInt(order, 10)} />;
}

function PreviewLoader({ packSlug, order }: { packSlug: string; order: number }) {
  const { pack, isLoading: packLoading } = useAuthorPack(packSlug);

  if (packLoading) {
    return (
      <div className="mx-auto flex max-w-screen-2xl items-center justify-center px-9 py-16 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="mx-auto flex max-w-screen-2xl items-center justify-center px-9 py-16 text-muted-foreground">
        Pack not found.
      </div>
    );
  }

  const challengeSummary = pack.challenges.find(
    (c: { order: number }) => c.order === order,
  );

  if (!challengeSummary) {
    return (
      <div className="mx-auto flex max-w-screen-2xl items-center justify-center px-9 py-16 text-muted-foreground">
        Challenge not found.
      </div>
    );
  }

  return <PreviewInner packSlug={packSlug} challengeId={challengeSummary._id} order={order} />;
}

function PreviewInner({
  packSlug,
  challengeId,
  order,
}: {
  packSlug: string;
  challengeId: string;
  order: number;
}) {
  const { challenge, isLoading } = useAuthorChallenge(challengeId);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-screen-2xl items-center justify-center px-9 py-16 text-muted-foreground">
        Loading challenge...
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="mx-auto flex max-w-screen-2xl items-center justify-center px-9 py-16 text-muted-foreground">
        Challenge not found.
      </div>
    );
  }

  // Map Convex challenge document to Challenge type
  const challengeData: Challenge = {
    id: challenge._id,
    title: challenge.title,
    prompt: challenge.prompt,
    difficulty: challenge.difficulty as Difficulty,
    tags: challenge.tags,
    timeEstimateSeconds: challenge.timeEstimateSeconds,
    scaffolded: challenge.scaffolded,
    files: challenge.files,
    hints: challenge.hints,
    assertions: challenge.assertions as AssertionSet,
    referenceSolution: challenge.referenceSolution,
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center gap-2 border-b border-border bg-amber-500/10 px-4 py-1.5">
        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
          Preview Mode
        </span>
        <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs" asChild>
          <Link href={`/author/${packSlug}/challenges/${order}`}>
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to editor
          </Link>
        </Button>
      </div>
      <div className="flex-1">
        <ChallengeView
          challengeId={`preview-${challengeId}`}
          challenge={challengeData}
          packSlug={packSlug}
        />
      </div>
    </div>
  );
}
