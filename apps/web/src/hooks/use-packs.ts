'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPacks, fetchPackChallenges } from '@/lib/api-client';
import type { PackSummary } from '@nthtime/data-access';
import type { CompletionStatus } from '@/components/catalog/catalog-filters';

interface PackListFilters {
  language?: string;
  difficulty?: string;
  tags?: string[];
  status?: CompletionStatus;
  searchQuery?: string;
}

export function usePackList(filters: PackListFilters) {
  const { data, isLoading } = useQuery({
    queryKey: ['packs', filters.language, filters.difficulty, filters.tags],
    queryFn: () =>
      fetchPacks({
        language: filters.language || undefined,
        difficulty: filters.difficulty || undefined,
        tags: filters.tags?.length ? filters.tags : undefined,
      }),
  });

  if (!data) {
    return { packs: [] as PackSummary[], availableTags: [] as string[], isLoading };
  }

  let packs = [...data.packs] as PackSummary[];

  // Client-side search
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    packs = packs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  // Client-side status filter
  if (filters.status) {
    packs = packs.filter((p) => {
      if (filters.status === 'not-started') return p.passedCount === 0;
      if (filters.status === 'completed') return p.passedCount === p.challengeCount;
      if (filters.status === 'in-progress')
        return p.passedCount > 0 && p.passedCount < p.challengeCount;
      return true;
    });
  }

  return { packs, availableTags: [...data.availableTags], isLoading: false };
}

export function useChallenges(slug: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['pack-challenges', slug],
    queryFn: () => fetchPackChallenges(slug!),
    enabled: !!slug,
  });

  if (isLoading || data === undefined) {
    return { pack: null, challenges: [], isLoading: true };
  }

  return {
    pack: data.pack,
    challenges: [...data.challenges],
    isLoading: false,
  };
}
