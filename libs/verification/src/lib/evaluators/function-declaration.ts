import type Parser from 'web-tree-sitter';
import type { FunctionDeclarationAssertion, AssertionResult } from '@nthtime/shared';

export function evaluateFunctionDeclaration(
  tree: Parser.Tree,
  source: string,
  assertion: FunctionDeclarationAssertion,
  file: string,
): AssertionResult {
  const root = tree.rootNode;
  const nodes = [
    ...root.descendantsOfType('function_declaration'),
    ...root.descendantsOfType('arrow_function'),
    ...root.descendantsOfType('function'),
    ...root.descendantsOfType('generator_function_declaration'),
  ];

  // For arrow functions assigned to variables, we need to check the parent
  const variableDeclarators = root.descendantsOfType('variable_declarator');

  for (const node of nodes) {
    const nameNode = node.childForFieldName('name');
    if (nameNode && nameNode.text === assertion.name) {
      return checkFunctionNode(node, assertion, file, nameNode);
    }
  }

  // Check arrow functions assigned to variables: const foo = () => {}
  for (const declarator of variableDeclarators) {
    const nameNode = declarator.childForFieldName('name');
    const valueNode = declarator.childForFieldName('value');
    if (
      nameNode &&
      nameNode.text === assertion.name &&
      valueNode &&
      (valueNode.type === 'arrow_function' || valueNode.type === 'function')
    ) {
      return checkFunctionNode(valueNode, assertion, file, nameNode);
    }
  }

  return {
    assertion,
    passed: false,
    message: `Function '${assertion.name}' not found`,
    location: { file, line: 0, column: 0 },
  };
}

function checkFunctionNode(
  node: Parser.SyntaxNode,
  assertion: FunctionDeclarationAssertion,
  file: string,
  nameNode: Parser.SyntaxNode,
): AssertionResult {
  const location = {
    file,
    line: nameNode.startPosition.row + 1,
    column: nameNode.startPosition.column,
  };

  if (assertion.async !== undefined) {
    const nodeOrParent = node.parent && (node.type === 'arrow_function' || node.type === 'function')
      ? node.parent
      : node;
    const actualAsync = nodeOrParent.text.trimStart().startsWith('async');
    if (assertion.async !== actualAsync) {
      return {
        assertion,
        passed: false,
        message: `Function '${assertion.name}' should ${assertion.async ? 'be' : 'not be'} async`,
        location,
      };
    }
  }

  if (assertion.params) {
    const paramsNode = node.childForFieldName('parameters') ?? node.childForFieldName('params');
    if (paramsNode) {
      const paramNames = paramsNode.namedChildren
        .filter((c) => c.type !== 'comment')
        .map((c) => {
          // Handle typed parameters (TypeScript)
          const nameChild = c.childForFieldName('pattern') ?? c.childForFieldName('name');
          return nameChild ? nameChild.text : c.text;
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

  return { assertion, passed: true, message: `Function '${assertion.name}' found`, location };
}
