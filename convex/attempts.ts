import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const create = mutation({
  args: {
    challengeId: v.id('challenges'),
    passed: v.boolean(),
    assertionResults: v.any(),
    hintsUsed: v.number(),
    timeSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    return await ctx.db.insert('attempts', {
      userId,
      challengeId: args.challengeId,
      passed: args.passed,
      assertionResults: args.assertionResults,
      hintsUsed: args.hintsUsed,
      timeSeconds: args.timeSeconds,
    });
  },
});

export const list = query({
  args: { challengeId: v.id('challenges') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query('attempts')
      .withIndex('by_user_challenge', (q) =>
        q.eq('userId', userId).eq('challengeId', args.challengeId),
      )
      .collect();
  },
});
