import { ChallengeView } from '@/components/challenge/challenge-view';

interface ChallengePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pack?: string }>;
}

export default async function ChallengePage({
  params,
  searchParams,
}: ChallengePageProps) {
  const { id } = await params;
  const { pack } = await searchParams;
  return <ChallengeView challengeId={id} packSlug={pack} />;
}
