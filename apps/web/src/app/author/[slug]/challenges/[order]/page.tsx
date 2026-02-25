'use client';

import { use } from 'react';
import { ChallengeEditor } from '@/components/author/challenge-editor';
import { useAuthorPack, useAuthorChallenge } from '@/hooks/use-author';

interface EditChallengeRouteProps {
  params: Promise<{ slug: string; order: string }>;
}

export default function EditChallengeRoute({ params }: EditChallengeRouteProps) {
  const { slug, order } = use(params);
  return <EditChallengeLoader packSlug={slug} order={parseInt(order, 10)} />;
}

function EditChallengeLoader({ packSlug, order }: { packSlug: string; order: number }) {
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
