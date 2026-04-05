import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '02-smallest-letter.json');

describe('Smallest Letter Greater Than Target', () => {
  let nextGreatestLetter: (letters: string[], target: string) => string;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ nextGreatestLetter: typeof nextGreatestLetter }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    nextGreatestLetter = mod.nextGreatestLetter;
  });

  afterAll(() => cleanup());

  it('finds letter when target is before all', () => {
    expect(nextGreatestLetter(['c', 'f', 'j'], 'a')).toBe('c');
  });

  it('finds letter when target equals first', () => {
    expect(nextGreatestLetter(['c', 'f', 'j'], 'c')).toBe('f');
  });

  it('finds letter when target is between letters', () => {
    expect(nextGreatestLetter(['c', 'f', 'j'], 'd')).toBe('f');
  });

  it('wraps around when target is after all', () => {
    expect(nextGreatestLetter(['x', 'x', 'y', 'y'], 'z')).toBe('x');
  });

  it('wraps around when target equals last', () => {
    expect(nextGreatestLetter(['c', 'f', 'j'], 'j')).toBe('c');
  });

  it('handles all same letters', () => {
    expect(nextGreatestLetter(['a', 'a', 'a'], 'a')).toBe('a');
  });

  it('handles two letters', () => {
    expect(nextGreatestLetter(['a', 'b'], 'a')).toBe('b');
  });
});
