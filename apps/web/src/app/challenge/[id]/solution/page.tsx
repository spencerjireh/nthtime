import { redirect } from 'next/navigation';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { challengeHref } from '@/lib/routes';
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

  if (!isFeatureEnabled('solutionView')) {
    redirect(challengeHref(id, pack, 'editor'));
  }

  return <SolutionView challengeId={id} packSlug={pack} />;
}
