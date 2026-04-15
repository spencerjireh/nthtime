import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { CatalogPage } from '@/components/catalog/catalog-page';
import type { CompletionStatus } from '@/components/catalog/catalog-filters';
import { serverFetchPacks, serverFetchTracks } from '@/lib/server-api-client';

interface CatalogRouteProps {
  searchParams: Promise<{
    q?: string;
    language?: string;
    difficulty?: string;
    tags?: string;
    status?: string;
  }>;
}

export default async function Catalog({ searchParams }: CatalogRouteProps) {
  const params = await searchParams;

  // Mirrors the raw shape `usePackList` reads for its TanStack queryKey
  // (see use-packs.ts) so the SSR cache entry lines up with the client one.
  const language = params.language ?? '';
  const difficulty = params.difficulty ?? '';
  const tagsArray = params.tags ? params.tags.split(',').filter(Boolean) : [];

  const hasFilters = Boolean(language) || Boolean(difficulty) || tagsArray.length > 0;
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
  const challengeCount = statsSource.packs.reduce((sum, pack) => sum + pack.challengeCount, 0);

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
