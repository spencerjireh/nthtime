import type Parser from 'web-tree-sitter';
import type { ClassDeclarationAssertion, AssertionResult } from '@nthtime/shared';

export function evaluateClassDeclaration(
  tree: Parser.Tree,
  _source: string,
  assertion: ClassDeclarationAssertion,
  file: string,
): AssertionResult {
  const root = tree.rootNode;
  const classes = root.descendantsOfType('class_declaration');

  for (const cls of classes) {
    const nameNode = cls.childForFieldName('name');
    if (!nameNode || nameNode.text !== assertion.name) continue;

    const location = {
      file,
      line: nameNode.startPosition.row + 1,
      column: nameNode.startPosition.column,
    };

    if (assertion.extends) {
      const heritage = cls.descendantsOfType('class_heritage');
      const extendsClause = heritage.length > 0 ? heritage[0] : null;
      if (!extendsClause) {
        return {
          assertion,
          passed: false,
          message: `Class '${assertion.name}' should extend '${assertion.extends}'`,
          location,
        };
      }
      const extendsName = extendsClause.descendantsOfType('identifier')[0]?.text;
      if (extendsName !== assertion.extends) {
        return {
          assertion,
          passed: false,
          message: `Class '${assertion.name}' extends '${extendsName}' but should extend '${assertion.extends}'`,
          location,
        };
      }
    }

    if (assertion.implements && assertion.implements.length > 0) {
      const text = cls.text;
      for (const impl of assertion.implements) {
        if (!text.includes(impl)) {
          return {
            assertion,
            passed: false,
            message: `Class '${assertion.name}' should implement '${impl}'`,
            location,
          };
        }
      }
    }

    return {
      assertion,
      passed: true,
      message: `Class '${assertion.name}' found`,
      location,
    };
  }

  return {
    assertion,
    passed: false,
    message: `Class '${assertion.name}' not found`,
    location: { file, line: 0, column: 0 },
  };
}
