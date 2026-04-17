'use client';

import { use } from 'react';
import { ChallengeEditor } from '@/components/author/challenge-editor';
import { useAuthorPack, useAuthorChallenge } from '@/hooks/use-author';

interface EditChallengeRouteProps {
  params: Promise<{ slug: string; challengeSlug: string }>;
}

export default function EditChallengeRoute({ params }: EditChallengeRouteProps) {
  const { slug, challengeSlug } = use(params);
  return <EditChallengeLoader packSlug={slug} challengeSlug={challengeSlug} />;
}

function EditChallengeLoader({
  packSlug,
  challengeSlug,
}: {
  packSlug: string;
  challengeSlug: string;
}) {
  const { pack, isLoading } = useAuthorPack(packSlug);

  if (isLoading) {
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

  const challengeSummary = pack.challenges.find((c) => c.slug === challengeSlug);

  if (!challengeSummary) {
    return (
      <div className="mx-auto flex max-w-screen-2xl items-center justify-center px-9 py-16 text-muted-foreground">
        Challenge not found.
      </div>
    );
  }

  return <EditChallengeInner packSlug={packSlug} challengeId={challengeSummary._id} />;
}

function EditChallengeInner({
  packSlug,
  challengeId,
}: {
  packSlug: string;
  challengeId: string;
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

  return <ChallengeEditor packSlug={packSlug} existingChallenge={challenge} />;
}
