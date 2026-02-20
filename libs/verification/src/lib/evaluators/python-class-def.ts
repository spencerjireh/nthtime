import type Parser from 'web-tree-sitter';
import type { PythonClassDefAssertion, AssertionResult } from '@nthtime/shared';

export function evaluatePythonClassDef(
  tree: Parser.Tree,
  _source: string,
  assertion: PythonClassDefAssertion,
  file: string,
): AssertionResult {
  const root = tree.rootNode;
  const classDefs = root.descendantsOfType('class_definition');

  for (const cls of classDefs) {
    const nameNode = cls.childForFieldName('name');
    if (!nameNode || nameNode.text !== assertion.name) continue;

    const location = {
      file,
      line: nameNode.startPosition.row + 1,
      column: nameNode.startPosition.column,
    };

    if (assertion.bases && assertion.bases.length > 0) {
      const superclasses = cls.childForFieldName('superclasses');
      if (!superclasses) {
        return {
          assertion,
          passed: false,
          message: `Class '${assertion.name}' has no base classes but expected [${assertion.bases.join(', ')}]`,
          location,
        };
      }
      const baseNames = superclasses.namedChildren.map((c) => c.text);
      for (const base of assertion.bases) {
        if (!baseNames.includes(base)) {
          return {
            assertion,
            passed: false,
            message: `Class '${assertion.name}' missing base class '${base}'`,
            location,
          };
        }
      }
    }

    return {
      assertion,
      passed: true,
      message: `Python class '${assertion.name}' found`,
      location,
    };
  }

  return {
    assertion,
    passed: false,
    message: `Python class '${assertion.name}' not found`,
    location: { file, line: 0, column: 0 },
  };
}
