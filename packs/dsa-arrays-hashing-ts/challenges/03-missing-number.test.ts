import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '03-missing-number.json');

describe('Missing Number', () => {
  let missingNumber: (nums: number[]) => number;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ missingNumber: typeof missingNumber }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    missingNumber = mod.missingNumber;
  });

  afterAll(() => cleanup());

  it('finds middle missing number', () => {
    expect(missingNumber([3, 0, 1])).toBe(2);
  });

  it('finds last missing number', () => {
    expect(missingNumber([0, 1])).toBe(2);
  });

  it('handles larger array', () => {
    expect(missingNumber([9, 6, 4, 2, 3, 5, 7, 0, 1])).toBe(8);
  });

  it('handles single element', () => {
    expect(missingNumber([0])).toBe(1);
  });

  it('finds zero as missing', () => {
    expect(missingNumber([1])).toBe(0);
  });

  it('handles sequential array with gap', () => {
    const nums = Array.from({ length: 999 }, (_, i) => (i < 500 ? i : i + 1));
    expect(missingNumber(nums)).toBe(500);
  });
});
