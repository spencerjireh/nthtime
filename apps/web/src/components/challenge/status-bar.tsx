'use client';

import { useCallback, type RefObject } from 'react';
import { useStore } from 'zustand';
import { PanelLeft, PanelLeftClose, Play, AlignLeft } from 'lucide-react';
import { useEditorStore } from './editor-store-context';
import { getLanguageDisplayName } from '@nthtime/editor';
import { getSettingsStore } from '@/lib/settings-store';
import { formatAllFiles } from '@/lib/formatter';
import type { EditorKeybindings } from '@nthtime/shared';

interface StatusBarProps {
  onRun: () => void;
  isPromptCollapsed: boolean;
  onPromptToggle: () => void;
  statusBarRef: RefObject<HTMLDivElement | null>;
  keybindings: EditorKeybindings;
}

export function StatusBar({
  onRun,
  isPromptCollapsed,
  onPromptToggle,
  statusBarRef,
  keybindings,
}: StatusBarProps) {
  const runState = useEditorStore((s) => s.runState);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const files = useEditorStore((s) => s.files);
  const setFileContent = useEditorStore((s) => s.setFileContent);
  const formatter = useStore(getSettingsStore(), (s) => s.settings.formatter);

  const handleFormat = useCallback(async () => {
    const changed = await formatAllFiles(files, formatter.defaults);
    changed.forEach((content, path) => setFileContent(path, content));
  }, [files, formatter.defaults, setFileContent]);

  const language = activeFilePath ? getLanguageDisplayName(activeFilePath) : null;
  const showFormatButton = formatter.defaults.trigger === 'manual';
  const showKeybindingStatus = keybindings !== 'default';
  const PromptIcon = isPromptCollapsed ? PanelLeft : PanelLeftClose;

  return (
    <div className="flex shrink-0 items-center border-t border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
      <button
        className="mr-2 rounded p-0.5 hover:bg-muted hover:text-foreground"
        onClick={onPromptToggle}
        title={isPromptCollapsed ? 'Show prompt (Ctrl+B)' : 'Hide prompt (Ctrl+B)'}
      >
        <PromptIcon className="h-3.5 w-3.5" />
      </button>

      {showKeybindingStatus && (
        <span
          ref={statusBarRef}
          className="mr-2 font-mono"
        />
      )}

      {language && (
        <span className="mr-2">{language}</span>
      )}

      <div className="flex-1" />

      {showFormatButton && (
        <button
          className="mr-2 flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-muted hover:text-foreground"
          onClick={handleFormat}
          title="Format code"
        >
          <AlignLeft className="h-3 w-3" />
          <span>Format</span>
        </button>
      )}

      <button
        className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-primary hover:bg-primary/20 disabled:opacity-50"
        onClick={onRun}
        disabled={runState === 'running'}
        title="Run (Ctrl+Enter)"
      >
        <Play className="h-3 w-3" />
        <span>{runState === 'running' ? 'Running...' : 'Run'}</span>
      </button>
    </div>
  );
}
