import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { rateLimiter } from './rateLimits';
import type { Id } from './_generated/dataModel';

async function verifyPackOwnership(
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

export const get = query({
  args: { challengeId: v.id('challenges') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) return null;

    const pack = await ctx.db.get(challenge.packId);
    if (!pack || pack.authorUserId !== userId) return null;

    return challenge;
  },
});

export const create = mutation({
  args: {
    packId: v.id('packs'),
    title: v.string(),
    prompt: v.string(),
    difficulty: v.string(),
    tags: v.array(v.string()),
    timeEstimateSeconds: v.number(),
    scaffolded: v.boolean(),
    files: v.array(v.object({ path: v.string(), content: v.string() })),
    hints: v.array(v.string()),
    assertions: v.object({ perFile: v.any(), crossFile: v.any() }),
    referenceSolution: v.optional(v.array(v.object({ path: v.string(), content: v.string() }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

    await rateLimiter.limit(ctx, 'authorChallenges:write', { key: userId, throws: true });
    await verifyPackOwnership(ctx, args.packId, userId);

    // Determine next order value
    const existing = await ctx.db
      .query('challenges')
      .withIndex('by_pack', (q) => q.eq('packId', args.packId))
      .collect();
    const maxOrder = existing.reduce((max, c) => Math.max(max, c.order), 0);

    return await ctx.db.insert('challenges', {
      ...args,
      order: maxOrder + 1,
    });
  },
});

export const update = mutation({
  args: {
    challengeId: v.id('challenges'),
    title: v.optional(v.string()),
    prompt: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    timeEstimateSeconds: v.optional(v.number()),
    scaffolded: v.optional(v.boolean()),
    files: v.optional(v.array(v.object({ path: v.string(), content: v.string() }))),
    hints: v.optional(v.array(v.string())),
    assertions: v.optional(v.object({ perFile: v.any(), crossFile: v.any() })),
    referenceSolution: v.optional(
      v.array(v.object({ path: v.string(), content: v.string() })),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

    await rateLimiter.limit(ctx, 'authorChallenges:write', { key: userId, throws: true });

    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Challenge not found' });
    }

    await verifyPackOwnership(ctx, challenge.packId, userId);

    // Delete all attempts for this challenge (content changed)
    const attempts = await ctx.db
      .query('attempts')
      .withIndex('by_challenge', (q) => q.eq('challengeId', args.challengeId))
      .collect();
    for (const attempt of attempts) {
      await ctx.db.delete(attempt._id);
    }

    const { challengeId: _, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }

    await ctx.db.patch(args.challengeId, filtered);
  },
});

export const remove = mutation({
  args: { challengeId: v.id('challenges') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

    await rateLimiter.limit(ctx, 'authorChallenges:write', { key: userId, throws: true });

    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Challenge not found' });
    }

    await verifyPackOwnership(ctx, challenge.packId, userId);

    // Delete attempts for this challenge
    const attempts = await ctx.db
      .query('attempts')
      .withIndex('by_challenge', (q) => q.eq('challengeId', args.challengeId))
      .collect();
    for (const attempt of attempts) {
      await ctx.db.delete(attempt._id);
    }

    await ctx.db.delete(args.challengeId);

    // Re-number remaining challenges to fill the gap
    const remaining = await ctx.db
      .query('challenges')
      .withIndex('by_pack', (q) => q.eq('packId', challenge.packId))
      .collect();
    const sorted = remaining.sort((a, b) => a.order - b.order);
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].order !== i + 1) {
        await ctx.db.patch(sorted[i]._id, { order: i + 1 });
      }
    }
  },
});

export const reorder = mutation({
  args: {
    packId: v.id('packs'),
    challengeIds: v.array(v.id('challenges')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

    await rateLimiter.limit(ctx, 'authorChallenges:write', { key: userId, throws: true });
    await verifyPackOwnership(ctx, args.packId, userId);

    for (let i = 0; i < args.challengeIds.length; i++) {
      await ctx.db.patch(args.challengeIds[i], { order: i + 1 });
    }
  },
});
