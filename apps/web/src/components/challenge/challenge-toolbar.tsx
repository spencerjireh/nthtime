'use client';

import { useCallback, useEffect } from 'react';
import { useEditorStore } from './editor-store-context';
import { formatTime } from '@nthtime/editor';
import { Button } from '@/components/ui/button';

interface ChallengeToolbarProps {
  onRun: () => void;
}

export function ChallengeToolbar({ onRun }: ChallengeToolbarProps) {
  const runState = useEditorStore((s) => s.runState);
  const timer = useEditorStore((s) => s.timer);
  const tickTimer = useEditorStore((s) => s.tickTimer);
  const timeEstimate = useEditorStore(
    (s) => s.challengeMetadata?.timeEstimateSeconds ?? 0,
  );

  // Tick the timer every second while running
  useEffect(() => {
    if (timer.startedAt === null) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [timer.startedAt, tickTimer]);

  // Keyboard shortcut: Ctrl+Enter
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onRun();
      }
    },
    [onRun],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="font-mono">{formatTime(timer.elapsedSeconds)}</span>
        {timeEstimate > 0 && (
          <span>est. {formatTime(timeEstimate)}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Ctrl+Enter</span>
        <Button
          size="sm"
          onClick={onRun}
          disabled={runState === 'running'}
        >
          {runState === 'running' ? 'Running...' : 'Run'}
        </Button>
      </div>
    </div>
  );
}
