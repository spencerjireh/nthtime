import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../_generated/api';
import schema from '../schema';

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

  it('list returns all packs', async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('pack-a') });
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('pack-b') });

    const packs = await t.query(api.packs.list, {});
    expect(packs).toHaveLength(2);
  });

  it('list filters by language', async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('js-pack', 'javascript') });
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('py-pack', 'python') });

    const jsPacks = await t.query(api.packs.list, { language: 'javascript' });
    expect(jsPacks).toHaveLength(1);
    expect(jsPacks[0].slug).toBe('js-pack');
  });

  it('list filters by tags', async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('pack-a', 'javascript', ['react', 'frontend']) });
    await t.mutation(api.admin.seedPack, { adminSecret: 'test-secret', ...makePack('pack-b', 'javascript', ['express', 'backend']) });

    const reactPacks = await t.query(api.packs.list, { tags: ['react'] });
    expect(reactPacks).toHaveLength(1);
    expect(reactPacks[0].slug).toBe('pack-a');
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
