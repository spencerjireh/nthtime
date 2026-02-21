'use client';

import { cn } from '@/lib/utils';

const FILE_ICONS: Record<string, string> = {
  '.js': 'JS',
  '.jsx': 'JX',
  '.ts': 'TS',
  '.tsx': 'TX',
  '.py': 'PY',
  '.html': 'HT',
  '.css': 'CS',
  '.json': 'JN',
};

function getFileIcon(path: string): string {
  const ext = path.slice(path.lastIndexOf('.'));
  return FILE_ICONS[ext] ?? '--';
}

interface FileTreeProps {
  files: string[];
  activeFile: string | null;
  isDirty: (path: string) => boolean;
  onSelect: (path: string) => void;
}

export function FileTree({ files, activeFile, isDirty, onSelect }: FileTreeProps) {
  return (
    <div className="flex w-44 shrink-0 flex-col border-r border-border bg-muted/20">
      <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Files
      </div>
      <nav className="flex-1 overflow-y-auto">
        {files.map((path) => (
          <button
            key={path}
            onClick={() => onSelect(path)}
            className={cn(
              'flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors',
              path === activeFile
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <span className="inline-flex h-4 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-muted-foreground">
              {getFileIcon(path)}
            </span>
            <span className="truncate">{path}</span>
            {isDirty(path) && (
              <span className="ml-auto inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
