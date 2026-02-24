import { SolutionView } from '@/components/challenge/solution-view';

interface SolutionPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pack?: string }>;
}

export default async function SolutionPage({
  params,
  searchParams,
}: SolutionPageProps) {
  const { id } = await params;
  const { pack } = await searchParams;
  return <SolutionView challengeId={id} packSlug={pack} />;
}
