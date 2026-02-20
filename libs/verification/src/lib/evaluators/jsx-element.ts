import type Parser from 'web-tree-sitter';
import type { JsxElementAssertion, AssertionResult } from '@nthtime/shared';

export function evaluateJsxElement(
  tree: Parser.Tree,
  _source: string,
  assertion: JsxElementAssertion,
  file: string,
): AssertionResult {
  const root = tree.rootNode;

  // JSX elements can be jsx_element (with closing tag) or jsx_self_closing_element
  const jsxElements = [
    ...root.descendantsOfType('jsx_element'),
    ...root.descendantsOfType('jsx_self_closing_element'),
  ];

  for (const el of jsxElements) {
    let tagName: string | undefined;

    if (el.type === 'jsx_self_closing_element') {
      const nameNode = el.childForFieldName('name');
      tagName = nameNode?.text;
    } else {
      const openingEl = el.descendantsOfType('jsx_opening_element')[0];
      if (openingEl) {
        const nameNode = openingEl.childForFieldName('name');
        tagName = nameNode?.text;
      }
    }

    if (tagName !== assertion.name) continue;

    const location = {
      file,
      line: el.startPosition.row + 1,
      column: el.startPosition.column,
    };

    if (assertion.props && assertion.props.length > 0) {
      const attributes = el.descendantsOfType('jsx_attribute');
      const attrNames = attributes.map((a) => {
        // JSX attribute names are property_identifier nodes (first named child)
        const nameNode = a.descendantsOfType('property_identifier')[0]
          ?? a.childForFieldName('name');
        return nameNode?.text ?? '';
      });

      for (const prop of assertion.props) {
        if (!attrNames.includes(prop)) {
          return {
            assertion,
            passed: false,
            message: `JSX element '${assertion.name}' missing prop '${prop}'`,
            location,
          };
        }
      }
    }

    return {
      assertion,
      passed: true,
      message: `JSX element '${assertion.name}' found`,
      location,
    };
  }

  return {
    assertion,
    passed: false,
    message: `JSX element '${assertion.name}' not found`,
    location: { file, line: 0, column: 0 },
  };
}
