'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { OnMount } from '@monaco-editor/react';
import { buildDecorationInputs } from '@/lib/build-result-decorations';
import type { VerificationResult } from '@nthtime/shared';

/**
 * Manages Monaco editor decorations for failed assertions.
 * Returns an `onMount` callback to pass to `MonacoWrapper`.
 */
export function useMonacoDecorations(
  result: VerificationResult | null,
  activeFile: string | null,
  showDetails: boolean,
) {
  const [editor, setEditor] = useState<Parameters<OnMount>[0] | null>(null);
  const [monaco, setMonaco] = useState<Parameters<OnMount>[1] | null>(null);
  const decorationRef = useRef<ReturnType<Parameters<OnMount>[0]['createDecorationsCollection']> | null>(null);

  const onMount: OnMount = useCallback((ed, mon) => {
    setEditor(ed);
    setMonaco(mon);
    ed.onDidDispose(() => {
      decorationRef.current = null;
      setEditor(null);
      setMonaco(null);
    });
  }, []);

  useEffect(() => {
    if (!editor || !monaco || !result || !activeFile) return;
    if (!showDetails) {
      if (decorationRef.current) {
        decorationRef.current.clear();
        decorationRef.current = null;
      }
      return;
    }

    const fileResult = result.fileResults.find((f) => f.file === activeFile);
    if (!fileResult) return;

    const inputs = buildDecorationInputs(fileResult.results);
    const decorations = inputs.map((d) => ({
      range: new monaco.Range(d.startLine, d.startColumn, d.endLine, d.endColumn),
      options: {
        isWholeLine: true,
        className: 'decoration-fail-line',
        glyphMarginClassName: 'decoration-fail-glyph',
        hoverMessage: { value: `**${d.description}**\n\n${d.message}` },
      },
    }));

    if (decorationRef.current) {
      decorationRef.current.clear();
    }
    decorationRef.current = editor.createDecorationsCollection(decorations);

    return () => {
      if (decorationRef.current) {
        decorationRef.current.clear();
        decorationRef.current = null;
      }
    };
  }, [editor, monaco, result, activeFile, showDetails]);

  return { onMount };
}
