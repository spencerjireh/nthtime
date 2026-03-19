'use client';

import { useCallback, useState, type RefObject } from 'react';
import { useStore } from 'zustand';
import { PanelLeft, PanelLeftClose, Play, AlignLeft, RotateCcw } from 'lucide-react';
import { useEditorStore } from './editor-store-context';
import { getLanguageDisplayName } from '@nthtime/editor';
import { getSettingsStore } from '@/lib/settings-store';
import { formatAllFiles } from '@/lib/formatter';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { EditorKeybindings } from '@nthtime/shared';

interface StatusBarProps {
  onRun: () => void;
  onReset: () => void;
  isPromptCollapsed: boolean;
  onPromptToggle: () => void;
  statusBarRef: RefObject<HTMLDivElement | null>;
  keybindings: EditorKeybindings;
}

export function StatusBar({
  onRun,
  onReset,
  isPromptCollapsed,
  onPromptToggle,
  statusBarRef,
  keybindings,
}: StatusBarProps) {
  const runState = useEditorStore((s) => s.runState);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const files = useEditorStore((s) => s.files);
  const setFileContent = useEditorStore((s) => s.setFileContent);
  const viewMode = useEditorStore((s) => s.viewMode);
  const formatter = useStore(getSettingsStore(), (s) => s.settings.formatter);
  const [resetOpen, setResetOpen] = useState(false);

  const handleFormat = useCallback(async () => {
    const changed = await formatAllFiles(files, formatter.defaults);
    changed.forEach((content, path) => setFileContent(path, content));
  }, [files, formatter.defaults, setFileContent]);

  const handleConfirmReset = useCallback(() => {
    setResetOpen(false);
    onReset();
  }, [onReset]);

  const language = activeFilePath ? getLanguageDisplayName(activeFilePath) : null;
  const showFormatButton = formatter.defaults.trigger === 'manual';
  const showKeybindingStatus = keybindings !== 'default';
  const PromptIcon = isPromptCollapsed ? PanelLeft : PanelLeftClose;
  const isEditing = viewMode === 'editing';

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

      {isEditing && (
        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogTrigger asChild>
            <button
              className="mr-2 flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-muted hover:text-foreground"
              title="Reset challenge"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Reset challenge?</DialogTitle>
              <DialogDescription>
                This will clear all your code and hints. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" size="sm">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" size="sm" onClick={handleConfirmReset}>
                Reset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
