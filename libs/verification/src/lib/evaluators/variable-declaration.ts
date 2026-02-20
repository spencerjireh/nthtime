import type Parser from 'web-tree-sitter';
import type { VariableDeclarationAssertion, AssertionResult } from '@nthtime/shared';

export function evaluateVariableDeclaration(
  tree: Parser.Tree,
  _source: string,
  assertion: VariableDeclarationAssertion,
  file: string,
): AssertionResult {
  const root = tree.rootNode;
  const declarations = root.descendantsOfType('lexical_declaration')
    .concat(root.descendantsOfType('variable_declaration'));

  for (const decl of declarations) {
    const declarators = decl.descendantsOfType('variable_declarator');
    for (const declarator of declarators) {
      const nameNode = declarator.childForFieldName('name');
      if (nameNode && nameNode.text === assertion.name) {
        const location = {
          file,
          line: nameNode.startPosition.row + 1,
          column: nameNode.startPosition.column,
        };

        if (assertion.kind) {
          // Tree-sitter uses 'lexical_declaration' for const/let, 'variable_declaration' for var
          const kindText = decl.firstChild?.text;
          if (kindText !== assertion.kind) {
            return {
              assertion,
              passed: false,
              message: `Variable '${assertion.name}' should use '${assertion.kind}' but uses '${kindText}'`,
              location,
            };
          }
        }

        return {
          assertion,
          passed: true,
          message: `Variable '${assertion.name}' found`,
          location,
        };
      }
    }
  }

  return {
    assertion,
    passed: false,
    message: `Variable '${assertion.name}' not found`,
    location: { file, line: 0, column: 0 },
  };
}
