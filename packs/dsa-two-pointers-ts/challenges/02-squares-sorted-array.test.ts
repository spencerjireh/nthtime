import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '02-squares-sorted-array.json');

describe('Squares of a Sorted Array', () => {
  let sortedSquares: (nums: number[]) => number[];
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ sortedSquares: typeof sortedSquares }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    sortedSquares = mod.sortedSquares;
  });

  afterAll(() => cleanup());

  it('handles mixed negatives', () => {
    expect(sortedSquares([-4, -1, 0, 3, 10])).toEqual([0, 1, 9, 16, 100]);
  });

  it('handles mixed negatives (variant)', () => {
    expect(sortedSquares([-7, -3, 2, 3, 11])).toEqual([4, 9, 9, 49, 121]);
  });

  it('handles single element', () => {
    expect(sortedSquares([1])).toEqual([1]);
  });

  it('handles all negative', () => {
    expect(sortedSquares([-5, -3, -1])).toEqual([1, 9, 25]);
  });

  it('handles all positive', () => {
    expect(sortedSquares([1, 2, 3, 4])).toEqual([1, 4, 9, 16]);
  });

  it('handles zeroes', () => {
    expect(sortedSquares([-2, 0, 0, 3])).toEqual([0, 0, 4, 9]);
  });

  it('handles single negative', () => {
    expect(sortedSquares([-1])).toEqual([1]);
  });
});
