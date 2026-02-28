/**
 * Shared business logic helpers for Convex functions.
 * Both auth-based functions (packs.ts) and service-token functions (service.ts)
 * call these helpers to avoid duplicating logic.
 */
import type { QueryCtx, MutationCtx } from './_generated/server';
import { ConvexError } from 'convex/values';
import type { Id } from './_generated/dataModel';

// ---------------------------------------------------------------------------
// Pack listing
// ---------------------------------------------------------------------------

export async function listPacksHelper(
  ctx: Pick<QueryCtx, 'db'>,
  args: {
    userId: Id<'users'> | null;
    language?: string;
    difficulty?: string;
    tags?: string[];
  },
) {
  const packs = await ctx.db.query('packs').collect();

  let passedChallengeIds = new Set<string>();
  if (args.userId) {
    const attempts = await ctx.db
      .query('attempts')
      .withIndex('by_user', (q) => q.eq('userId', args.userId!))
      .collect();
    passedChallengeIds = new Set(attempts.filter((a) => a.passed).map((a) => a.challengeId));
  }

  const allTags = new Set<string>();

  const visiblePacks = packs.filter((pack) => {
    const vis = pack.visibility ?? 'public';
    if (vis === 'public') return true;
    return args.userId !== null && pack.authorUserId === args.userId;
  });

  const result = await Promise.all(
    visiblePacks.map(async (pack) => {
      for (const tag of pack.tags) allTags.add(tag);

      const challenges = await ctx.db
        .query('challenges')
        .withIndex('by_pack', (q) => q.eq('packId', pack._id))
        .collect();

      const filtered = args.difficulty
        ? challenges.filter((c) => c.difficulty === args.difficulty)
        : challenges;

      const passedCount = filtered.filter((c) => passedChallengeIds.has(c._id)).length;

      return {
        ...pack,
        challengeCount: filtered.length,
        passedCount,
      };
    }),
  );

  let filtered = result;
  if (args.language) {
    filtered = filtered.filter((p) => p.language === args.language);
  }
  if (args.tags && args.tags.length > 0) {
    const tagSet = new Set(args.tags);
    filtered = filtered.filter((p) => p.tags.some((t: string) => tagSet.has(t)));
  }
  return { packs: filtered, availableTags: [...allTags].sort() };
}

// ---------------------------------------------------------------------------
// Challenge listing with status
// ---------------------------------------------------------------------------

export async function getChallengesHelper(
  ctx: Pick<QueryCtx, 'db'>,
  args: { slug: string; userId: Id<'users'> | null },
) {
  const pack = await ctx.db
    .query('packs')
    .withIndex('by_slug', (q) => q.eq('slug', args.slug))
    .unique();
  if (!pack) return null;

  const vis = pack.visibility ?? 'public';
  if (vis === 'private' && (!args.userId || pack.authorUserId !== args.userId)) return null;

  const challenges = await ctx.db
    .query('challenges')
    .withIndex('by_pack', (q) => q.eq('packId', pack._id))
    .collect();

  let statusMap = new Map<string, 'passed' | 'failed'>();
  if (args.userId) {
    const attempts = await ctx.db
      .query('attempts')
      .withIndex('by_user', (q) => q.eq('userId', args.userId!))
      .collect();
    for (const attempt of attempts) {
      const current = statusMap.get(attempt.challengeId);
      if (attempt.passed || current !== 'passed') {
        statusMap.set(attempt.challengeId, attempt.passed ? 'passed' : 'failed');
      }
    }
  }

  return {
    pack: {
      _id: pack._id,
      name: pack.name,
      slug: pack.slug,
      description: pack.description,
      language: pack.language,
      framework: pack.framework,
      tags: pack.tags,
    },
    challenges: challenges.map((c) => ({
      _id: c._id,
      slug: c.slug,
      title: c.title,
      difficulty: c.difficulty,
      tags: c.tags,
      timeEstimateSeconds: c.timeEstimateSeconds,
      order: c.order,
      status: (statusMap.get(c._id) as 'passed' | 'failed') ?? 'not-attempted',
    })),
  };
}

// ---------------------------------------------------------------------------
// Pack ownership verification
// ---------------------------------------------------------------------------

export async function verifyPackOwnership(
  ctx: Pick<MutationCtx | QueryCtx, 'db'>,
  packId: Id<'packs'>,
  userId: Id<'users'>,
) {
  const pack = await ctx.db.get(packId);
  if (!pack || pack.authorUserId !== userId) {
    throw new ConvexError({ code: 'NOT_FOUND', message: 'Pack not found or not owned by you' });
  }
  return pack;
}
