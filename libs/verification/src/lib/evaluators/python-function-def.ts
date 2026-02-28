import type Parser from 'web-tree-sitter';
import type { PythonFunctionDefAssertion, AssertionResult } from '@nthtime/shared';

export function evaluatePythonFunctionDef(
  tree: Parser.Tree,
  _source: string,
  assertion: PythonFunctionDefAssertion,
  file: string,
): AssertionResult {
  const root = tree.rootNode;
  const funcDefs = root.descendantsOfType('function_definition');

  for (const fn of funcDefs) {
    const nameNode = fn.childForFieldName('name');
    if (!nameNode || nameNode.text !== assertion.name) continue;

    const location = {
      file,
      line: nameNode.startPosition.row + 1,
      column: nameNode.startPosition.column,
    };

    if (assertion.decorator) {
      // Decorators live on the parent `decorated_definition` node, not the function itself
      const parent = fn.parent;
      const decorators = parent?.type === 'decorated_definition'
        ? parent.descendantsOfType('decorator')
        : fn.descendantsOfType('decorator');
      const decoratorNames = decorators.map((d) => d.text.replace('@', '').split('(')[0]);
      if (!decoratorNames.includes(assertion.decorator)) {
        return {
          assertion,
          passed: false,
          message: `Function '${assertion.name}' missing decorator '@${assertion.decorator}'`,
          location,
        };
      }
    }

    if (assertion.params) {
      const paramsNode = fn.childForFieldName('parameters');
      if (paramsNode) {
        const paramTypes = ['identifier', 'typed_parameter', 'default_parameter', 'typed_default_parameter'];
        const paramNames = paramsNode.namedChildren
          .filter((c) => paramTypes.includes(c.type))
          .map((c) => {
            if (c.type !== 'identifier') {
              return c.childForFieldName('name')?.text ?? c.firstNamedChild?.text ?? c.text;
            }
            return c.text;
          });
        const expected = [...assertion.params];
        if (JSON.stringify(paramNames) !== JSON.stringify(expected)) {
          return {
            assertion,
            passed: false,
            message: `Function '${assertion.name}' expected params [${expected.join(', ')}] but found [${paramNames.join(', ')}]`,
            location,
          };
        }
      }
    }

    return {
      assertion,
      passed: true,
      message: `Python function '${assertion.name}' found`,
      location,
    };
  }

  return {
    assertion,
    passed: false,
    message: `Python function '${assertion.name}' not found`,
    location: { file, line: 0, column: 0 },
  };
}
