'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPacks, fetchPackChallenges } from '@/lib/api-client';
import { applyAnonymousPassedCounts, applyAnonymousStatuses } from '@/lib/anonymous-attempt-status';
import { useAuthSession } from '@/hooks/use-auth-session';
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
  const { status } = useAuthSession();
  const isAuthenticated = status === 'authenticated';
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

  let packs = applyAnonymousPassedCounts(data.packs, isAuthenticated);

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
  const { status } = useAuthSession();
  const isAuthenticated = status === 'authenticated';
  const { data, isLoading, error } = useQuery({
    queryKey: ['pack-challenges', slug],
    queryFn: () => {
      if (!slug) throw new Error('slug is required');
      return fetchPackChallenges(slug);
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return { pack: null, challenges: [], isLoading: true };
  }

  if (error || data === undefined) {
    return { pack: null, challenges: [], isLoading: false };
  }

  return {
    pack: data.pack,
    challenges: applyAnonymousStatuses(data.challenges, isAuthenticated),
    isLoading: false,
  };
}
