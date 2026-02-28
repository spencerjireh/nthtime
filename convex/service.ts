import { query, mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { rateLimiter } from './rateLimits';
import type { Id } from './_generated/dataModel';
import { listPacksHelper, getChallengesHelper, verifyPackOwnership } from './_helpers';

// ---------------------------------------------------------------------------
// Service token verification
// ---------------------------------------------------------------------------

// SERVICE_TOKEN (Convex env) and CONVEX_SERVICE_TOKEN (Next.js env) hold the same value.
// The naming difference is intentional: Convex env vars are unprefixed, while the Next.js
// server adapter uses the CONVEX_ prefix to avoid collisions. See .env.local.example.
function verifyServiceToken(token: string) {
  const expected = process.env.SERVICE_TOKEN;
  if (!expected || token !== expected) {
    throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Invalid service token' });
  }
}

const serviceTokenArg = { serviceToken: v.string() };

// ---------------------------------------------------------------------------
// User resolution
// ---------------------------------------------------------------------------

export const findOrCreateUser = mutation({
  args: {
    ...serviceTokenArg,
    provider: v.string(),
    providerAccountId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);

    // Look up existing account by provider + providerAccountId
    const account = await ctx.db
      .query('authAccounts')
      .withIndex('providerAndAccountId', (q) =>
        q.eq('provider', args.provider).eq('providerAccountId', args.providerAccountId),
      )
      .unique();

    if (account) {
      return account.userId as string;
    }

    // Create new user
    const userId = await ctx.db.insert('users', {});

    // Create auth account linked to user
    await ctx.db.insert('authAccounts', {
      userId,
      provider: args.provider,
      providerAccountId: args.providerAccountId,
    } as never);

    return userId as string;
  },
});

// ---------------------------------------------------------------------------
// Pack listing (authenticated -- includes passedCount)
// ---------------------------------------------------------------------------

export const listPacksAuth = query({
  args: {
    ...serviceTokenArg,
    userId: v.string(),
    language: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId);
    return listPacksHelper(ctx, { ...args, userId });
  },
});

// ---------------------------------------------------------------------------
// Challenges listing (authenticated -- includes attempt status)
// ---------------------------------------------------------------------------

export const getChallengesAuth = query({
  args: {
    ...serviceTokenArg,
    userId: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId);
    return getChallengesHelper(ctx, { slug: args.slug, userId });
  },
});

// ---------------------------------------------------------------------------
// Attempts
// ---------------------------------------------------------------------------

export const createAttempt = mutation({
  args: {
    ...serviceTokenArg,
    userId: v.string(),
    challengeId: v.id('challenges'),
    passed: v.boolean(),
    assertionResults: v.any(),
    hintsUsed: v.number(),
    timeSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Invalid userId' });

    await rateLimiter.limit(ctx, 'attempts:create', { key: userId, throws: true });

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

export const listAttempts = query({
  args: {
    ...serviceTokenArg,
    userId: v.string(),
    challengeId: v.id('challenges'),
  },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) return [];

    return await ctx.db
      .query('attempts')
      .withIndex('by_user_challenge', (q) =>
        q.eq('userId', userId).eq('challengeId', args.challengeId),
      )
      .collect();
  },
});

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const DEFAULT_FEEDBACK = {
  showPassFail: true,
  showHints: true,
  showAssertionDetails: true,
  showDiff: false,
  showSolution: false,
};

const DEFAULT_SETTINGS = {
  feedback: DEFAULT_FEEDBACK,
  keybindings: 'default',
  darkMode: true,
  formatter: {
    defaults: {
      enabled: true,
      trigger: 'manual',
      tabSize: 2,
      useTabs: false,
    },
    overrides: {},
  },
};

function assembleFeedback(row: Record<string, unknown>) {
  return {
    showPassFail: (row.showPassFail as boolean | undefined) ?? DEFAULT_FEEDBACK.showPassFail,
    showHints: (row.showHints as boolean | undefined) ?? DEFAULT_FEEDBACK.showHints,
    showAssertionDetails:
      (row.showAssertionDetails as boolean | undefined) ?? DEFAULT_FEEDBACK.showAssertionDetails,
    showDiff: (row.showDiff as boolean | undefined) ?? DEFAULT_FEEDBACK.showDiff,
    showSolution: (row.showSolution as boolean | undefined) ?? DEFAULT_FEEDBACK.showSolution,
  };
}

function toSettingsResponse(row: Record<string, unknown>) {
  return {
    feedback: assembleFeedback(row),
    keybindings: row.keybindings as string,
    darkMode: row.darkMode as boolean,
    formatter: row.formatter,
  };
}

export const getSettings = query({
  args: {
    ...serviceTokenArg,
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) return DEFAULT_SETTINGS;

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique();

    if (!settings) return DEFAULT_SETTINGS;
    return toSettingsResponse(settings);
  },
});

export const updateSettings = mutation({
  args: {
    ...serviceTokenArg,
    userId: v.string(),
    feedback: v.optional(
      v.object({
        showPassFail: v.optional(v.boolean()),
        showHints: v.optional(v.boolean()),
        showAssertionDetails: v.optional(v.boolean()),
        showDiff: v.optional(v.boolean()),
        showSolution: v.optional(v.boolean()),
      }),
    ),
    keybindings: v.optional(v.string()),
    darkMode: v.optional(v.boolean()),
    formatter: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Invalid userId' });

    await rateLimiter.limit(ctx, 'settings:update', { key: userId, throws: true });

    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique();

    const { feedback, serviceToken: _, userId: __, ...scalarArgs } = args;
    const updates: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(scalarArgs)) {
      if (val !== undefined) updates[k] = val;
    }
    if (feedback) {
      for (const [k, val] of Object.entries(feedback)) {
        if (val !== undefined) updates[k] = val;
      }
    }

    if (existing) {
      await ctx.db.patch(existing._id, { ...updates, updatedAt: Date.now() });
      const patched = { ...existing, ...updates };
      return toSettingsResponse(patched);
    }

    const newRow = {
      userId,
      keybindings: (updates.keybindings as string) ?? DEFAULT_SETTINGS.keybindings,
      darkMode: (updates.darkMode as boolean) ?? DEFAULT_SETTINGS.darkMode,
      formatter: updates.formatter ?? DEFAULT_SETTINGS.formatter,
      ...(feedback ?? {}),
      updatedAt: Date.now(),
    };
    await ctx.db.insert('userSettings', newRow);
    return toSettingsResponse(newRow);
  },
});

// ---------------------------------------------------------------------------
// Author Packs
// ---------------------------------------------------------------------------

export const authorMyPacks = query({
  args: { ...serviceTokenArg, userId: v.string() },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) return [];

    const packs = await ctx.db
      .query('packs')
      .withIndex('by_author', (q) => q.eq('authorUserId', userId))
      .collect();

    return await Promise.all(
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
  },
});

export const authorGetBySlug = query({
  args: { ...serviceTokenArg, userId: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
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
          slug: c.slug,
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

export const authorGetForExport = query({
  args: { ...serviceTokenArg, userId: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
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

export const authorCheckSlugAvailable = query({
  args: {
    ...serviceTokenArg,
    slug: v.string(),
    excludePackId: v.optional(v.id('packs')),
  },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const existing = await ctx.db
      .query('packs')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
    if (!existing) return true;
    if (args.excludePackId && existing._id === args.excludePackId) return true;
    return false;
  },
});

export const authorCreatePack = mutation({
  args: {
    ...serviceTokenArg,
    userId: v.string(),
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
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Invalid userId' });

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
      name: args.name,
      slug: args.slug,
      description: args.description,
      language: args.language,
      framework: args.framework,
      version: args.version,
      author: '',
      tags: args.tags,
      authorUserId: userId,
      visibility: args.visibility ?? 'public',
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const authorUpdatePack = mutation({
  args: {
    ...serviceTokenArg,
    userId: v.string(),
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
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Invalid userId' });

    await rateLimiter.limit(ctx, 'authorPacks:write', { key: userId, throws: true });

    const pack = await ctx.db.get(args.packId);
    if (!pack || pack.authorUserId !== userId) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Pack not found or not owned by you' });
    }

    if (args.slug && args.slug !== pack.slug) {
      const existing = await ctx.db
        .query('packs')
        .withIndex('by_slug', (q) => q.eq('slug', args.slug!))
        .unique();
      if (existing) {
        throw new ConvexError({ code: 'CONFLICT', message: 'Slug already taken' });
      }
    }

    const { packId: _, serviceToken: __, userId: ___, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }
    filtered.updatedAt = Date.now();

    await ctx.db.patch(args.packId, filtered);
  },
});

export const authorRemovePack = mutation({
  args: { ...serviceTokenArg, userId: v.string(), packId: v.id('packs') },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Invalid userId' });

    await rateLimiter.limit(ctx, 'authorPacks:write', { key: userId, throws: true });

    const pack = await ctx.db.get(args.packId);
    if (!pack || pack.authorUserId !== userId) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Pack not found or not owned by you' });
    }

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

// ---------------------------------------------------------------------------
// Author Challenges
// ---------------------------------------------------------------------------

export const authorGetChallenge = query({
  args: { ...serviceTokenArg, userId: v.string(), challengeId: v.id('challenges') },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) return null;

    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) return null;

    const pack = await ctx.db.get(challenge.packId);
    if (!pack || pack.authorUserId !== userId) return null;

    return challenge;
  },
});

export const authorCreateChallenge = mutation({
  args: {
    ...serviceTokenArg,
    userId: v.string(),
    packId: v.id('packs'),
    slug: v.string(),
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
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Invalid userId' });

    await rateLimiter.limit(ctx, 'authorChallenges:write', { key: userId, throws: true });
    await verifyPackOwnership(ctx, args.packId, userId);

    const existing = await ctx.db
      .query('challenges')
      .withIndex('by_pack', (q) => q.eq('packId', args.packId))
      .collect();
    const maxOrder = existing.reduce((max, c) => Math.max(max, c.order), 0);

    const { serviceToken: _, userId: __, ...rest } = args;
    return await ctx.db.insert('challenges', {
      ...rest,
      order: maxOrder + 1,
    });
  },
});

export const authorUpdateChallenge = mutation({
  args: {
    ...serviceTokenArg,
    userId: v.string(),
    challengeId: v.id('challenges'),
    slug: v.optional(v.string()),
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
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Invalid userId' });

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

    const { challengeId: _, serviceToken: __, userId: ___, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }

    await ctx.db.patch(args.challengeId, filtered);
  },
});

export const authorRemoveChallenge = mutation({
  args: { ...serviceTokenArg, userId: v.string(), challengeId: v.id('challenges') },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Invalid userId' });

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

    // Re-number remaining challenges
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

export const authorReorderChallenges = mutation({
  args: {
    ...serviceTokenArg,
    userId: v.string(),
    packId: v.id('packs'),
    challengeIds: v.array(v.id('challenges')),
  },
  handler: async (ctx, args) => {
    verifyServiceToken(args.serviceToken);
    const userId = ctx.db.normalizeId('users', args.userId) as Id<'users'>;
    if (!userId) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Invalid userId' });

    await rateLimiter.limit(ctx, 'authorChallenges:write', { key: userId, throws: true });
    await verifyPackOwnership(ctx, args.packId, userId);

    for (let i = 0; i < args.challengeIds.length; i++) {
      await ctx.db.patch(args.challengeIds[i], { order: i + 1 });
    }
  },
});
