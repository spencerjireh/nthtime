import { ChallengeView } from '@/components/challenge/challenge-view';

interface ChallengePageProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { id } = await params;
  return <ChallengeView challengeId={id} />;
}
