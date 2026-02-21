'use client';

import { useEffect, useRef } from 'react';
import type { EditorKeybindings } from '@nthtime/shared';

interface Disposable {
  dispose(): void;
}

/**
 * Activates Vim or Emacs keybinding mode on a Monaco editor instance.
 * Dynamically imports monaco-vim / monaco-emacs to avoid bundling at build time.
 * Disposes the previous mode before activating a new one.
 */
export function useKeybindingMode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorInstance: any | null,
  statusBarRef: React.RefObject<HTMLDivElement | null>,
  mode: EditorKeybindings,
) {
  const extensionRef = useRef<Disposable | null>(null);

  useEffect(() => {
    if (!editorInstance) return;

    let cancelled = false;

    // Dispose previous extension
    if (extensionRef.current) {
      extensionRef.current.dispose();
      extensionRef.current = null;
    }

    if (mode === 'vim') {
      import('monaco-vim').then(({ initVimMode }) => {
        if (cancelled) return;
        const vimMode = initVimMode(editorInstance, statusBarRef.current);
        extensionRef.current = vimMode;
      });
    } else if (mode === 'emacs') {
      import('monaco-emacs').then(({ EmacsExtension }) => {
        if (cancelled) return;
        const emacsExt = new EmacsExtension(editorInstance);
        emacsExt.start();

        // Wire key echo to status bar
        if (statusBarRef.current) {
          emacsExt.onDidChangeKey((key: string) => {
            if (statusBarRef.current) {
              statusBarRef.current.textContent = key;
            }
          });
        }

        extensionRef.current = emacsExt;
      });
    }

    return () => {
      cancelled = true;
      if (extensionRef.current) {
        extensionRef.current.dispose();
        extensionRef.current = null;
      }
    };
  }, [editorInstance, mode, statusBarRef]);
}
