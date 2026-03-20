'use client';

import { useEffect, useRef } from 'react';
import type { OnMount } from '@monaco-editor/react';

type EditorInstance = Parameters<OnMount>[0];
type MonacoInstance = Parameters<OnMount>[1];

/**
 * Convert a character offset in a string to a Monaco-style {lineNumber, column} position.
 */
export function offsetToPosition(
  content: string,
  offset: number,
): { lineNumber: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < offset && i < content.length; i++) {
    if (content[i] === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { lineNumber: line, column: col };
}

/**
 * Trace mode: pre-fills the editor with the reference solution and overlays a ghost
 * decoration (grey, italic) from the cursor position to the end of the file.
 * The editor behaves normally -- no key interception or cursor locking.
 */
export function useTraceMode(
  editor: EditorInstance | null,
  monaco: MonacoInstance | null,
  activeFilePath: string | null,
  referenceSolutionFiles: Record<string, { content: string }> | null,
  enabled: boolean,
): void {
  const referenceRef = useRef<string | null>(null);
  const decorationCollectionRef = useRef<ReturnType<
    EditorInstance['createDecorationsCollection']
  > | null>(null);
  const cursorDisposableRef = useRef<{ dispose(): void } | null>(null);

  // Sync reference content from props
  useEffect(() => {
    referenceRef.current =
      (activeFilePath && referenceSolutionFiles?.[activeFilePath]?.content) ?? null;
  }, [activeFilePath, referenceSolutionFiles]);

  // Main effect: manage ghost decoration overlay
  useEffect(() => {
    if (!editor || !monaco) return;

    function dispose() {
      cursorDisposableRef.current?.dispose();
      cursorDisposableRef.current = null;
      decorationCollectionRef.current?.set([]);
    }

    if (!enabled) {
      dispose();
      return;
    }

    const refContent = referenceRef.current;
    if (!refContent || !activeFilePath) {
      dispose();
      return;
    }

    const model = editor.getModel();
    if (!model) return;

    // Initialize decoration collection once
    if (!decorationCollectionRef.current) {
      decorationCollectionRef.current = editor.createDecorationsCollection([]);
    }

    // Pre-fill editor with the full reference solution
    if (model.getValue() !== refContent) {
      model.setValue(refContent);
    }

    function updateGhost(lineNumber: number, column: number) {
      if (!decorationCollectionRef.current || !model) return;

      const lastLine = model.getLineCount();
      const lastCol = model.getLineMaxColumn(lastLine);

      // If cursor is at or past end of content, clear decorations
      if (lineNumber > lastLine || (lineNumber === lastLine && column >= lastCol)) {
        decorationCollectionRef.current.set([]);
        return;
      }

      decorationCollectionRef.current.set([
        {
          range: new monaco!.Range(lineNumber, column, lastLine, lastCol),
          options: { inlineClassName: 'ghost-text' },
        },
      ]);
    }

    // Apply initial ghost from cursor position
    const pos = editor.getPosition();
    if (pos) {
      updateGhost(pos.lineNumber, pos.column);
    }

    // Update ghost on every cursor movement
    cursorDisposableRef.current?.dispose();
    cursorDisposableRef.current = editor.onDidChangeCursorPosition((e) => {
      updateGhost(e.position.lineNumber, e.position.column);
    });

    return dispose;
  }, [editor, monaco, enabled, activeFilePath]);
}
