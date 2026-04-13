import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { TrackPage } from '@/components/catalog/track-page';
import { serverFetchTrack } from '@/lib/server-api-client';

export default async function TrackRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await serverFetchTrack(slug);
  if (data === null) notFound();

  const queryClient = new QueryClient();
  queryClient.setQueryData(['track', slug], data);

  return (
    <HydrationBoundary
      state={dehydrate(queryClient, {
        shouldDehydrateQuery: (query) => query.state.status === 'success',
      })}
    >
      <TrackPage slug={slug} />
    </HydrationBoundary>
  );
}
