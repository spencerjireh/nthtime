import { notFound, redirect } from 'next/navigation';

import { SolutionView } from '@/components/challenge/solution-view';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { challengeHrefBySlug } from '@/lib/routes';
import { serverFetchChallengeBySlug } from '@/lib/server-api-client';

interface SolutionRouteProps {
  params: Promise<{ slug: string; challengeSlug: string }>;
}

export default async function SolutionRoute({ params }: SolutionRouteProps) {
  const { slug: packSlug, challengeSlug } = await params;

  if (!isFeatureEnabled('solutionView')) {
    redirect(challengeHrefBySlug(packSlug, challengeSlug, 'editor'));
  }

  const challenge = await serverFetchChallengeBySlug(packSlug, challengeSlug);
  if (challenge === null) notFound();

  return <SolutionView challenge={challenge} packSlug={packSlug} />;
}
