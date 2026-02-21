import { describe, it, expect } from 'vitest';
import { parseFile } from './parser.js';
import { extractParseErrors } from './extract-parse-errors.js';

describe('extractParseErrors', () => {
  it('returns empty array for valid JavaScript', async () => {
    const parsed = await parseFile({ path: 'app.js', content: 'const x = 1;' });
    expect(parsed).not.toBeNull();
    const errors = extractParseErrors(parsed!.tree);
    expect(errors).toEqual([]);
  });

  it('returns errors for JavaScript with syntax error', async () => {
    const parsed = await parseFile({ path: 'app.js', content: 'const x = ;' });
    expect(parsed).not.toBeNull();
    const errors = extractParseErrors(parsed!.tree);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].startLine).toBe(1);
    expect(errors[0].startColumn).toBeGreaterThan(0);
  });

  it('returns empty array for valid Python', async () => {
    const parsed = await parseFile({ path: 'app.py', content: 'def foo():\n    pass' });
    expect(parsed).not.toBeNull();
    const errors = extractParseErrors(parsed!.tree);
    expect(errors).toEqual([]);
  });

  it('returns errors for Python with syntax error', async () => {
    const parsed = await parseFile({ path: 'app.py', content: 'def foo(\n    pass' });
    expect(parsed).not.toBeNull();
    const errors = extractParseErrors(parsed!.tree);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('reports correct line for multi-line code', async () => {
    const code = 'const a = 1;\nconst b = ;\nconst c = 3;';
    const parsed = await parseFile({ path: 'app.js', content: code });
    expect(parsed).not.toBeNull();
    const errors = extractParseErrors(parsed!.tree);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].startLine).toBe(2);
  });
});
