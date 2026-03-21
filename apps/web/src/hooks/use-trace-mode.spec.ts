import { normalizeLines } from './use-trace-mode';

describe('normalizeLines', () => {
  it('returns lines unchanged when count matches', () => {
    expect(normalizeLines(['a', 'b', 'c'], 3)).toEqual(['a', 'b', 'c']);
  });

  it('pads with empty lines when too few', () => {
    expect(normalizeLines(['a'], 3)).toEqual(['a', '', '']);
  });

  it('truncates excess lines', () => {
    expect(normalizeLines(['a', 'b', 'c', 'd'], 2)).toEqual(['a', 'b']);
  });

  it('handles empty input', () => {
    expect(normalizeLines([], 3)).toEqual(['', '', '']);
  });

  it('handles single line target', () => {
    expect(normalizeLines(['a', 'b', 'c'], 1)).toEqual(['a']);
  });
});
