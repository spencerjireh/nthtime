import { useCallback, useMemo } from 'react';
import { MOCK_PACKS, MOCK_CHALLENGES } from '@/lib/mock-packs';
import { MOCK_CHALLENGE, getMockChallenge } from '@/lib/mock-challenge';
import type { DataAccessHooks, PackListFilters } from './types';

function usePackListMock(filters: PackListFilters) {
  const packs = useMemo(() => {
    let filtered = [...MOCK_PACKS];

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (filters.language) {
      filtered = filtered.filter((p) => p.language === filters.language);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((p) =>
        filters.tags!.some((t) => p.tags.includes(t)),
      );
    }

    if (filters.status) {
      filtered = filtered.filter((p) => {
        if (filters.status === 'not-started') return p.passedCount === 0;
        if (filters.status === 'completed') return p.passedCount === p.challengeCount;
        if (filters.status === 'in-progress')
          return p.passedCount > 0 && p.passedCount < p.challengeCount;
        return true;
      });
    }

    return filtered;
  }, [filters.searchQuery, filters.language, filters.tags, filters.status]);

  return { packs, isLoading: false };
}

function useChallengesMock(slug: string) {
  const data = useMemo(() => {
    const pack = MOCK_PACKS.find((p) => p.slug === slug);
    const challenges = MOCK_CHALLENGES[slug] ?? [];
    return {
      pack: pack
        ? {
            name: pack.name,
            slug: pack.slug,
            description: pack.description,
            language: pack.language,
            tags: pack.tags,
          }
        : null,
      challenges,
    };
  }, [slug]);

  return { ...data, isLoading: false };
}

function useChallengeMock(id: string) {
  const challenge = useMemo(() => getMockChallenge(id) ?? MOCK_CHALLENGE, [id]);
  return { challenge, isLoading: false };
}

function useCreateAttemptMock() {
  return useCallback(async () => {
    // No-op in mock mode -- no backend to persist to
  }, []);
}

export const mockHooks: DataAccessHooks = {
  usePackList: usePackListMock,
  useChallenges: useChallengesMock,
  useChallenge: useChallengeMock,
  useCreateAttempt: useCreateAttemptMock,
};
