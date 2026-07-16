import { describe, it, expect } from 'vitest';

import { ASSERTION_SNIPPETS } from './assertion-snippets';

// ATHR-15 -- the Assertions tab snippet palette offers a template for all 12 assertion types.
describe('ASSERTION_SNIPPETS', () => {
  const EXPECTED_TYPES = [
    'functionDeclaration',
    'variableDeclaration',
    'importDeclaration',
    'exportDeclaration',
    'methodCall',
    'returnStatement',
    'classDeclaration',
    'jsxElement',
    'pythonFunctionDef',
    'pythonClassDef',
    'pythonImport',
    'sexpression',
  ];

  it('offers exactly 12 snippet templates', () => {
    expect(ASSERTION_SNIPPETS).toHaveLength(12);
  });

  it('covers every supported assertion type', () => {
    const types = ASSERTION_SNIPPETS.map((s) => s.type);
    expect(new Set(types)).toEqual(new Set(EXPECTED_TYPES));
  });

  it('gives each snippet a label and a template whose type matches its declared type', () => {
    for (const snippet of ASSERTION_SNIPPETS) {
      expect(snippet.label).toBeTruthy();
      expect(snippet.template.type).toBe(snippet.type);
      // Every template ships a human-readable description placeholder.
      expect(snippet.template.description).toBeTruthy();
    }
  });
});
