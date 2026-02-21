'use client';

import { useEffect, useRef } from 'react';
import type { OnMount } from '@monaco-editor/react';

type EditorInstance = Parameters<OnMount>[0];
type MonacoInstance = Parameters<OnMount>[1];

/**
 * Debounced real-time parse error diagnostics via Tree-sitter.
 * Maps parse errors to Monaco editor markers.
 */
export function useParseDiagnostics(
  editor: EditorInstance | null,
  monaco: MonacoInstance | null,
  filePath: string | null,
  content: string | undefined,
  debounceMs = 300,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!editor || !monaco || !filePath || content === undefined) return;

    const model = editor.getModel();
    if (!model) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const { grammarNameFromExtension, parseFile, extractParseErrors } = await import(
          '@nthtime/verification'
        );

        const ext = filePath.slice(filePath.lastIndexOf('.'));
        if (!grammarNameFromExtension(ext)) {
          monaco.editor.setModelMarkers(model, 'tree-sitter', []);
          return;
        }

        const parsed = await parseFile(
          { path: filePath, content },
          '/tree-sitter/',
        );

        if (!parsed) {
          monaco.editor.setModelMarkers(model, 'tree-sitter', []);
          return;
        }

        const diagnostics = extractParseErrors(parsed.tree);
        const markers = diagnostics.map((d) => ({
          severity: monaco.MarkerSeverity.Error,
          message: d.message,
          startLineNumber: d.startLine,
          startColumn: d.startColumn,
          endLineNumber: d.endLine,
          endColumn: d.endColumn,
        }));

        monaco.editor.setModelMarkers(model, 'tree-sitter', markers);
      } catch {
        // Silently ignore -- parse diagnostics are best-effort
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [editor, monaco, filePath, content, debounceMs]);

  // Clear markers on unmount
  useEffect(() => {
    return () => {
      if (editor && monaco) {
        const model = editor.getModel();
        if (model) {
          monaco.editor.setModelMarkers(model, 'tree-sitter', []);
        }
      }
    };
  }, [editor, monaco]);
}
