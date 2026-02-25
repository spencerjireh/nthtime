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

describe('settings functions', () => {
  beforeEach(() => {
    _mockUserId = null;
  });

  it('get returns defaults for unauthenticated user', async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.settings.get, {});
    expect(result.feedback.showPassFail).toBe(true);
    expect(result.feedback.showAssertionDetails).toBe(true);
    expect(result.feedback.showDiff).toBe(false);
    expect(result.feedback.showSolution).toBe(false);
    expect(result.keybindings).toBe('default');
    expect(result.darkMode).toBe(true);
  });

  it('get returns defaults for authenticated user with no saved settings', async () => {
    const t = convexTest(schema, modules);
    _mockUserId = await createTestUser(t);
    const result = await t.query(api.settings.get, {});
    expect(result.feedback.showPassFail).toBe(true);
    expect(result.keybindings).toBe('default');
  });

  it('update creates settings for new user', async () => {
    const t = convexTest(schema, modules);
    _mockUserId = await createTestUser(t);

    const result = await t.mutation(api.settings.update, {
      keybindings: 'vim',
    });
    expect(result.keybindings).toBe('vim');
    expect(result.feedback.showPassFail).toBe(true);
  });

  it('update patches existing settings', async () => {
    const t = convexTest(schema, modules);
    _mockUserId = await createTestUser(t);

    await t.mutation(api.settings.update, { keybindings: 'vim' });
    await t.mutation(api.settings.update, { darkMode: false });

    const settings = await t.query(api.settings.get, {});
    expect(settings.keybindings).toBe('vim');
    expect(settings.darkMode).toBe(false);
  });

  it('update saves feedback flags', async () => {
    const t = convexTest(schema, modules);
    _mockUserId = await createTestUser(t);

    await t.mutation(api.settings.update, {
      feedback: { showDiff: true, showSolution: true },
    });

    const settings = await t.query(api.settings.get, {});
    expect(settings.feedback.showDiff).toBe(true);
    expect(settings.feedback.showSolution).toBe(true);
    // Other feedback flags at defaults
    expect(settings.feedback.showPassFail).toBe(true);
  });

  it('update rejects unauthenticated user', async () => {
    const t = convexTest(schema, modules);
    _mockUserId = null;
    await expect(
      t.mutation(api.settings.update, { keybindings: 'vim' }),
    ).rejects.toThrow('Not authenticated');
  });
});
