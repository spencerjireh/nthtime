import { mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { rateLimiter } from './rateLimits';

export const myPacks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const packs = await ctx.db
      .query('packs')
      .withIndex('by_author', (q) => q.eq('authorUserId', userId))
      .collect();

    const result = await Promise.all(
      packs.map(async (pack) => {
        const challenges = await ctx.db
          .query('challenges')
          .withIndex('by_pack', (q) => q.eq('packId', pack._id))
          .collect();
        return {
          _id: pack._id,
          name: pack.name,
          slug: pack.slug,
          description: pack.description,
          language: pack.language,
          framework: pack.framework,
          version: pack.version,
          tags: pack.tags,
          visibility: pack.visibility ?? 'public',
          challengeCount: challenges.length,
          createdAt: pack.createdAt,
          updatedAt: pack.updatedAt,
        };
      }),
    );

    return result;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const pack = await ctx.db
      .query('packs')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
    if (!pack || pack.authorUserId !== userId) return null;

    const challenges = await ctx.db
      .query('challenges')
      .withIndex('by_pack', (q) => q.eq('packId', pack._id))
      .collect();

    return {
      ...pack,
      visibility: pack.visibility ?? 'public',
      challenges: challenges
        .sort((a, b) => a.order - b.order)
        .map((c) => ({
          _id: c._id,
          title: c.title,
          difficulty: c.difficulty,
          tags: c.tags,
          timeEstimateSeconds: c.timeEstimateSeconds,
          scaffolded: c.scaffolded,
          order: c.order,
        })),
    };
  },
});

export const getForExport = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const pack = await ctx.db
      .query('packs')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
    if (!pack || pack.authorUserId !== userId) return null;

    const challenges = await ctx.db
      .query('challenges')
      .withIndex('by_pack', (q) => q.eq('packId', pack._id))
      .collect();

    return {
      name: pack.name,
      slug: pack.slug,
      description: pack.description,
      language: pack.language,
      framework: pack.framework,
      version: pack.version,
      tags: pack.tags,
      challenges: challenges
        .sort((a, b) => a.order - b.order)
        .map((c) => ({
          title: c.title,
          prompt: c.prompt,
          difficulty: c.difficulty,
          tags: c.tags,
          timeEstimateSeconds: c.timeEstimateSeconds,
          scaffolded: c.scaffolded,
          files: c.files,
          hints: c.hints,
          assertions: c.assertions,
          referenceSolution: c.referenceSolution,
          order: c.order,
        })),
    };
  },
});

export const checkSlugAvailable = query({
  args: {
    slug: v.string(),
    excludePackId: v.optional(v.id('packs')),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('packs')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
    if (!existing) return true;
    if (args.excludePackId && existing._id === args.excludePackId) return true;
    return false;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    language: v.string(),
    framework: v.optional(v.string()),
    version: v.string(),
    tags: v.array(v.string()),
    visibility: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

    await rateLimiter.limit(ctx, 'authorPacks:write', { key: userId, throws: true });

    const existing = await ctx.db
      .query('packs')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
    if (existing) {
      throw new ConvexError({ code: 'CONFLICT', message: 'Slug already taken' });
    }

    const now = Date.now();
    return await ctx.db.insert('packs', {
      ...args,
      author: '',
      authorUserId: userId,
      visibility: args.visibility ?? 'public',
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    packId: v.id('packs'),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    language: v.optional(v.string()),
    framework: v.optional(v.string()),
    version: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    visibility: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

    await rateLimiter.limit(ctx, 'authorPacks:write', { key: userId, throws: true });

    const pack = await ctx.db.get(args.packId);
    if (!pack || pack.authorUserId !== userId) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Pack not found or not owned by you' });
    }

    const newSlug = args.slug;
    if (newSlug && newSlug !== pack.slug) {
      const existing = await ctx.db
        .query('packs')
        .withIndex('by_slug', (q) => q.eq('slug', newSlug))
        .unique();
      if (existing) {
        throw new ConvexError({ code: 'CONFLICT', message: 'Slug already taken' });
      }
    }

    const { packId: _, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }
    filtered.updatedAt = Date.now();

    await ctx.db.patch(args.packId, filtered);
  },
});

export const remove = mutation({
  args: { packId: v.id('packs') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

    await rateLimiter.limit(ctx, 'authorPacks:write', { key: userId, throws: true });

    const pack = await ctx.db.get(args.packId);
    if (!pack || pack.authorUserId !== userId) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Pack not found or not owned by you' });
    }

    // Delete all challenges and their attempts
    const challenges = await ctx.db
      .query('challenges')
      .withIndex('by_pack', (q) => q.eq('packId', args.packId))
      .collect();

    for (const challenge of challenges) {
      const attempts = await ctx.db
        .query('attempts')
        .withIndex('by_challenge', (q) => q.eq('challengeId', challenge._id))
        .collect();
      for (const attempt of attempts) {
        await ctx.db.delete(attempt._id);
      }
      await ctx.db.delete(challenge._id);
    }

    await ctx.db.delete(args.packId);
  },
});
