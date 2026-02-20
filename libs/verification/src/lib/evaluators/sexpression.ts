import type Parser from 'web-tree-sitter';
import type { SExpressionAssertion, AssertionResult } from '@nthtime/shared';

export function evaluateSExpression(
  tree: Parser.Tree,
  _source: string,
  assertion: SExpressionAssertion,
  file: string,
  language: Parser.Language,
): AssertionResult {
  try {
    const query = language.query(assertion.pattern);
    const matches = query.matches(tree.rootNode);

    const found = matches.length > 0;

    if (found) {
      const firstCapture = matches[0].captures[0];
      const node = firstCapture?.node;
      return {
        assertion,
        passed: true,
        message: `S-expression pattern matched (${matches.length} match${matches.length > 1 ? 'es' : ''})`,
        location: node
          ? {
              file,
              line: node.startPosition.row + 1,
              column: node.startPosition.column,
            }
          : { file, line: 0, column: 0 },
      };
    }

    return {
      assertion,
      passed: false,
      message: 'S-expression pattern did not match',
      location: { file, line: 0, column: 0 },
    };
  } catch (error) {
    return {
      assertion,
      passed: false,
      message: `S-expression query error: ${error instanceof Error ? error.message : String(error)}`,
      location: { file, line: 0, column: 0 },
    };
  }
}
