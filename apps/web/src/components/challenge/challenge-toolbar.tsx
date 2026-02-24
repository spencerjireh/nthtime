'use client';

import Link from 'next/link';
import { useCallback, useEffect } from 'react';
import { useStore } from 'zustand';
import { PanelLeft, PanelLeftClose, ChevronsDown } from 'lucide-react';
import { useEditorStore } from './editor-store-context';
import { formatTime } from '@nthtime/editor';
import { Button } from '@/components/ui/button';
import { getSettingsStore } from '@/lib/settings-store';
import { formatCode } from '@/lib/formatter';
import { challengeHref } from '@/lib/routes';

interface ChallengeToolbarProps {
  onRun: () => void;
  challengeId: string;
  packSlug?: string;
  isPromptCollapsed: boolean;
  onPromptToggle: () => void;
  onToolbarCollapse: () => void;
}

export function ChallengeToolbar({
  onRun,
  challengeId,
  packSlug,
  isPromptCollapsed,
  onPromptToggle,
  onToolbarCollapse,
}: ChallengeToolbarProps) {
  const runState = useEditorStore((s) => s.runState);
  const timer = useEditorStore((s) => s.timer);
  const tickTimer = useEditorStore((s) => s.tickTimer);
  const formatter = useStore(getSettingsStore(), (s) => s.settings.formatter);
  const showSolutionSetting = useStore(
    getSettingsStore(),
    (s) => s.settings.feedback.showSolution,
  );
  const files = useEditorStore((s) => s.files);
  const setFileContent = useEditorStore((s) => s.setFileContent);
  const referenceSolutionFiles = useEditorStore((s) => s.referenceSolutionFiles);
  const showSolution = useEditorStore((s) => s.showSolution);
  const timeEstimate = useEditorStore(
    (s) => s.challengeMetadata?.timeEstimateSeconds ?? 0,
  );

  // Tick the timer every second while running
  useEffect(() => {
    if (timer.startedAt === null) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [timer.startedAt, tickTimer]);

  const handleFormat = useCallback(async () => {
    const settings = formatter.defaults;
    const entries = Object.entries(files);
    for (const [path, file] of entries) {
      const formatted = await formatCode(file.content, path, settings);
      if (formatted !== file.content) {
        setFileContent(path, formatted);
      }
    }
  }, [files, formatter.defaults, setFileContent]);

  const showFormatButton = formatter.defaults.trigger === 'manual';
  const PromptIcon = isPromptCollapsed ? PanelLeft : PanelLeftClose;

  return (
    <div className="flex items-center justify-between bg-muted/30 px-4 py-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onPromptToggle}
          title={isPromptCollapsed ? 'Show prompt (Ctrl+B)' : 'Hide prompt (Ctrl+B)'}
        >
          <PromptIcon className="h-4 w-4" />
        </Button>
        <span>{formatTime(timer.elapsedSeconds)}</span>
        {timeEstimate > 0 && (
          <span>est. {formatTime(timeEstimate)}</span>
        )}
        <Link
          href={challengeHref(challengeId, packSlug, 'details')}
          className="text-muted-foreground hover:text-foreground"
        >
          Details
        </Link>
        {showSolutionSetting && referenceSolutionFiles && (
          <button
            onClick={showSolution}
            className="text-muted-foreground hover:text-foreground"
          >
            Solution
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showFormatButton && (
          <Button variant="ghost" size="sm" onClick={handleFormat}>
            Format
          </Button>
        )}
        <span className="text-xs text-muted-foreground">Ctrl+Enter</span>
        <Button
          size="sm"
          onClick={onRun}
          disabled={runState === 'running'}
        >
          {runState === 'running' ? 'Running...' : 'Run'}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onToolbarCollapse}
          title="Hide toolbar (Ctrl+Shift+B)"
        >
          <ChevronsDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
