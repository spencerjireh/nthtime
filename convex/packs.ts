import { query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { listPacksHelper, getChallengesHelper } from './_helpers';

export const list = query({
  args: {
    language: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return listPacksHelper(ctx, { ...args, userId });
  },
});

export const getChallenges = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return getChallengesHelper(ctx, { slug: args.slug, userId });
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
      slug: c.slug,
      title: c.title,
      difficulty: c.difficulty,
      tags: c.tags,
      timeEstimateSeconds: c.timeEstimateSeconds,
      order: c.order,
    }));
  },
});
