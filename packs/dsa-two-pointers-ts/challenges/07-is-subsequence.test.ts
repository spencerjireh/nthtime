import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '07-is-subsequence.json');

describe('Is Subsequence', () => {
  let isSubsequence: (s: string, t: string) => boolean;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ isSubsequence: typeof isSubsequence }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    isSubsequence = mod.isSubsequence;
  });

  afterAll(() => cleanup());

  it('basic subsequence', () => {
    expect(isSubsequence('abc', 'ahbgdc')).toBe(true);
  });

  it('not a subsequence', () => {
    expect(isSubsequence('axc', 'ahbgdc')).toBe(false);
  });

  it('empty s', () => {
    expect(isSubsequence('', 'ahbgdc')).toBe(true);
  });

  it('nonempty s with empty t', () => {
    expect(isSubsequence('abc', '')).toBe(false);
  });

  it('single char found', () => {
    expect(isSubsequence('b', 'abc')).toBe(true);
  });

  it('both empty', () => {
    expect(isSubsequence('', '')).toBe(true);
  });

  it('identical strings', () => {
    expect(isSubsequence('abc', 'abc')).toBe(true);
  });
});
