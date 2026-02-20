import type { Assertion, AssertionResult } from '@nthtime/shared';
import type { ParsedFile } from './types.js';
import { evaluateAssertion } from './evaluators/index.js';

export function evaluateCrossFileAssertions(
  assertions: readonly Assertion[],
  parsedFiles: readonly ParsedFile[],
): AssertionResult[] {
  const results: AssertionResult[] = [];

  for (const assertion of assertions) {
    // Cross-file assertions are evaluated across the full set of files.
    // We search for a match in any file -- if any file satisfies the assertion, it passes.
    let matched = false;
    let lastResult: AssertionResult | null = null;

    for (const pf of parsedFiles) {
      const result = evaluateAssertion(
        pf.tree,
        pf.content,
        assertion,
        pf.path,
        pf.tree.getLanguage(),
      );
      if (result.passed) {
        results.push(result);
        matched = true;
        break;
      }
      lastResult = result;
    }

    if (!matched) {
      results.push(
        lastResult ?? {
          assertion,
          passed: false,
          message: `Cross-file assertion not satisfied in any file: ${assertion.description}`,
          location: { file: '', line: 0, column: 0 },
        },
      );
    }
  }

  return results;
}
