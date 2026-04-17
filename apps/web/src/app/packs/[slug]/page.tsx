import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

import { BackLink } from '@/components/chrome/back-link';
import { PackPage } from '@/components/catalog/pack-page';
import { serverFetchPackChallenges, serverFetchTrack } from '@/lib/server-api-client';

interface PackRouteProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function PackRoute({ params, searchParams }: PackRouteProps) {
  const { slug } = await params;
  const { from } = await searchParams;

  const data = await serverFetchPackChallenges(slug);
  if (data === null) notFound();

  const backLink = await resolveBackLink(from ?? null);

  const queryClient = new QueryClient();
  queryClient.setQueryData(['pack-challenges', slug], data);

  return (
    <>
      <div className="mx-auto w-full max-w-screen-2xl px-9 pt-6">
        <BackLink href={backLink.href} label={backLink.label} />
      </div>
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

async function resolveBackLink(
  fromTrackSlug: string | null,
): Promise<{ href: string; label: string }> {
  if (fromTrackSlug) {
    const track = await serverFetchTrack(fromTrackSlug);
    if (track) {
      return { href: `/tracks/${track.slug}`, label: track.title };
    }
  }
  return { href: '/catalog', label: 'Catalog' };
}
