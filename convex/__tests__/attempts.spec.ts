import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../_generated/api';
import schema from '../schema';
import type { Id } from '../_generated/dataModel';

// Mock @convex-dev/auth to use our controlled userId
let _mockUserId: Id<'users'> | null = null;
vi.mock('@convex-dev/auth/server', () => ({
  getAuthUserId: async () => _mockUserId,
  authTables: {},
}));

// Mock rate limiter to bypass in tests
vi.mock('../rateLimits', () => ({
  rateLimiter: { limit: vi.fn().mockResolvedValue({ ok: true }) },
}));

const modules = import.meta.glob('../**/*.ts');

async function createTestUser(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('users', {} as never);
  });
}

describe('attempts functions', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_SECRET', 'test-secret');
    _mockUserId = null;
  });

  async function seedChallenge(t: ReturnType<typeof convexTest>) {
    await t.mutation(api.admin.seedPack, {
      adminSecret: 'test-secret',
      name: 'Test Pack',
      slug: 'test-pack',
      description: 'test',
      language: 'javascript',
      version: '1.0.0',
      author: 'test',
      tags: ['basics'],
      challenges: [
        {
          slug: 'challenge-1',
          title: 'Challenge 1',
          prompt: 'Do it',
          difficulty: 'beginner',
          tags: ['basics'],
          timeEstimateSeconds: 300,
          hints: [],
          referenceSolution: [{ path: 'index.js', content: 'console.log("hello")' }],
          assertions: { perFile: [], crossFile: [] },
        },
      ],
    });
    const challenges = await t.run(async (ctx) => {
      return await ctx.db.query('challenges').collect();
    });
    return challenges[0]._id;
  }

  it('create stores an attempt for authenticated user', async () => {
    const t = convexTest(schema, modules);
    const challengeId = await seedChallenge(t);
    _mockUserId = await createTestUser(t);

    await t.mutation(api.attempts.create, {
      challengeId,
      passed: true,
      assertionResults: [],
      hintsUsed: 0,
    });

    const attempts = await t.run(async (ctx) => {
      return await ctx.db.query('attempts').collect();
    });
    expect(attempts).toHaveLength(1);
    expect(attempts[0].passed).toBe(true);
  });

  it('create rejects unauthenticated user', async () => {
    const t = convexTest(schema, modules);
    const challengeId = await seedChallenge(t);
    _mockUserId = null;

    await expect(
      t.mutation(api.attempts.create, {
        challengeId,
        passed: false,
        assertionResults: [],
        hintsUsed: 0,
      }),
    ).rejects.toThrow('Not authenticated');
  });

  it('list returns attempts for the authenticated user', async () => {
    const t = convexTest(schema, modules);
    const challengeId = await seedChallenge(t);
    _mockUserId = await createTestUser(t);

    await t.mutation(api.attempts.create, {
      challengeId,
      passed: false,
      assertionResults: [],
      hintsUsed: 0,
    });
    await t.mutation(api.attempts.create, {
      challengeId,
      passed: true,
      assertionResults: [],
      hintsUsed: 1,
    });

    const attempts = await t.query(api.attempts.list, { challengeId });
    expect(attempts).toHaveLength(2);
  });

  it('list returns empty for unauthenticated user', async () => {
    const t = convexTest(schema, modules);
    const challengeId = await seedChallenge(t);
    _mockUserId = null;

    const attempts = await t.query(api.attempts.list, { challengeId });
    expect(attempts).toHaveLength(0);
  });
});
