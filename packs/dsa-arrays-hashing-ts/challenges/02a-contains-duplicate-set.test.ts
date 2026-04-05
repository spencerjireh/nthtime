import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '02a-contains-duplicate-set.json');

describe('Contains Duplicate (Set)', () => {
  let containsDuplicate: (nums: number[]) => boolean;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ containsDuplicate: typeof containsDuplicate }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    containsDuplicate = mod.containsDuplicate;
  });

  afterAll(() => cleanup());

  it('detects duplicate', () => {
    expect(containsDuplicate([1, 2, 3, 1])).toBe(true);
  });

  it('returns false when no duplicates', () => {
    expect(containsDuplicate([1, 2, 3, 4])).toBe(false);
  });

  it('handles empty array', () => {
    expect(containsDuplicate([])).toBe(false);
  });

  it('handles single element', () => {
    expect(containsDuplicate([1])).toBe(false);
  });

  it('handles all same elements', () => {
    expect(containsDuplicate([5, 5, 5, 5])).toBe(true);
  });

  it('handles large input', () => {
    const nums = Array.from({ length: 10000 }, (_, i) => i);
    nums.push(9999);
    expect(containsDuplicate(nums)).toBe(true);
  });
});
