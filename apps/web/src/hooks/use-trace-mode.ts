'use client';

import { useEffect, useRef } from 'react';
import type { OnMount } from '@monaco-editor/react';

type EditorInstance = Parameters<OnMount>[0];
type MonacoInstance = Parameters<OnMount>[1];

/**
 * Normalize an array of lines to have exactly `targetLineCount` entries.
 * Excess lines are merged into the last valid line; missing lines are padded.
 */
export function normalizeLines(lines: string[], targetLineCount: number): string[] {
  if (lines.length === targetLineCount) return lines;
  if (lines.length > targetLineCount) return lines.slice(0, targetLineCount);

  const result = [...lines];
  while (result.length < targetLineCount) {
    result.push('');
  }
  return result;
}

/**
 * Trace mode: dual-editor approach. A read-only ghost editor (back layer)
 * shows the full reference solution in grey/italic. The active editor (front
 * layer) has a transparent background so ghost text shows through. As the user
 * types, their bright text naturally covers the ghost text at the same column
 * position. No decoration hiding needed -- the ghost stays 100% static.
 *
 * The active editor is pre-padded with empty lines matching the reference
 * line count to guarantee vertical alignment.
 */
export function useTraceMode(
  activeEditor: EditorInstance | null,
  ghostEditor: EditorInstance | null,
  ghostMonaco: MonacoInstance | null,
  activeFilePath: string | null,
  referenceSolutionFiles: Record<string, { content: string }> | null,
  enabled: boolean,
): void {
  const referenceRef = useRef<string | null>(null);
  const refLineCountRef = useRef(0);
  const ghostBaseDecRef = useRef<ReturnType<EditorInstance['createDecorationsCollection']> | null>(
    null,
  );
  const contentDisposableRef = useRef<{ dispose(): void } | null>(null);
  const scrollDisposableRef = useRef<{ dispose(): void } | null>(null);
  const isCorrectingRef = useRef(false);

  // Sync reference content from props
  useEffect(() => {
    const content =
      (activeFilePath && referenceSolutionFiles?.[activeFilePath]?.content) ?? null;
    referenceRef.current = content;
    refLineCountRef.current = content ? content.split('\n').length : 0;
  }, [activeFilePath, referenceSolutionFiles]);

  // Main effect: manage ghost styling, scroll sync, line-count enforcement
  useEffect(() => {
    if (!activeEditor || !ghostEditor || !ghostMonaco) return;

    function dispose() {
      contentDisposableRef.current?.dispose();
      contentDisposableRef.current = null;
      scrollDisposableRef.current?.dispose();
      scrollDisposableRef.current = null;
      ghostBaseDecRef.current?.set([]);
    }

    if (!enabled) {
      dispose();
      return;
    }

    const refContent = referenceRef.current;
    const refLineCount = refLineCountRef.current;
    if (!refContent || !activeFilePath || refLineCount === 0) {
      dispose();
      return;
    }

    const activeModel = activeEditor.getModel();
    const ghostModel = ghostEditor.getModel();
    if (!activeModel || !ghostModel) return;

    // Initialize ghost decoration collection
    if (!ghostBaseDecRef.current) {
      ghostBaseDecRef.current = ghostEditor.createDecorationsCollection([]);
    }

    // Set ghost editor content (uncontrolled -- no value prop)
    if (ghostModel.getValue() !== refContent) {
      ghostModel.setValue(refContent);
    }

    // Apply base ghost styling (grey/italic) to entire ghost editor content
    const ghostLastLine = ghostModel.getLineCount();
    const ghostLastCol = ghostModel.getLineMaxColumn(ghostLastLine);
    ghostBaseDecRef.current.set([
      {
        range: new ghostMonaco.Range(1, 1, ghostLastLine, ghostLastCol),
        options: { inlineClassName: 'ghost-text-base' },
      },
    ]);

    // Pre-pad active editor with empty lines if line count doesn't match
    if (activeModel.getLineCount() !== refLineCount) {
      const padding = '\n'.repeat(refLineCount - 1);
      isCorrectingRef.current = true;
      activeModel.setValue(padding);
      isCorrectingRef.current = false;
      activeEditor.setPosition({ lineNumber: 1, column: 1 });
    }

    // Enforce line count on content changes
    contentDisposableRef.current?.dispose();
    contentDisposableRef.current = activeEditor.onDidChangeModelContent(() => {
      if (isCorrectingRef.current) return;

      const currentLineCount = activeModel.getLineCount();
      if (currentLineCount !== refLineCount) {
        const lines: string[] = [];
        for (let i = 1; i <= currentLineCount; i++) {
          lines.push(activeModel.getLineContent(i));
        }
        const normalized = normalizeLines(lines, refLineCount);
        const pos = activeEditor.getPosition();

        isCorrectingRef.current = true;
        activeEditor.executeEdits('trace-normalize', [
          { range: activeModel.getFullModelRange(), text: normalized.join('\n') },
        ]);
        isCorrectingRef.current = false;

        if (pos) {
          const clampedLine = Math.min(pos.lineNumber, refLineCount);
          const clampedCol = Math.min(pos.column, activeModel.getLineMaxColumn(clampedLine));
          activeEditor.setPosition({ lineNumber: clampedLine, column: clampedCol });
        }
      }
    });

    // Scroll sync: active -> ghost
    scrollDisposableRef.current?.dispose();
    scrollDisposableRef.current = activeEditor.onDidScrollChange((e) => {
      ghostEditor.setScrollPosition({
        scrollTop: e.scrollTop,
        scrollLeft: e.scrollLeft,
      });
    });

    return dispose;
  }, [activeEditor, ghostEditor, ghostMonaco, enabled, activeFilePath]);
}
