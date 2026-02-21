import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { checkSettingsRateLimit } from './rateLimit';

const DEFAULT_SETTINGS = {
  feedbackLevel: 3,
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

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return DEFAULT_SETTINGS;

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique();

    if (!settings) return DEFAULT_SETTINGS;
    return settings;
  },
});

export const update = mutation({
  args: {
    feedbackLevel: v.optional(v.number()),
    keybindings: v.optional(v.string()),
    darkMode: v.optional(v.boolean()),
    formatter: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    await checkSettingsRateLimit(ctx, userId, { maxRequests: 20, windowMs: 60_000 });

    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique();

    const updates = Object.fromEntries(
      Object.entries(args).filter(([, v]) => v !== undefined),
    );

    if (existing) {
      await ctx.db.patch(existing._id, { ...updates, updatedAt: Date.now() });
      return { ...existing, ...updates };
    }

    const newSettings = {
      userId,
      ...DEFAULT_SETTINGS,
      ...updates,
      updatedAt: Date.now(),
    };
    await ctx.db.insert('userSettings', newSettings);
    return newSettings;
  },
});
