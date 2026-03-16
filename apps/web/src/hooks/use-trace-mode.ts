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
 * MonkeyType-style trace mode: pre-fills the editor with the reference solution,
 * ghosts the entire content, and un-ghosts characters as the user types them correctly.
 *
 * The editor content never changes -- only the decoration boundary and cursor move.
 */
export function useTraceMode(
  editor: EditorInstance | null,
  monaco: MonacoInstance | null,
  activeFilePath: string | null,
  referenceSolutionFiles: Record<string, { content: string }> | null,
  enabled: boolean,
): void {
  const referenceRef = useRef<string | null>(null);
  const typedOffsetsRef = useRef<Map<string, number>>(new Map());
  const decorationCollectionRef = useRef<ReturnType<
    EditorInstance['createDecorationsCollection']
  > | null>(null);
  const keyDownDisposableRef = useRef<{ dispose(): void } | null>(null);
  const cursorDisposableRef = useRef<{ dispose(): void } | null>(null);

  // Sync reference content from props
  useEffect(() => {
    referenceRef.current =
      (activeFilePath && referenceSolutionFiles?.[activeFilePath]?.content) ?? null;
  }, [activeFilePath, referenceSolutionFiles]);

  // Main effect: manage decorations, key interception, and cursor locking
  useEffect(() => {
    if (!editor || !monaco) return;

    function dispose() {
      keyDownDisposableRef.current?.dispose();
      keyDownDisposableRef.current = null;
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

    // Get/init typed offset for this file
    if (!typedOffsetsRef.current.has(activeFilePath)) {
      typedOffsetsRef.current.set(activeFilePath, 0);
    }

    // Capture for stable closure references
    const filePath = activeFilePath;

    function getOffset(): number {
      return typedOffsetsRef.current.get(filePath) ?? 0;
    }

    function setOffset(offset: number) {
      typedOffsetsRef.current.set(filePath, offset);
    }

    // Guard flag prevents recursive cursor-position events
    let lockingCursor = false;

    function applyGhost(offset: number) {
      const ref = referenceRef.current;
      if (!ref || !decorationCollectionRef.current) return;

      if (offset >= ref.length) {
        // Fully typed -- no ghost needed
        decorationCollectionRef.current.set([]);
      } else {
        const ghostStart = offsetToPosition(ref, offset);
        const lastLine = model!.getLineCount();
        const lastCol = model!.getLineMaxColumn(lastLine);

        decorationCollectionRef.current.set([
          {
            range: new monaco!.Range(
              ghostStart.lineNumber,
              ghostStart.column,
              lastLine,
              lastCol,
            ),
            options: { inlineClassName: 'ghost-text' },
          },
        ]);
      }

      // Move cursor to the typed boundary
      const pos = offsetToPosition(ref!, offset);
      lockingCursor = true;
      editor!.setPosition(pos);
      lockingCursor = false;
      editor!.revealPositionInCenterIfOutsideViewport(pos);
    }

    // Apply initial ghost decoration
    applyGhost(getOffset());

    // Intercept all key presses
    keyDownDisposableRef.current?.dispose();
    keyDownDisposableRef.current = editor.onKeyDown((e) => {
      const ref = referenceRef.current;
      if (!ref) return;

      const { KeyCode } = monaco!;

      // Let lone modifier presses pass through harmlessly
      if (
        e.keyCode === KeyCode.Shift ||
        e.keyCode === KeyCode.Ctrl ||
        e.keyCode === KeyCode.Alt ||
        e.keyCode === KeyCode.Meta
      ) {
        return;
      }

      // Let key combos with Ctrl/Meta/Alt pass through (shortcuts like Ctrl+C)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Block everything else from reaching the editor
      e.preventDefault();
      e.stopPropagation();

      let offset = getOffset();

      if (e.keyCode === KeyCode.Backspace) {
        if (offset > 0) {
          offset--;
          setOffset(offset);
          applyGhost(offset);
        }
        return;
      }

      if (e.keyCode === KeyCode.Enter) {
        if (offset < ref.length && ref[offset] === '\n') {
          offset++;
          setOffset(offset);
          applyGhost(offset);
        }
        return;
      }

      if (e.keyCode === KeyCode.Tab) {
        // Advance through contiguous whitespace (spaces and tabs)
        let advanced = false;
        while (offset < ref.length && (ref[offset] === ' ' || ref[offset] === '\t')) {
          offset++;
          advanced = true;
        }
        if (advanced) {
          setOffset(offset);
          applyGhost(offset);
        }
        return;
      }

      // Printable character: advance only if it matches the next reference character
      const key = e.browserEvent.key;
      if (key.length === 1) {
        if (offset < ref.length && ref[offset] === key) {
          offset++;
          setOffset(offset);
          applyGhost(offset);
        }
      }
    });

    // Lock cursor to the typed boundary (prevents mouse clicks from moving it)
    cursorDisposableRef.current?.dispose();
    cursorDisposableRef.current = editor.onDidChangeCursorPosition(() => {
      if (lockingCursor) return;
      const ref = referenceRef.current;
      if (!ref) return;
      const expected = offsetToPosition(ref, getOffset());
      const current = editor!.getPosition();
      if (
        current &&
        (current.lineNumber !== expected.lineNumber || current.column !== expected.column)
      ) {
        lockingCursor = true;
        editor!.setPosition(expected);
        lockingCursor = false;
      }
    });

    return dispose;
  }, [editor, monaco, enabled, activeFilePath]);
}
