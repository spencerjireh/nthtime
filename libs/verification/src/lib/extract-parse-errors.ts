import type Parser from 'web-tree-sitter';

export interface ParseDiagnostic {
  readonly message: string;
  readonly startLine: number;
  readonly startColumn: number;
  readonly endLine: number;
  readonly endColumn: number;
}

/**
 * Walk a Tree-sitter parse tree and collect ERROR / MISSING nodes as diagnostics.
 * Lines and columns are 1-based for Monaco compatibility.
 */
export function extractParseErrors(tree: Parser.Tree): ParseDiagnostic[] {
  if (!tree.rootNode.hasError) return [];

  const diagnostics: ParseDiagnostic[] = [];
  const cursor = tree.walk();
  let reachedRoot = false;

  while (!reachedRoot) {
    const node = cursor.currentNode;

    if (node.type === 'ERROR' || node.type === 'MISSING') {
      diagnostics.push({
        message:
          node.type === 'MISSING'
            ? `Missing ${node.text || 'token'}`
            : 'Syntax error',
        startLine: node.startPosition.row + 1,
        startColumn: node.startPosition.column + 1,
        endLine: node.endPosition.row + 1,
        endColumn: node.endPosition.column + 1,
      });

      // Don't descend into error nodes -- the parent error is sufficient
      if (!cursor.gotoNextSibling()) {
        while (true) {
          if (!cursor.gotoParent()) {
            reachedRoot = true;
            break;
          }
          if (cursor.gotoNextSibling()) break;
        }
      }
      continue;
    }

    if (cursor.gotoFirstChild()) continue;
    if (cursor.gotoNextSibling()) continue;

    while (true) {
      if (!cursor.gotoParent()) {
        reachedRoot = true;
        break;
      }
      if (cursor.gotoNextSibling()) break;
    }
  }

  return diagnostics;
}
