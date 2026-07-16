// @vitest-environment node
// Runs in node, not jsdom: jsdom's TextEncoder yields a cross-realm Uint8Array that fflate's
// zipSync misreads as a directory. In the browser (one realm) this never happens.
import { describe, it, expect } from 'vitest';
import { zipSync, strToU8 } from 'fflate';

import { importPackFromZip } from './import-pack';

function zipToBuffer(entries: Record<string, string>): ArrayBuffer {
  const zip = zipSync(Object.fromEntries(Object.entries(entries).map(([p, c]) => [p, strToU8(c)])));
  // Copy into a fresh, exactly-sized ArrayBuffer. Slicing `zip.buffer` is unreliable under
  // vitest's module realm, so materialize the bytes with a new Uint8Array.
  return new Uint8Array(zip).buffer;
}

const challengeFile = JSON.stringify({
  title: 'Two Sum',
  prompt: 'Return indices',
  difficulty: 'intermediate',
  tags: ['array'],
  timeEstimateSeconds: 420,
  files: [{ path: 'index.ts', content: 'export const twoSum = () => [];' }],
  hints: ['use a map'],
  assertions: { perFile: { 'index.ts': [] }, crossFile: [] },
});

describe('importPackFromZip (ATHR-20)', () => {
  // ATHR-20 -- format 1: root pack.json referencing challenge files by path.
  it('auto-detects a root pack.json with path-referenced challenges', () => {
    const buf = zipToBuffer({
      'pack.json': JSON.stringify({
        name: 'Arrays',
        slug: 'arrays',
        description: 'd',
        language: 'typescript',
        version: '1.0.0',
        tags: ['dsa'],
        challenges: ['challenges/01-two-sum.json'],
      }),
      'challenges/01-two-sum.json': challengeFile,
    });

    const result = importPackFromZip(buf);
    expect(result.slug).toBe('arrays');
    expect(result.challenges).toHaveLength(1);
    // The importer maps the challenge JSON `files` key onto referenceSolution.
    expect(result.challenges[0].referenceSolution).toEqual([
      { path: 'index.ts', content: 'export const twoSum = () => [];' },
    ]);
    expect(result.challenges[0].difficulty).toBe('intermediate');
  });

  // ATHR-20 -- format 2: nested "<name>/pack.json" with a directory prefix.
  it('auto-detects a nested pack.json and strips the directory prefix', () => {
    const buf = zipToBuffer({
      'my-pack/pack.json': JSON.stringify({
        name: 'Nested',
        slug: 'nested',
        description: 'd',
        language: 'typescript',
        challenges: ['challenges/01-two-sum.json'],
      }),
      'my-pack/challenges/01-two-sum.json': challengeFile,
    });

    const result = importPackFromZip(buf);
    expect(result.slug).toBe('nested');
    expect(result.challenges).toHaveLength(1);
    expect(result.challenges[0].title).toBe('Two Sum');
  });

  // ATHR-20 -- format 3: inline challenge objects in the manifest.
  it('auto-detects an inline challenges array', () => {
    const buf = zipToBuffer({
      'pack.json': JSON.stringify({
        name: 'Inline',
        slug: 'inline',
        description: 'd',
        language: 'typescript',
        challenges: [
          {
            title: 'Inline One',
            prompt: 'p',
            files: [{ path: 'a.ts', content: 'x' }],
          },
        ],
      }),
    });

    const result = importPackFromZip(buf);
    expect(result.slug).toBe('inline');
    expect(result.challenges[0].title).toBe('Inline One');
    // Defaults are applied for omitted fields.
    expect(result.challenges[0].difficulty).toBe('beginner');
    expect(result.challenges[0].timeEstimateSeconds).toBe(300);
    expect(result.challenges[0].referenceSolution).toEqual([{ path: 'a.ts', content: 'x' }]);
  });

  // ATHR-20 -- version defaults to 1.0.0 and tags default to [].
  it('applies manifest defaults for version and tags', () => {
    const buf = zipToBuffer({
      'pack.json': JSON.stringify({
        name: 'Bare',
        slug: 'bare',
        description: 'd',
        language: 'typescript',
        challenges: [],
      }),
    });

    const result = importPackFromZip(buf);
    expect(result.version).toBe('1.0.0');
    expect(result.tags).toEqual([]);
  });

  // ATHR-20 -- a ZIP with no manifest is rejected.
  it('throws when no pack.json is present', () => {
    const buf = zipToBuffer({ 'readme.txt': 'not a pack' });
    expect(() => importPackFromZip(buf)).toThrow('No pack.json found in ZIP');
  });

  // ATHR-20 -- a dangling challenge path reference is reported.
  it('throws when a referenced challenge file is missing', () => {
    const buf = zipToBuffer({
      'pack.json': JSON.stringify({
        name: 'Broken',
        slug: 'broken',
        description: 'd',
        language: 'typescript',
        challenges: ['challenges/missing.json'],
      }),
    });
    expect(() => importPackFromZip(buf)).toThrow(
      'Challenge file not found: challenges/missing.json',
    );
  });
});
