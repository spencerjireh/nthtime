'use client';

import dynamic from 'next/dynamic';
import type { BeforeMount, OnChange, OnMount, EditorProps } from '@monaco-editor/react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-background text-muted-foreground">
      Loading editor...
    </div>
  ),
});

// Monaco fires unhandled "Canceled" promise rejections when an editor is disposed
// while async operations (IntelliSense, validation) are still pending. This handler
// lives at module scope so it outlives any individual component mount/unmount cycle.
// The match checks name, message, and string coercion to be robust against Monaco's
// minified CDN bundle where property assignments may differ from source.
// The symbol guard prevents duplicate registration on hot reloads.
const _MONACO_REJECTION_GUARD = '__monacoRejectionGuard';
if (typeof window !== 'undefined' && !(window as unknown as Record<string, unknown>)[_MONACO_REJECTION_GUARD]) {
  (window as unknown as Record<string, unknown>)[_MONACO_REJECTION_GUARD] = true;
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const r = e.reason;
    if (r?.name === 'Canceled' || r?.message === 'Canceled') {
      e.preventDefault();
    }
  });
}

interface MonacoWrapperProps {
  value: string;
  language: string;
  theme: string;
  onChange?: OnChange;
  onMount?: OnMount;
  options?: EditorProps['options'];
}

const beforeMount: BeforeMount = (monaco) => {
  // Suppress Monaco's built-in TS/JS diagnostics — Tree-sitter (useParseDiagnostics)
  // handles parse error markers. Monaco's service has no React types, so it produces
  // spurious JSX/import errors on valid reference-solution code.
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
  });
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
  });
};

export function MonacoWrapper({
  value,
  language,
  theme,
  onChange,
  onMount,
  options,
}: MonacoWrapperProps) {
  return (
    <MonacoEditor
      beforeMount={beforeMount}
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
        ...options,
      }}
    />
  );
}
