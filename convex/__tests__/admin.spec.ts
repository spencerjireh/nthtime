import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../_generated/api';
import schema from '../schema';

const modules = import.meta.glob('../**/*.ts');

function makePack(slug: string, name?: string) {
  return {
    name: name ?? `Pack ${slug}`,
    slug,
    description: `Desc for ${slug}`,
    language: 'javascript',
    version: '1.0.0',
    author: 'test',
    tags: ['basics'],
    challenges: [
      {
        slug: 'challenge-1',
        title: 'Challenge 1',
        prompt: 'Do something',
        difficulty: 'beginner',
        tags: ['basics'],
        timeEstimateSeconds: 300,
        hints: ['hint1'],
        referenceSolution: [{ path: 'index.js', content: 'console.log("hello")' }],
        assertions: { perFile: [], crossFile: [] },
      },
    ],
  };
}

describe('admin functions', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_SECRET', 'test-secret');
  });

  it('seedPack creates a pack and challenges', async () => {
    const t = convexTest(schema, modules);
    const pack = makePack('test-pack');

    await t.mutation(api.admin.seedPack, {
      adminSecret: 'test-secret',
      ...pack,
    });

    const packs = await t.run(async (ctx) => {
      return await ctx.db.query('packs').collect();
    });
    expect(packs).toHaveLength(1);
    expect(packs[0].slug).toBe('test-pack');

    const challenges = await t.run(async (ctx) => {
      return await ctx.db.query('challenges').collect();
    });
    expect(challenges).toHaveLength(1);
    expect(challenges[0].title).toBe('Challenge 1');
  });

  it('seedPack rejects invalid admin secret', async () => {
    const t = convexTest(schema, modules);
    const pack = makePack('test-pack');

    await expect(
      t.mutation(api.admin.seedPack, {
        adminSecret: 'wrong-secret',
        ...pack,
      }),
    ).rejects.toThrow();
  });

  it('seedPack upserts on duplicate slug', async () => {
    const t = convexTest(schema, modules);

    // Seed first time
    await t.mutation(api.admin.seedPack, {
      adminSecret: 'test-secret',
      ...makePack('test-pack', 'Original'),
    });

    // Seed second time with same slug, different name
    await t.mutation(api.admin.seedPack, {
      adminSecret: 'test-secret',
      ...makePack('test-pack', 'Updated'),
    });

    const packs = await t.run(async (ctx) => {
      return await ctx.db.query('packs').collect();
    });
    expect(packs).toHaveLength(1);
    expect(packs[0].name).toBe('Updated');
  });

  it('syncPacks creates packs and cleans up stale ones', async () => {
    const t = convexTest(schema, modules);

    // Seed an initial pack
    await t.mutation(api.admin.seedPack, {
      adminSecret: 'test-secret',
      ...makePack('pack-a'),
    });

    // syncPacks with only pack-b
    await t.mutation(api.admin.syncPacks, {
      adminSecret: 'test-secret',
      packs: [makePack('pack-b')],
    });

    const packs = await t.run(async (ctx) => {
      return await ctx.db.query('packs').collect();
    });
    const slugs = packs.map((p) => p.slug);
    expect(slugs).toContain('pack-b');
    expect(slugs).not.toContain('pack-a');
  });
});
