import type Parser from 'web-tree-sitter';
import type { ReturnStatementAssertion, AssertionResult } from '@nthtime/shared';

export function evaluateReturnStatement(
  tree: Parser.Tree,
  _source: string,
  assertion: ReturnStatementAssertion,
  file: string,
): AssertionResult {
  const root = tree.rootNode;
  const returnStatements = root.descendantsOfType('return_statement');

  if (returnStatements.length === 0) {
    return {
      assertion,
      passed: false,
      message: 'No return statement found',
      location: { file, line: 0, column: 0 },
    };
  }

  if (assertion.valuePattern) {
    const regex = new RegExp(assertion.valuePattern);
    for (const ret of returnStatements) {
      const valueNode = ret.namedChildren[0];
      if (valueNode && regex.test(valueNode.text)) {
        return {
          assertion,
          passed: true,
          message: `Return statement matching '${assertion.valuePattern}' found`,
          location: {
            file,
            line: ret.startPosition.row + 1,
            column: ret.startPosition.column,
          },
        };
      }
    }

    return {
      assertion,
      passed: false,
      message: `No return statement matching '${assertion.valuePattern}' found`,
      location: {
        file,
        line: returnStatements[0].startPosition.row + 1,
        column: returnStatements[0].startPosition.column,
      },
    };
  }

  const first = returnStatements[0];
  return {
    assertion,
    passed: true,
    message: 'Return statement found',
    location: {
      file,
      line: first.startPosition.row + 1,
      column: first.startPosition.column,
    },
  };
}
