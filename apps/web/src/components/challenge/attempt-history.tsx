'use client';

import { Badge } from '@/components/ui/badge';
import { formatTime } from '@nthtime/editor';

interface AttemptRecord {
  _id: string;
  passed: boolean;
  hintsUsed: number;
  timeSeconds: number;
  _creationTime: number;
}

interface AttemptHistoryProps {
  attempts: AttemptRecord[] | undefined;
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function AttemptHistory({ attempts }: AttemptHistoryProps) {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-muted-foreground">
        No previous attempts
      </div>
    );
  }

  // Show most recent first
  const sorted = [...attempts].sort(
    (a, b) => b._creationTime - a._creationTime,
  );

  return (
    <div className="space-y-1 px-4 py-3">
      <h3 className="mb-2 text-xs font-medium text-foreground">
        Past attempts
      </h3>
      {sorted.map((attempt) => (
        <div
          key={attempt._id}
          className="flex items-center gap-2 rounded px-2 py-1 text-xs"
        >
          <Badge
            variant={attempt.passed ? 'pass' : 'fail'}
            className="px-1.5 py-0 text-[10px]"
          >
            {attempt.passed ? 'pass' : 'fail'}
          </Badge>
          <span className="font-mono text-muted-foreground">
            {formatTime(attempt.timeSeconds)}
          </span>
          {attempt.hintsUsed > 0 && (
            <span className="text-muted-foreground">
              {attempt.hintsUsed} hint{attempt.hintsUsed > 1 ? 's' : ''}
            </span>
          )}
          <span className="ml-auto text-muted-foreground">
            {formatRelativeTime(attempt._creationTime)}
          </span>
        </div>
      ))}
    </div>
  );
}
