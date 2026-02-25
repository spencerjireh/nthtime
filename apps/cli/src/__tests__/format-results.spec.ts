import type { VerificationResult } from '@nthtime/shared';
import { formatResultLines, formatResultSummary } from '../utils/format-results.js';

function makeResult(overrides: Partial<VerificationResult> = {}): VerificationResult {
  return {
    passed: true,
    fileResults: [],
    crossFileResults: [],
    totalAssertions: 0,
    passedAssertions: 0,
    ...overrides,
  };
}

describe('formatResultLines', () => {
  it('marks passing assertions with *', () => {
    const result = makeResult({
      fileResults: [
        {
          file: 'index.js',
          passed: true,
          results: [
            { assertion: { type: 'functionDeclaration', name: 'hello', description: 'Declares hello' }, passed: true, message: '' },
          ],
        },
      ],
    });
    const lines = formatResultLines(result);
    expect(lines).toEqual([{ mark: '*', description: 'Declares hello', passed: true }]);
  });

  it('marks failing assertions with x', () => {
    const result = makeResult({
      fileResults: [
        {
          file: 'index.js',
          passed: false,
          results: [
            { assertion: { type: 'functionDeclaration', name: 'missing', description: 'Declares missing' }, passed: false, message: 'not found' },
          ],
        },
      ],
    });
    const lines = formatResultLines(result);
    expect(lines[0].mark).toBe('x');
    expect(lines[0].passed).toBe(false);
  });

  it('includes cross-file results after file results', () => {
    const result = makeResult({
      fileResults: [
        {
          file: 'a.js',
          passed: true,
          results: [
            { assertion: { type: 'functionDeclaration', name: 'a', description: 'File A assertion' }, passed: true, message: '' },
          ],
        },
      ],
      crossFileResults: [
        { assertion: { type: 'fileExists', path: 'b.js', description: 'Cross-file check' }, passed: true, message: '' },
      ],
    });
    const lines = formatResultLines(result);
    expect(lines).toHaveLength(2);
    expect(lines[0].description).toBe('File A assertion');
    expect(lines[1].description).toBe('Cross-file check');
  });

  it('returns empty array for empty results', () => {
    expect(formatResultLines(makeResult())).toEqual([]);
  });
});

describe('formatResultSummary', () => {
  it('includes "All assertions passed!" footer when all pass', () => {
    const result = makeResult({
      passed: true,
      passedAssertions: 2,
      totalAssertions: 2,
      fileResults: [
        {
          file: 'index.js',
          passed: true,
          results: [
            { assertion: { type: 'functionDeclaration', name: 'a', description: 'A' }, passed: true, message: '' },
            { assertion: { type: 'functionDeclaration', name: 'b', description: 'B' }, passed: true, message: '' },
          ],
        },
      ],
    });
    const summary = formatResultSummary(result);
    expect(summary).toContain('2/2 passing');
    expect(summary).toContain('All assertions passed!');
  });

  it('omits "All assertions passed!" when some fail', () => {
    const result = makeResult({
      passed: false,
      passedAssertions: 1,
      totalAssertions: 2,
      fileResults: [
        {
          file: 'index.js',
          passed: false,
          results: [
            { assertion: { type: 'functionDeclaration', name: 'a', description: 'A' }, passed: true, message: '' },
            { assertion: { type: 'functionDeclaration', name: 'b', description: 'B' }, passed: false, message: '' },
          ],
        },
      ],
    });
    const summary = formatResultSummary(result);
    expect(summary).toContain('1/2 passing');
    expect(summary).not.toContain('All assertions passed!');
  });
});
