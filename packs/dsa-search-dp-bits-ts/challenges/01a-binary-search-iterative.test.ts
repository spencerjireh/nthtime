import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '01a-binary-search-iterative.json');

describe('Binary Search (Iterative)', () => {
  let search: (nums: number[], target: number) => number;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ search: typeof search }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    search = mod.search;
  });

  afterAll(() => cleanup());

  it('finds target in middle', () => {
    expect(search([-1, 0, 3, 5, 9, 12], 9)).toBe(4);
  });

  it('returns -1 when not found', () => {
    expect(search([-1, 0, 3, 5, 9, 12], 2)).toBe(-1);
  });

  it('finds single element', () => {
    expect(search([5], 5)).toBe(0);
  });

  it('returns -1 for empty array', () => {
    expect(search([], 3)).toBe(-1);
  });

  it('finds first element', () => {
    expect(search([1, 3, 5, 7, 9], 1)).toBe(0);
  });

  it('finds last element', () => {
    expect(search([1, 3, 5, 7, 9], 9)).toBe(4);
  });

  it('returns -1 for single element not found', () => {
    expect(search([5], 3)).toBe(-1);
  });
});
