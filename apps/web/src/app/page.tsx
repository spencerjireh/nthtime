import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { CatalogPage } from '@/components/catalog/catalog-page';
import type { CompletionStatus } from '@/components/catalog/catalog-filters';
import {
  serverFetchPacks,
  serverFetchTracks,
} from '@/lib/server-api-client';

interface HomeProps {
  searchParams: Promise<{
    q?: string;
    language?: string;
    difficulty?: string;
    tags?: string;
    status?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  // usePackList uses `filters.language`, `filters.difficulty`, `filters.tags`
  // RAW in its queryKey (see use-packs.ts). CatalogPage passes `language`/
  // `difficulty` as possibly-empty strings and `selectedTags` as a possibly-
  // empty array. The RSC queryKey must match that exact shape or the
  // hydrated cache entry will miss on the client.
  const language = params.language ?? '';
  const difficulty = params.difficulty ?? '';
  const tagsArray = params.tags
    ? params.tags.split(',').filter(Boolean)
    : [];

  // Fetch directly (not via prefetchQuery) so server errors propagate to
  // Next.js instead of being caught by TanStack Query's internal handling.
  // See apps/web/src/app/pack/[slug]/page.tsx for the reasoning.
  //
  // Two pack fetches: one filtered (for the grid + TanStack cache hydration)
  // and one unfiltered (for the context strip stats). The unfiltered call is
  // heavily cacheable via Next's data cache (5-minute revalidate), so the
  // second fetch is effectively free on warm renders. We want the strip to
  // reflect the catalog's total size regardless of active filters — it's an
  // identity signal, not a filter indicator.
  const hasFilters =
    Boolean(language) || Boolean(difficulty) || tagsArray.length > 0;
  const [packsData, tracksData, allPacksData] = await Promise.all([
    serverFetchPacks({
      language: language || undefined,
      difficulty: difficulty || undefined,
      tags: tagsArray.length ? tagsArray : undefined,
    }),
    serverFetchTracks(),
    hasFilters ? serverFetchPacks() : Promise.resolve(null),
  ]);

  const statsSource = allPacksData ?? packsData;
  const trackCount = tracksData.length;
  const packCount = statsSource.packs.length;
  const challengeCount = statsSource.packs.reduce(
    (sum, pack) => sum + pack.challengeCount,
    0,
  );

  const queryClient = new QueryClient();
  queryClient.setQueryData(['packs', language, difficulty, tagsArray], packsData);
  queryClient.setQueryData(['tracks'], tracksData);

  return (
    <HydrationBoundary
      state={dehydrate(queryClient, {
        shouldDehydrateQuery: (query) => query.state.status === 'success',
      })}
    >
      <CatalogPage
        searchQuery={params.q ?? ''}
        language={params.language ?? ''}
        difficulty={params.difficulty ?? ''}
        tags={params.tags ?? ''}
        status={(params.status ?? '') as CompletionStatus}
        trackCount={trackCount}
        packCount={packCount}
        challengeCount={challengeCount}
      />
    </HydrationBoundary>
  );
}
