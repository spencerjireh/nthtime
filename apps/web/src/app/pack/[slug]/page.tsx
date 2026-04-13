import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { PackPage } from '@/components/catalog/pack-page';
import { serverFetchPackChallenges } from '@/lib/server-api-client';

interface PackRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function PackRoute({ params }: PackRouteProps) {
  const { slug } = await params;

  const data = await serverFetchPackChallenges(slug);
  if (data === null) notFound();

  const queryClient = new QueryClient();
  queryClient.setQueryData(['pack-challenges', slug], data);

  return (
    <HydrationBoundary
      state={dehydrate(queryClient, {
        shouldDehydrateQuery: (query) => query.state.status === 'success',
      })}
    >
      <PackPage slug={slug} />
    </HydrationBoundary>
  );
}
