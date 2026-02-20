import type Parser from 'web-tree-sitter';
import type { ImportDeclarationAssertion, AssertionResult } from '@nthtime/shared';

export function evaluateImportDeclaration(
  tree: Parser.Tree,
  _source: string,
  assertion: ImportDeclarationAssertion,
  file: string,
): AssertionResult {
  const root = tree.rootNode;
  const imports = root.descendantsOfType('import_statement');

  for (const imp of imports) {
    const sourceNode = imp.childForFieldName('source');
    if (!sourceNode) continue;

    // Remove quotes from the string value
    const sourceText = sourceNode.text.replace(/['"]/g, '');
    if (sourceText !== assertion.source) continue;

    const location = {
      file,
      line: imp.startPosition.row + 1,
      column: imp.startPosition.column,
    };

    if (assertion.specifiers && assertion.specifiers.length > 0) {
      const importClause = imp.descendantsOfType('import_clause')[0]
        ?? imp.descendantsOfType('named_imports')[0];

      if (!importClause) {
        return {
          assertion,
          passed: false,
          message: `Import from '${assertion.source}' found but no specifiers`,
          location,
        };
      }

      const specifierNodes = imp.descendantsOfType('import_specifier');
      const defaultImport = importClause.descendantsOfType('identifier');
      const specifierNames = [
        ...defaultImport
          .filter((n) => n.parent?.type === 'import_clause')
          .map((n) => n.text),
        ...specifierNodes.map((s) => {
          const alias = s.childForFieldName('alias');
          return alias ? alias.text : s.childForFieldName('name')?.text ?? s.text;
        }),
      ];

      for (const expected of assertion.specifiers) {
        if (!specifierNames.includes(expected)) {
          return {
            assertion,
            passed: false,
            message: `Import from '${assertion.source}' missing specifier '${expected}'`,
            location,
          };
        }
      }
    }

    return {
      assertion,
      passed: true,
      message: `Import from '${assertion.source}' found`,
      location,
    };
  }

  return {
    assertion,
    passed: false,
    message: `Import from '${assertion.source}' not found`,
    location: { file, line: 0, column: 0 },
  };
}
