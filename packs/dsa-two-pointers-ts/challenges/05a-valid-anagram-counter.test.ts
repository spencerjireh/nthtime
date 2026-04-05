import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '05a-valid-anagram-counter.json');

describe('Valid Anagram (Map)', () => {
  let isAnagram: (s: string, t: string) => boolean;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ isAnagram: typeof isAnagram }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    isAnagram = mod.isAnagram;
  });

  afterAll(() => cleanup());

  it('basic anagram', () => {
    expect(isAnagram('anagram', 'nagaram')).toBe(true);
  });

  it('not an anagram', () => {
    expect(isAnagram('rat', 'car')).toBe(false);
  });

  it('both empty', () => {
    expect(isAnagram('', '')).toBe(true);
  });

  it('different lengths', () => {
    expect(isAnagram('a', 'ab')).toBe(false);
  });

  it('same chars different counts', () => {
    expect(isAnagram('aab', 'abb')).toBe(false);
  });

  it('single char match', () => {
    expect(isAnagram('z', 'z')).toBe(true);
  });

  it('repeated chars', () => {
    expect(isAnagram('aacc', 'ccaa')).toBe(true);
  });
});
