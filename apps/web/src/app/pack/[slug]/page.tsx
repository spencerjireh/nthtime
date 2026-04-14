import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/chrome/breadcrumbs';
import { PackPage } from '@/components/catalog/pack-page';
import { resolvePackBreadcrumb } from '@/lib/breadcrumb-source';
import { serverFetchPackChallenges } from '@/lib/server-api-client';

interface PackRouteProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function PackRoute({
  params,
  searchParams,
}: PackRouteProps) {
  const { slug } = await params;
  const { from } = await searchParams;

  const data = await serverFetchPackChallenges(slug);
  if (data === null) notFound();

  const breadcrumbItems = await resolvePackBreadcrumb(
    slug,
    data.pack.name,
    from ?? null,
  );

  const queryClient = new QueryClient();
  queryClient.setQueryData(['pack-challenges', slug], data);

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <HydrationBoundary
        state={dehydrate(queryClient, {
          shouldDehydrateQuery: (query) => query.state.status === 'success',
        })}
      >
        <PackPage slug={slug} />
      </HydrationBoundary>
    </>
  );
}
