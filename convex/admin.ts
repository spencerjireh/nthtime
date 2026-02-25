import { mutation } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import { ConvexError, v } from 'convex/values';

const packChallengeValidator = v.object({
  slug: v.string(),
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
  referenceSolution: v.optional(v.array(v.object({ path: v.string(), content: v.string() }))),
});

const packValidator = v.object({
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  language: v.string(),
  framework: v.optional(v.string()),
  version: v.string(),
  author: v.string(),
  tags: v.array(v.string()),
  challenges: v.array(packChallengeValidator),
});

export const seedPack = mutation({
  args: {
    adminSecret: v.string(),
    ...packValidator.fields,
  },
  handler: async (ctx, args) => {
    verifyAdmin(args.adminSecret);
    await upsertPack(ctx, args);
  },
});

export const syncPacks = mutation({
  args: {
    adminSecret: v.string(),
    packs: v.array(packValidator),
  },
  handler: async (ctx, args) => {
    verifyAdmin(args.adminSecret);

    const syncedSlugs = new Set<string>();

    for (const pack of args.packs) {
      await upsertPack(ctx, pack);
      syncedSlugs.add(pack.slug);
    }

    // Delete packs not in the sync list
    const allPacks = await ctx.db.query('packs').collect();
    for (const pack of allPacks) {
      if (!syncedSlugs.has(pack.slug)) {
        // Delete pack's challenges first
        const challenges = await ctx.db
          .query('challenges')
          .withIndex('by_pack', (q) => q.eq('packId', pack._id))
          .collect();
        for (const challenge of challenges) {
          await ctx.db.delete(challenge._id);
        }
        await ctx.db.delete(pack._id);
      }
    }
  },
});

function verifyAdmin(adminSecret: string) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || adminSecret !== expected) {
    throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Invalid admin secret' });
  }
}

async function upsertPack(
  ctx: Pick<MutationCtx, 'db'>,
  pack: {
    name: string;
    slug: string;
    description: string;
    language: string;
    framework?: string;
    version: string;
    author: string;
    tags: string[];
    challenges: {
      slug: string;
      title: string;
      prompt: string;
      difficulty: string;
      tags: string[];
      timeEstimateSeconds: number;
      scaffolded: boolean;
      files: { path: string; content: string }[];
      hints: string[];
      assertions: { perFile: unknown; crossFile: unknown };
      referenceSolution?: { path: string; content: string }[];
    }[];
  },
) {
  // Upsert pack by slug
  const existing = await ctx.db
    .query('packs')
    .withIndex('by_slug', (q) => q.eq('slug', pack.slug))
    .unique();

  let packId;
  if (existing) {
    await ctx.db.patch(existing._id, {
      name: pack.name,
      description: pack.description,
      language: pack.language,
      framework: pack.framework,
      version: pack.version,
      author: pack.author,
      tags: pack.tags,
    });
    packId = existing._id;
  } else {
    packId = await ctx.db.insert('packs', {
      name: pack.name,
      slug: pack.slug,
      description: pack.description,
      language: pack.language,
      framework: pack.framework,
      version: pack.version,
      author: pack.author,
      tags: pack.tags,
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
  for (let i = 0; i < pack.challenges.length; i++) {
    const challenge = pack.challenges[i];
    await ctx.db.insert('challenges', {
      packId,
      slug: challenge.slug,
      title: challenge.title,
      prompt: challenge.prompt,
      difficulty: challenge.difficulty,
      tags: challenge.tags,
      timeEstimateSeconds: challenge.timeEstimateSeconds,
      scaffolded: challenge.scaffolded,
      files: challenge.files,
      hints: challenge.hints,
      assertions: challenge.assertions,
      referenceSolution: challenge.referenceSolution,
      order: i + 1,
    });
  }
}
