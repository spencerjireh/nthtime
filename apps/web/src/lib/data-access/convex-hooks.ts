/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import type { CreateAttemptArgs, DataAccessHooks, PackListFilters } from './types';
import type { MockPack, MockChallenge } from '@/lib/mock-packs';
import { MOCK_CHALLENGE, getMockChallenge } from '@/lib/mock-challenge';

// Dynamic import of api to avoid path resolution issues at build time
// This module is only loaded when NEXT_PUBLIC_CONVEX_URL is set
let _api: any;
function getApi() {
  if (!_api) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _api = require('../../../../../convex/_generated/api').api;
  }
  return _api;
}

function usePackListConvex(filters: PackListFilters) {
  const rawPacks = useQuery(getApi().packs.list, {
    language: filters.language || undefined,
    difficulty: filters.difficulty || undefined,
    tags: filters.tags?.length ? filters.tags : undefined,
  });

  if (!rawPacks) return { packs: [] as MockPack[], isLoading: true };

  let packs: MockPack[] = rawPacks.map((p: any) => ({
    _id: p._id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    language: p.language,
    framework: p.framework,
    version: p.version,
    author: p.author,
    tags: p.tags,
    challengeCount: p.challengeCount,
    passedCount: p.passedCount,
  }));

  // Client-side search (Convex search is separate)
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    packs = packs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  // Client-side status filter (depends on user-specific passedCount)
  if (filters.status) {
    packs = packs.filter((p) => {
      if (filters.status === 'not-started') return p.passedCount === 0;
      if (filters.status === 'completed') return p.passedCount === p.challengeCount;
      if (filters.status === 'in-progress')
        return p.passedCount > 0 && p.passedCount < p.challengeCount;
      return true;
    });
  }

  return { packs, isLoading: false };
}

function useChallengesConvex(slug: string) {
  const data = useQuery(getApi().packs.getChallenges, { slug });

  if (!data) {
    return {
      pack: null,
      challenges: [] as MockChallenge[],
      isLoading: true,
    };
  }

  return {
    pack: data.pack,
    challenges: data.challenges.map((c: any) => ({
      _id: c._id,
      title: c.title,
      difficulty: c.difficulty as MockChallenge['difficulty'],
      tags: c.tags,
      timeEstimateSeconds: c.timeEstimateSeconds,
      order: c.order,
      status: c.status as MockChallenge['status'],
    })),
    isLoading: false,
  };
}

function useChallengeConvex(id: string) {
  // Convex doesn't have a direct getChallenge query yet -- fall back to mock
  // TODO: Add api.challenges.get query when needed
  const challenge = getMockChallenge(id) ?? MOCK_CHALLENGE;
  return { challenge, isLoading: false };
}

function useCreateAttemptConvex() {
  const { isAuthenticated } = useConvexAuth();
  const createAttempt = useMutation(getApi().attempts.create);
  return useCallback(
    async (args: CreateAttemptArgs) => {
      // Skip when not authenticated or when using mock challenge IDs
      if (!isAuthenticated || getMockChallenge(args.challengeId)) return;
      try {
        await createAttempt({
          challengeId: args.challengeId as any,
          passed: args.passed,
          assertionResults: args.assertionResults,
          hintsUsed: args.hintsUsed,
          timeSeconds: args.timeSeconds,
        });
      } catch {
        // Fire-and-forget: don't break the UI if persistence fails
        console.warn('Failed to persist attempt');
      }
    },
    [isAuthenticated, createAttempt],
  );
}

export const convexHooks: DataAccessHooks = {
  usePackList: usePackListConvex,
  useChallenges: useChallengesConvex,
  useChallenge: useChallengeConvex,
  useCreateAttempt: useCreateAttemptConvex,
};
