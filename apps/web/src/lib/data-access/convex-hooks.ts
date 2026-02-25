import { useCallback, useMemo } from 'react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import type {
  ChallengeSummary,
  CreateAttemptArgs,
  DataAccessHooks,
  PackListFilters,
  PackSummary,
} from './types';
import type { Challenge, Difficulty, AssertionSet } from '@nthtime/shared';

// Lazy require of the generated Convex API to avoid path resolution issues at
// build time. Typed as `any` because importing the generated api.d.ts would
// pull the entire convex/ tree into the web app's rootDir, causing TS6059
// errors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _api: any;
function getApi() {
  if (!_api) {
    _api = require('../../../../../convex/_generated/api').api;
  }
  return _api;
}

function usePackListConvex(filters: PackListFilters) {
  const args = {
    language: filters.language || undefined,
    difficulty: filters.difficulty || undefined,
    tags: filters.tags?.length ? filters.tags : undefined,
  };
  const data = useQuery(getApi().packs.list, args) as
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | { packs: any[]; availableTags: string[] }
    | undefined;

  if (!data) return { packs: [] as PackSummary[], availableTags: [] as string[], isLoading: true };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let packs: PackSummary[] = data.packs.map((p: any) => ({
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

  return { packs, availableTags: data.availableTags, isLoading: false };
}

function useChallengesConvex(slug: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = useQuery(getApi().packs.getChallenges, { slug }) as any | undefined;

  // undefined = still loading; null = pack not found
  if (data === undefined) {
    return {
      pack: null,
      challenges: [] as ChallengeSummary[],
      isLoading: true,
    };
  }

  if (data === null) {
    return {
      pack: null,
      challenges: [] as ChallengeSummary[],
      isLoading: false,
    };
  }

  return {
    pack: data.pack,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    challenges: data.challenges.map((c: any) => ({
      _id: c._id,
      slug: c.slug,
      title: c.title,
      difficulty: c.difficulty as ChallengeSummary['difficulty'],
      tags: c.tags,
      timeEstimateSeconds: c.timeEstimateSeconds,
      order: c.order,
      status: c.status as ChallengeSummary['status'],
    })),
    isLoading: false,
  };
}

function useChallengeConvex(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = useQuery(getApi().challenges.get, { id }) as any | undefined;

  const challenge = useMemo(() => {
    // undefined = loading, null = not found
    if (!doc) return null;
    const mapped: Challenge = {
      id: doc._id,
      slug: doc.slug,
      title: doc.title,
      prompt: doc.prompt,
      difficulty: doc.difficulty as Difficulty,
      tags: doc.tags,
      timeEstimateSeconds: doc.timeEstimateSeconds,
      scaffolded: doc.scaffolded,
      files: doc.files,
      hints: doc.hints,
      assertions: doc.assertions as AssertionSet,
      referenceSolution: doc.referenceSolution,
    };
    return mapped;
  }, [doc]);

  if (doc === undefined) return { challenge: null, isLoading: true };
  return { challenge, isLoading: false };
}

function useCreateAttemptConvex() {
  const { isAuthenticated } = useConvexAuth();
  const createAttempt = useMutation(getApi().attempts.create);
  return useCallback(
    async (args: CreateAttemptArgs) => {
      if (!isAuthenticated) return;
      try {
        await createAttempt({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          challengeId: args.challengeId as any, // string -> Id<"challenges"> boundary cast
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
