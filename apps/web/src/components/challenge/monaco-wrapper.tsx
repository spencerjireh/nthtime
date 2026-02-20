'use client';

import dynamic from 'next/dynamic';
import type { OnChange, OnMount } from '@monaco-editor/react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-background text-muted-foreground">
      Loading editor...
    </div>
  ),
});

interface MonacoWrapperProps {
  value: string;
  language: string;
  theme: string;
  onChange?: OnChange;
  onMount?: OnMount;
}

export function MonacoWrapper({
  value,
  language,
  theme,
  onChange,
  onMount,
}: MonacoWrapperProps) {
  return (
    <MonacoEditor
      value={value}
      language={language}
      theme={theme}
      onChange={onChange}
      onMount={onMount}
      options={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 12 },
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        bracketPairColorization: { enabled: true },
        tabSize: 2,
      }}
    />
  );
}
