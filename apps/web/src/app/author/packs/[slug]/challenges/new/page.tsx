import { ChallengeEditor } from '@/components/author/challenge-editor';

interface NewChallengeRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function NewChallengeRoute({ params }: NewChallengeRouteProps) {
  const { slug } = await params;
  return <ChallengeEditor packSlug={slug} />;
}
