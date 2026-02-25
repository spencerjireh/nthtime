'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { useStore } from 'zustand';
import { PanelLeft, PanelLeftClose, ChevronsDown } from 'lucide-react';
import { useEditorStore } from './editor-store-context';
import { formatTime } from '@nthtime/editor';
import { Button } from '@/components/ui/button';
import { getSettingsStore } from '@/lib/settings-store';
import { formatAllFiles } from '@/lib/formatter';
import { isFeatureEnabled } from '@/lib/feature-flags';
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

  const handleFormat = useCallback(async () => {
    const changed = await formatAllFiles(files, formatter.defaults);
    changed.forEach((content, path) => setFileContent(path, content));
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
        <Button variant="ghost" size="sm" asChild>
          <Link href={challengeHref(challengeId, packSlug, 'details')}>Details</Link>
        </Button>
        {isFeatureEnabled('solutionView') && showSolutionSetting && referenceSolutionFiles && (
          <Button variant="ghost" size="sm" onClick={showSolution}>
            Solution
          </Button>
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
