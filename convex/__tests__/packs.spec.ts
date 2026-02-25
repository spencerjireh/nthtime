import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../_generated/api';
import schema from '../schema';

// Mock rate limiter to bypass in tests
vi.mock('../rateLimits', () => ({
  rateLimiter: { limit: vi.fn().mockResolvedValue({ ok: true }) },
}));

const modules = import.meta.glob('../**/*.ts');

function makePack(slug: string, lang = 'javascript', tags = ['basics']) {
  return {
    name: `Pack ${slug}`,
    slug,
    description: `Desc for ${slug}`,
    language: lang,
    version: '1.0.0',
    author: 'test',
    tags,
    challenges: [
      {
        slug: 'challenge-1',
        title: `Challenge in ${slug}`,
        prompt: 'Do it',
        difficulty: 'beginner',
        tags: ['basics'],
        timeEstimateSeconds: 300,
        scaffolded: true,
        files: [{ path: 'index.js', content: 'console.log("hello")' }],
        hints: ['hint1'],
        assertions: { perFile: [], crossFile: [] },
      },
    ],
  };
}

describe('packs queries', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_SECRET', 'test-secret');
  });

  it('list returns all packs with availableTags', async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('pack-a') });
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('pack-b') });

    const result = await t.query(api.packs.list, {});
    expect(result.packs).toHaveLength(2);
    expect(result.availableTags).toEqual(['basics']);
  });

  it('list filters by language', async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('js-pack', 'javascript') });
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('py-pack', 'python') });

    const result = await t.query(api.packs.list, { language: 'javascript' });
    expect(result.packs).toHaveLength(1);
    expect(result.packs[0].slug).toBe('js-pack');
    // availableTags includes tags from ALL packs (collected before filtering)
    expect(result.availableTags).toEqual(['basics']);
  });

  it('list filters by tags', async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('pack-a', 'javascript', ['react', 'frontend']) });
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('pack-b', 'javascript', ['express', 'backend']) });

    const result = await t.query(api.packs.list, { tags: ['react'] });
    expect(result.packs).toHaveLength(1);
    expect(result.packs[0].slug).toBe('pack-a');
    expect(result.availableTags).toEqual(['backend', 'express', 'frontend', 'react']);
  });

  it('getChallenges returns pack and challenges', async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('pack-a') });

    const result = await t.query(api.packs.getChallenges, { slug: 'pack-a' });
    expect(result).not.toBeNull();
    expect(result!.pack.slug).toBe('pack-a');
    expect(result!.challenges).toHaveLength(1);
    expect(result!.challenges[0].title).toBe('Challenge in pack-a');
  });

  it('getChallenges returns null for unknown slug', async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.packs.getChallenges, { slug: 'nonexistent' });
    expect(result).toBeNull();
  });
});
