import { mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';

export const seedPack = mutation({
  args: {
    adminSecret: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    language: v.string(),
    framework: v.optional(v.string()),
    version: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
    challenges: v.array(
      v.object({
        title: v.string(),
        prompt: v.string(),
        difficulty: v.string(),
        tags: v.array(v.string()),
        timeEstimateSeconds: v.number(),
        scaffolded: v.boolean(),
        files: v.array(v.object({ path: v.string(), content: v.string() })),
        hints: v.array(v.string()),
        assertions: v.object({
          perFile: v.any(),
          crossFile: v.any(),
        }),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const expected = process.env.ADMIN_SECRET;
    if (!expected || args.adminSecret !== expected) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Invalid admin secret' });
    }

    // Upsert pack by slug
    const existing = await ctx.db
      .query('packs')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();

    let packId;
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        description: args.description,
        language: args.language,
        framework: args.framework,
        version: args.version,
        author: args.author,
        tags: args.tags,
      });
      packId = existing._id;
    } else {
      packId = await ctx.db.insert('packs', {
        name: args.name,
        slug: args.slug,
        description: args.description,
        language: args.language,
        framework: args.framework,
        version: args.version,
        author: args.author,
        tags: args.tags,
      });
    }

    // Delete existing challenges for this pack
    const existingChallenges = await ctx.db
      .query('challenges')
      .withIndex('by_pack', (q) => q.eq('packId', packId))
      .collect();
    for (const challenge of existingChallenges) {
      await ctx.db.delete(challenge._id);
    }

    // Insert new challenges with order
    for (let i = 0; i < args.challenges.length; i++) {
      const challenge = args.challenges[i];
      await ctx.db.insert('challenges', {
        packId,
        title: challenge.title,
        prompt: challenge.prompt,
        difficulty: challenge.difficulty,
        tags: challenge.tags,
        timeEstimateSeconds: challenge.timeEstimateSeconds,
        scaffolded: challenge.scaffolded,
        files: challenge.files,
        hints: challenge.hints,
        assertions: challenge.assertions,
        order: i + 1,
      });
    }
  },
});
