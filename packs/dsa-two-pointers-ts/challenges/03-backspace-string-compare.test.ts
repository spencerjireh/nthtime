import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '03-backspace-string-compare.json');

describe('Backspace String Compare', () => {
  let backspaceCompare: (s: string, t: string) => boolean;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ backspaceCompare: typeof backspaceCompare }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    backspaceCompare = mod.backspaceCompare;
  });

  afterAll(() => cleanup());

  it('matches after single backspace', () => {
    expect(backspaceCompare('ab#c', 'ad#c')).toBe(true);
  });

  it('both empty after backspaces', () => {
    expect(backspaceCompare('ab##', 'c#d#')).toBe(true);
  });

  it('does not match', () => {
    expect(backspaceCompare('a#c', 'b')).toBe(false);
  });

  it('both empty strings', () => {
    expect(backspaceCompare('', '')).toBe(true);
  });

  it('identical without backspaces', () => {
    expect(backspaceCompare('a', 'a')).toBe(true);
  });

  it('multiple backspaces clear string', () => {
    expect(backspaceCompare('abc###', '')).toBe(true);
  });

  it('leading backspace has no effect', () => {
    expect(backspaceCompare('#a', 'a')).toBe(true);
  });
});
