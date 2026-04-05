import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '07-substring-positions.json');

describe('Index Pairs of a String', () => {
  let indexPairs: (text: string, words: string[]) => number[][];
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ indexPairs: typeof indexPairs }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    indexPairs = mod.indexPairs;
  });

  afterAll(() => cleanup());

  it('finds non-overlapping words', () => {
    expect(indexPairs('thestoryofleetcodeandme', ['story', 'fleet', 'leetcode'])).toEqual([
      [3, 7],
      [9, 13],
      [10, 17],
    ]);
  });

  it('finds overlapping words', () => {
    expect(indexPairs('ababa', ['aba', 'ab'])).toEqual([
      [0, 1],
      [0, 2],
      [2, 3],
      [2, 4],
    ]);
  });

  it('returns empty for no matches', () => {
    expect(indexPairs('hello', ['xyz', 'abc'])).toEqual([]);
  });

  it('handles single character words', () => {
    expect(indexPairs('abab', ['a'])).toEqual([[0, 0], [2, 2]]);
  });

  it('handles word equal to text', () => {
    expect(indexPairs('hello', ['hello'])).toEqual([[0, 4]]);
  });

  it('handles empty words array', () => {
    expect(indexPairs('hello', [])).toEqual([]);
  });
});
