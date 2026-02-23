import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { checkSettingsRateLimit } from './rateLimit';

// Keep in sync with libs/shared/src/lib/types/settings.ts DEFAULT_FEEDBACK
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
    return toSettingsResponse(settings);
  },
});

export const update = mutation({
  args: {
    feedback: v.optional(v.object({
      showPassFail: v.optional(v.boolean()),
      showHints: v.optional(v.boolean()),
      showAssertionDetails: v.optional(v.boolean()),
      showDiff: v.optional(v.boolean()),
      showSolution: v.optional(v.boolean()),
    })),
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

    // Flatten feedback booleans for storage
    const { feedback, ...scalarArgs } = args;
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
