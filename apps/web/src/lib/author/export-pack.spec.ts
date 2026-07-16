// @vitest-environment node
// Runs in node, not jsdom: jsdom's TextEncoder yields a cross-realm Uint8Array that fflate's
// zipSync misreads as a directory, corrupting the archive. The browser has a single realm, so
// this is purely a test-environment concern. The download plumbing (document/anchor/URL) is
// stubbed below since node has no DOM.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';

import { exportPackAsZip } from './export-pack';
import { importPackFromZip } from './import-pack';

let capturedZip: Uint8Array | undefined;
let capturedBlobType: string | undefined;
let createdAnchor: { href: string; download: string; click: ReturnType<typeof vi.fn> };
const clickSpy = vi.fn();

const RealBlob = globalThis.Blob;

beforeEach(() => {
  capturedZip = undefined;
  capturedBlobType = undefined;
  clickSpy.mockReset();
  createdAnchor = { href: '', download: '', click: clickSpy };

  class CapturingBlob extends RealBlob {
    constructor(parts: BlobPart[], options?: BlobPropertyBag) {
      super(parts, options);
      capturedZip = parts[0] as Uint8Array;
      capturedBlobType = options?.type;
    }
  }
  vi.stubGlobal('Blob', CapturingBlob);
  vi.stubGlobal('document', {
    createElement: (tag: string) => (tag === 'a' ? createdAnchor : {}),
  });
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function unzipCaptured(): Record<string, string> {
  if (!capturedZip) throw new Error('no zip captured');
  const files = unzipSync(new Uint8Array(capturedZip));
  return Object.fromEntries(Object.entries(files).map(([p, c]) => [p, strFromU8(c)]));
}

const pack = {
  name: 'Arrays & Hashing',
  slug: 'arrays-hashing',
  description: 'Warm-ups',
  language: 'typescript',
  framework: undefined,
  version: '1.0.0',
  tags: ['dsa', 'arrays'],
  challenges: [
    // Deliberately out of order to prove the exporter sorts by `order`.
    {
      title: 'Two Sum',
      prompt: 'Return indices',
      difficulty: 'beginner',
      tags: ['array'],
      timeEstimateSeconds: 300,
      hints: ['use a map'],
      assertions: { perFile: { 'index.ts': [] }, crossFile: [] },
      referenceSolution: [{ path: 'index.ts', content: 'export const twoSum = () => [];' }],
      order: 2,
    },
    {
      title: 'Contains Duplicate',
      prompt: 'Return boolean',
      difficulty: 'beginner',
      tags: ['set'],
      timeEstimateSeconds: 240,
      hints: [],
      assertions: { perFile: {}, crossFile: [] },
      referenceSolution: [{ path: 'index.ts', content: 'export const hasDup = () => false;' }],
      order: 1,
    },
  ],
};

describe('exportPackAsZip (ATHR-19)', () => {
  // ATHR-19
  it('produces a ZIP with a pack.json manifest and one file per challenge', () => {
    exportPackAsZip(pack);

    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(capturedBlobType).toBe('application/zip');

    const entries = unzipCaptured();
    expect(Object.keys(entries).sort()).toEqual([
      'challenges/01-contains-duplicate.json',
      'challenges/02-two-sum.json',
      'pack.json',
    ]);
  });

  // ATHR-19
  it('writes a manifest whose challenge list is ordered by `order`', () => {
    exportPackAsZip(pack);
    const entries = unzipCaptured();

    const manifest = JSON.parse(entries['pack.json']);
    expect(manifest.slug).toBe('arrays-hashing');
    expect(manifest.name).toBe('Arrays & Hashing');
    expect(manifest.author).toBe('');
    expect(manifest.challenges).toEqual([
      'challenges/01-contains-duplicate.json',
      'challenges/02-two-sum.json',
    ]);
  });

  // ATHR-19
  it('maps referenceSolution to the `files` key in each challenge JSON', () => {
    exportPackAsZip(pack);
    const entries = unzipCaptured();

    const twoSum = JSON.parse(entries['challenges/02-two-sum.json']);
    expect(twoSum.title).toBe('Two Sum');
    expect(twoSum.files).toEqual([
      { path: 'index.ts', content: 'export const twoSum = () => [];' },
    ]);
    expect(twoSum.assertions).toEqual({ perFile: { 'index.ts': [] }, crossFile: [] });
  });

  // ATHR-19
  it('names the downloaded file after the pack slug', () => {
    exportPackAsZip(pack);
    expect(createdAnchor.download).toBe('arrays-hashing.zip');
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  // ATHR-19 / ATHR-20 -- the export is round-trippable back through the importer.
  it('round-trips through importPackFromZip', () => {
    exportPackAsZip(pack);
    const imported = importPackFromZip(new Uint8Array(capturedZip!).buffer);
    expect(imported.slug).toBe('arrays-hashing');
    expect(imported.challenges.map((c) => c.title)).toEqual(['Contains Duplicate', 'Two Sum']);
    expect(imported.challenges[1].referenceSolution).toEqual([
      { path: 'index.ts', content: 'export const twoSum = () => [];' },
    ]);
  });
});
