import type Parser from 'web-tree-sitter';
import type { PythonImportAssertion, AssertionResult } from '@nthtime/shared';

export function evaluatePythonImport(
  tree: Parser.Tree,
  _source: string,
  assertion: PythonImportAssertion,
  file: string,
): AssertionResult {
  const root = tree.rootNode;

  // Python has import_statement (import X) and import_from_statement (from X import Y)
  const importStatements = root.descendantsOfType('import_statement');
  const importFromStatements = root.descendantsOfType('import_from_statement');

  // Check "import X" style
  for (const imp of importStatements) {
    const nameNode = imp.childForFieldName('name');
    if (nameNode && nameNode.text === assertion.module) {
      return {
        assertion,
        passed: true,
        message: `Python import '${assertion.module}' found`,
        location: {
          file,
          line: imp.startPosition.row + 1,
          column: imp.startPosition.column,
        },
      };
    }
    // Check dotted names
    const dottedNames = imp.descendantsOfType('dotted_name');
    for (const dn of dottedNames) {
      if (dn.text === assertion.module) {
        return {
          assertion,
          passed: true,
          message: `Python import '${assertion.module}' found`,
          location: {
            file,
            line: imp.startPosition.row + 1,
            column: imp.startPosition.column,
          },
        };
      }
    }
  }

  // Check "from X import Y" style
  for (const imp of importFromStatements) {
    const moduleNode = imp.childForFieldName('module_name');
    const moduleText = moduleNode?.text;
    if (moduleText !== assertion.module) continue;

    const location = {
      file,
      line: imp.startPosition.row + 1,
      column: imp.startPosition.column,
    };

    if (assertion.names && assertion.names.length > 0) {
      const importedNames = imp.descendantsOfType('dotted_name')
        .filter((n) => n !== moduleNode)
        .map((n) => n.text);
      const aliasedImports = imp.descendantsOfType('aliased_import')
        .map((n) => n.childForFieldName('name')?.text ?? n.text);
      const allNames = [...importedNames, ...aliasedImports];

      for (const name of assertion.names) {
        if (!allNames.includes(name)) {
          return {
            assertion,
            passed: false,
            message: `Import from '${assertion.module}' missing name '${name}'`,
            location,
          };
        }
      }
    }

    return {
      assertion,
      passed: true,
      message: `Python import from '${assertion.module}' found`,
      location,
    };
  }

  return {
    assertion,
    passed: false,
    message: `Python import '${assertion.module}' not found`,
    location: { file, line: 0, column: 0 },
  };
}
