import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/chrome/breadcrumbs';
import { TrackPage } from '@/components/catalog/track-page';
import { trackBreadcrumbs } from '@/lib/breadcrumb-source';
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
    <>
      <Breadcrumbs items={trackBreadcrumbs(data.title)} />
      <HydrationBoundary
        state={dehydrate(queryClient, {
          shouldDehydrateQuery: (query) => query.state.status === 'success',
        })}
      >
        <TrackPage slug={slug} />
      </HydrationBoundary>
    </>
  );
}
