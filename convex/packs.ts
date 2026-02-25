import { query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const list = query({
  args: {
    language: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const packs = await ctx.db.query('packs').collect();

    // Fetch all user attempts once (N+1 fix: was inside per-pack loop)
    let passedChallengeIds = new Set<string>();
    if (userId) {
      const attempts = await ctx.db
        .query('attempts')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .collect();
      passedChallengeIds = new Set(
        attempts.filter((a) => a.passed).map((a) => a.challengeId),
      );
    }

    // Collect all tags across packs before filtering
    const allTags = new Set<string>();

    const result = await Promise.all(
      packs.map(async (pack) => {
        for (const tag of pack.tags) allTags.add(tag);

        const challenges = await ctx.db
          .query('challenges')
          .withIndex('by_pack', (q) => q.eq('packId', pack._id))
          .collect();

        // Apply difficulty filter at challenge level
        const filtered = args.difficulty
          ? challenges.filter((c) => c.difficulty === args.difficulty)
          : challenges;

        const passedCount = filtered.filter((c) =>
          passedChallengeIds.has(c._id),
        ).length;

        return {
          ...pack,
          challengeCount: filtered.length,
          passedCount,
        };
      }),
    );

    // Apply pack-level filters
    let filtered = result;
    if (args.language) {
      filtered = filtered.filter((p) => p.language === args.language);
    }
    if (args.tags && args.tags.length > 0) {
      const tagSet = new Set(args.tags);
      filtered = filtered.filter((p) => p.tags.some((t: string) => tagSet.has(t)));
    }
    return { packs: filtered, availableTags: [...allTags].sort() };
  },
});

export const getChallenges = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const pack = await ctx.db
      .query('packs')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
    if (!pack) return null;

    const challenges = await ctx.db
      .query('challenges')
      .withIndex('by_pack', (q) => q.eq('packId', pack._id))
      .collect();

    // Build per-challenge attempt status for authenticated users
    let statusMap = new Map<string, 'passed' | 'failed'>();
    if (userId) {
      const attempts = await ctx.db
        .query('attempts')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .collect();
      for (const attempt of attempts) {
        const current = statusMap.get(attempt.challengeId);
        if (attempt.passed || current !== 'passed') {
          statusMap.set(
            attempt.challengeId,
            attempt.passed ? 'passed' : 'failed',
          );
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
        title: c.title,
        difficulty: c.difficulty,
        tags: c.tags,
        timeEstimateSeconds: c.timeEstimateSeconds,
        scaffolded: c.scaffolded,
        order: c.order,
        status:
          (statusMap.get(c._id) as 'passed' | 'failed') ?? 'not-attempted',
      })),
    };
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];
    const results = await ctx.db
      .query('challenges')
      .withSearchIndex('search_title', (q) => q.search('title', args.query))
      .take(20);
    return results.map((c) => ({
      _id: c._id,
      packId: c.packId,
      title: c.title,
      difficulty: c.difficulty,
      tags: c.tags,
      timeEstimateSeconds: c.timeEstimateSeconds,
      order: c.order,
    }));
  },
});
