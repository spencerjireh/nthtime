import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '04b-valid-palindrome-reverse.json');

describe('Valid Palindrome (Reverse)', () => {
  let isPalindrome: (s: string) => boolean;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ isPalindrome: typeof isPalindrome }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    isPalindrome = mod.isPalindrome;
  });

  afterAll(() => cleanup());

  it('sentence palindrome', () => {
    expect(isPalindrome('A man, a plan, a canal: Panama')).toBe(true);
  });

  it('not a palindrome', () => {
    expect(isPalindrome('race a car')).toBe(false);
  });

  it('whitespace only', () => {
    expect(isPalindrome(' ')).toBe(true);
  });

  it('mixed case with digits', () => {
    expect(isPalindrome('0P')).toBe(false);
  });

  it('empty string', () => {
    expect(isPalindrome('')).toBe(true);
  });

  it('single character', () => {
    expect(isPalindrome('a')).toBe(true);
  });

  it('punctuation only', () => {
    expect(isPalindrome('.,!')).toBe(true);
  });
});
