import type Parser from 'web-tree-sitter';
import type { ExportDeclarationAssertion, AssertionResult } from '@nthtime/shared';

export function evaluateExportDeclaration(
  tree: Parser.Tree,
  _source: string,
  assertion: ExportDeclarationAssertion,
  file: string,
): AssertionResult {
  const root = tree.rootNode;
  const exportStatements = root.descendantsOfType('export_statement');

  for (const exp of exportStatements) {
    const isDefault = exp.children.some((c) => c.type === 'default');

    if (assertion.isDefault && isDefault) {
      // For default exports, look for the exported value
      const declaration = exp.childForFieldName('declaration')
        ?? exp.childForFieldName('value');
      if (declaration) {
        const nameNode = declaration.childForFieldName('name');
        const nameText = nameNode?.text ?? declaration.text;
        if (nameText === assertion.name || assertion.name === 'default') {
          return {
            assertion,
            passed: true,
            message: `Default export '${assertion.name}' found`,
            location: {
              file,
              line: exp.startPosition.row + 1,
              column: exp.startPosition.column,
            },
          };
        }
      }
      // Default export of identifier: export default foo
      const identifiers = exp.descendantsOfType('identifier');
      for (const id of identifiers) {
        if (id.text === assertion.name) {
          return {
            assertion,
            passed: true,
            message: `Default export '${assertion.name}' found`,
            location: {
              file,
              line: exp.startPosition.row + 1,
              column: exp.startPosition.column,
            },
          };
        }
      }
      continue;
    }

    if (!assertion.isDefault && !isDefault) {
      // Named export: look for the name in the declaration
      const declaration = exp.childForFieldName('declaration');
      if (declaration) {
        const nameNode = declaration.childForFieldName('name');
        if (nameNode && nameNode.text === assertion.name) {
          return {
            assertion,
            passed: true,
            message: `Named export '${assertion.name}' found`,
            location: {
              file,
              line: exp.startPosition.row + 1,
              column: exp.startPosition.column,
            },
          };
        }
        // Check variable declarators inside export
        const declarators = declaration.descendantsOfType('variable_declarator');
        for (const d of declarators) {
          const n = d.childForFieldName('name');
          if (n && n.text === assertion.name) {
            return {
              assertion,
              passed: true,
              message: `Named export '${assertion.name}' found`,
              location: {
                file,
                line: exp.startPosition.row + 1,
                column: exp.startPosition.column,
              },
            };
          }
        }
      }

      // Check export specifiers: export { foo, bar }
      const specifiers = exp.descendantsOfType('export_specifier');
      for (const spec of specifiers) {
        const nameNode = spec.childForFieldName('name');
        const aliasNode = spec.childForFieldName('alias');
        const name = aliasNode?.text ?? nameNode?.text;
        if (name === assertion.name) {
          return {
            assertion,
            passed: true,
            message: `Named export '${assertion.name}' found`,
            location: {
              file,
              line: exp.startPosition.row + 1,
              column: exp.startPosition.column,
            },
          };
        }
      }
    }
  }

  return {
    assertion,
    passed: false,
    message: `Export '${assertion.name}' not found`,
    location: { file, line: 0, column: 0 },
  };
}
