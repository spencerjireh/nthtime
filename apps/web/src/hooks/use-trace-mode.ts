'use client';

import { useEffect, useRef } from 'react';
import type { OnMount } from '@monaco-editor/react';

type EditorInstance = Parameters<OnMount>[0];
type MonacoInstance = Parameters<OnMount>[1];

/**
 * Trace mode: dual-editor approach. A read-only ghost editor (back layer)
 * shows the full reference solution in grey/italic. The active editor (front
 * layer) has a transparent background so ghost text shows through. As the user
 * types, their bright text naturally covers the ghost text at the same column
 * position. No decoration hiding needed -- the ghost stays 100% static.
 *
 * The user types freely with no line restrictions.
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
  const ghostBaseDecRef = useRef<ReturnType<EditorInstance['createDecorationsCollection']> | null>(
    null,
  );
  const scrollDisposableRef = useRef<{ dispose(): void } | null>(null);

  // Sync reference content from props
  useEffect(() => {
    const content =
      (activeFilePath && referenceSolutionFiles?.[activeFilePath]?.content) ?? null;
    referenceRef.current = content;
  }, [activeFilePath, referenceSolutionFiles]);

  // Main effect: manage ghost styling and scroll sync
  useEffect(() => {
    if (!activeEditor || !ghostEditor || !ghostMonaco) return;

    function dispose() {
      scrollDisposableRef.current?.dispose();
      scrollDisposableRef.current = null;
      ghostBaseDecRef.current?.set([]);
      ghostBaseDecRef.current = null;
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

    const ghostModel = ghostEditor.getModel();
    if (!ghostModel) return;

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
