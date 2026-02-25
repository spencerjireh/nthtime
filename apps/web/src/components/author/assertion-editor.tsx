'use client';

import { useCallback, useRef } from 'react';
import { MonacoWrapper } from '@/components/challenge/monaco-wrapper';
import { Button } from '@/components/ui/button';
import { ASSERTION_SNIPPETS } from './assertion-snippets';
import { useTheme } from 'next-themes';
import type { OnMount } from '@monaco-editor/react';

interface AssertionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function AssertionEditor({ value, onChange }: AssertionEditorProps) {
  const { resolvedTheme } = useTheme();
  const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const insertSnippet = useCallback(
    (snippet: (typeof ASSERTION_SNIPPETS)[number]) => {
      const editor = editorRef.current;
      if (!editor) return;

      const text = JSON.stringify(snippet.template, null, 2);
      const position = editor.getPosition();
      if (!position) return;

      // Insert at cursor position
      editor.executeEdits('assertion-snippet', [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          text,
        },
      ]);
      editor.focus();
    },
    [],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {ASSERTION_SNIPPETS.map((snippet) => (
          <Button
            key={snippet.type}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => insertSnippet(snippet)}
          >
            {snippet.label}
          </Button>
        ))}
      </div>
      <div className="h-[400px] overflow-hidden rounded-md border border-border">
        <MonacoWrapper
          value={value}
          language="json"
          theme={monacoTheme}
          onChange={(v) => onChange(v ?? '')}
          onMount={handleMount}
        />
      </div>
    </div>
  );
}
