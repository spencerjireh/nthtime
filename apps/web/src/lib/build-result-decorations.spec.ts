import { describe, it, expect } from 'vitest';
import { buildDecorationInputs } from './build-result-decorations';
import type { AssertionResult } from '@nthtime/shared';

const makeResult = (
  passed: boolean,
  location?: { line: number; column: number; endLine?: number; endColumn?: number },
): AssertionResult => ({
  assertion: {
    type: 'functionDeclaration',
    name: 'test',
    description: 'should have test function',
  },
  passed,
  message: passed ? 'Found' : 'Not found',
  location: location
    ? { file: 'app.js', ...location }
    : undefined,
});

describe('buildDecorationInputs', () => {
  it('returns empty for all-passing results', () => {
    const results = [makeResult(true, { line: 1, column: 1 })];
    expect(buildDecorationInputs(results)).toEqual([]);
  });

  it('returns decoration inputs for failures with location', () => {
    const results = [makeResult(false, { line: 5, column: 3 })];
    const decorations = buildDecorationInputs(results);
    expect(decorations).toHaveLength(1);
    expect(decorations[0].startLine).toBe(5);
    expect(decorations[0].startColumn).toBe(3);
    expect(decorations[0].message).toBe('Not found');
    expect(decorations[0].description).toBe('should have test function');
  });

  it('skips failures without location', () => {
    const results = [makeResult(false)];
    expect(buildDecorationInputs(results)).toEqual([]);
  });

  it('skips failures with line=0', () => {
    const results = [makeResult(false, { line: 0, column: 0 })];
    expect(buildDecorationInputs(results)).toEqual([]);
  });

  it('uses endLine/endColumn when available', () => {
    const results = [makeResult(false, { line: 5, column: 3, endLine: 7, endColumn: 10 })];
    const decorations = buildDecorationInputs(results);
    expect(decorations[0].endLine).toBe(7);
    expect(decorations[0].endColumn).toBe(10);
  });
});
