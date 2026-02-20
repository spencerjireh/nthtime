import type Parser from 'web-tree-sitter';
import type { MethodCallAssertion, AssertionResult } from '@nthtime/shared';

export function evaluateMethodCall(
  tree: Parser.Tree,
  _source: string,
  assertion: MethodCallAssertion,
  file: string,
): AssertionResult {
  const root = tree.rootNode;
  const callExpressions = root.descendantsOfType('call_expression');

  for (const call of callExpressions) {
    const fn = call.childForFieldName('function');
    if (!fn) continue;

    let objectText: string | undefined;
    let methodText: string | undefined;

    if (fn.type === 'member_expression') {
      const objectNode = fn.childForFieldName('object');
      const propertyNode = fn.childForFieldName('property');
      objectText = objectNode?.text;
      methodText = propertyNode?.text;
    } else if (fn.type === 'identifier') {
      // Plain function call (no object): e.g., use('express')
      methodText = fn.text;
    }

    if (methodText !== assertion.method) continue;
    if (assertion.object && objectText !== assertion.object) continue;
    if (!assertion.object && objectText !== undefined && fn.type === 'member_expression') continue;

    const location = {
      file,
      line: call.startPosition.row + 1,
      column: call.startPosition.column,
    };

    if (assertion.args && assertion.args.length > 0) {
      const argsNode = call.childForFieldName('arguments');
      if (argsNode) {
        const argTexts = argsNode.namedChildren.map((c) => c.text.replace(/['"]/g, ''));
        for (const expected of assertion.args) {
          if (!argTexts.some((a) => a.includes(expected))) {
            return {
              assertion,
              passed: false,
              message: `Method call '${assertion.method}' missing argument containing '${expected}'`,
              location,
            };
          }
        }
      }
    }

    return {
      assertion,
      passed: true,
      message: `Method call '${assertion.object ? assertion.object + '.' : ''}${assertion.method}' found`,
      location,
    };
  }

  return {
    assertion,
    passed: false,
    message: `Method call '${assertion.object ? assertion.object + '.' : ''}${assertion.method}' not found`,
    location: { file, line: 0, column: 0 },
  };
}
