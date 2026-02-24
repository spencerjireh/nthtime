import { query } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const normalizedId = ctx.db.normalizeId('challenges', args.id);
    if (!normalizedId) return null;
    return await ctx.db.get(normalizedId);
  },
});

export const getByPackAndOrder = query({
  args: { packSlug: v.string(), order: v.number() },
  handler: async (ctx, args) => {
    const pack = await ctx.db
      .query('packs')
      .withIndex('by_slug', (q) => q.eq('slug', args.packSlug))
      .unique();
    if (!pack) return null;
    return await ctx.db
      .query('challenges')
      .withIndex('by_pack', (q) => q.eq('packId', pack._id).eq('order', args.order))
      .unique();
  },
});
