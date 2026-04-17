import { notFound } from 'next/navigation';

import { ChallengeView } from '@/components/challenge/challenge-view';
import { serverFetchChallengeBySlug } from '@/lib/server-api-client';

interface ChallengeRouteProps {
  params: Promise<{ slug: string; challengeSlug: string }>;
  searchParams: Promise<{ view?: string }>;
}

export default async function ChallengeRoute({
  params,
  searchParams,
}: ChallengeRouteProps) {
  const { slug: packSlug, challengeSlug } = await params;
  const { view } = await searchParams;

  const challenge = await serverFetchChallengeBySlug(packSlug, challengeSlug);
  if (challenge === null) notFound();

  return (
    <ChallengeView
      challengeId={challenge.id}
      packSlug={packSlug}
      challenge={challenge}
      initialView={view === 'details' ? 'details' : undefined}
    />
  );
}
