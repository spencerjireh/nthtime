import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema({
  ...authTables,

  packs: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    language: v.string(),
    framework: v.optional(v.string()),
    version: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
  }).index('by_slug', ['slug']),

  challenges: defineTable({
    packId: v.id('packs'),
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
    order: v.number(),
  })
    .index('by_pack', ['packId', 'order'])
    .searchIndex('search_title', { searchField: 'title' }),

  attempts: defineTable({
    userId: v.id('users'),
    challengeId: v.id('challenges'),
    passed: v.boolean(),
    assertionResults: v.any(),
    hintsUsed: v.number(),
    timeSeconds: v.number(),
  })
    .index('by_user_challenge', ['userId', 'challengeId'])
    .index('by_user', ['userId']),

  userSettings: defineTable({
    userId: v.id('users'),
    feedbackLevel: v.number(),
    keybindings: v.string(),
    darkMode: v.boolean(),
    formatter: v.any(),
  }).index('by_user', ['userId']),
});
