import type { AssertionResult } from '@nthtime/shared';

export interface DecorationInput {
  readonly startLine: number;
  readonly endLine: number;
  readonly startColumn: number;
  readonly endColumn: number;
  readonly message: string;
  readonly description: string;
}

/**
 * Build decoration inputs from failed assertion results that have valid locations.
 * Filters to only failed assertions with line > 0.
 */
export function buildDecorationInputs(results: readonly AssertionResult[]): DecorationInput[] {
  const decorations: DecorationInput[] = [];

  for (const r of results) {
    if (r.passed || !r.location || r.location.line <= 0) continue;

    decorations.push({
      startLine: r.location.line,
      endLine: r.location.endLine ?? r.location.line,
      startColumn: r.location.column,
      endColumn: r.location.endColumn ?? r.location.column,
      message: r.message,
      description: r.assertion.description,
    });
  }

  return decorations;
}
