import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '10-convert-1d-to-2d.json');

describe('Convert 1D Array Into 2D Array', () => {
  let construct2dArray: (original: number[], m: number, n: number) => number[][];
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ construct2dArray: typeof construct2dArray }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    construct2dArray = mod.construct2dArray;
  });

  afterAll(() => cleanup());

  it('converts to 2x2', () => {
    expect(construct2dArray([1, 2, 3, 4], 2, 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('converts to single row', () => {
    expect(construct2dArray([1, 2, 3], 1, 3)).toEqual([[1, 2, 3]]);
  });

  it('returns empty for impossible conversion', () => {
    expect(construct2dArray([1, 2], 1, 1)).toEqual([]);
  });

  it('converts to single column', () => {
    expect(construct2dArray([1, 2, 3], 3, 1)).toEqual([[1], [2], [3]]);
  });

  it('handles empty array', () => {
    expect(construct2dArray([], 0, 0)).toEqual([]);
  });

  it('converts larger array', () => {
    const original = Array.from({ length: 12 }, (_, i) => i + 1);
    expect(construct2dArray(original, 3, 4)).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
    ]);
  });

  it('returns empty for size mismatch', () => {
    expect(construct2dArray([1, 2, 3, 4, 5], 2, 3)).toEqual([]);
  });
});
