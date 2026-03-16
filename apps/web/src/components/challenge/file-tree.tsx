'use client';

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, FilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

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

interface TreeNode {
  name: string;
  path: string; // full path for files, folder prefix for dirs
  isFolder: boolean;
  children: TreeNode[];
}

function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const filePath of paths) {
    const parts = filePath.split('/');
    let current = root;
    let accumulated = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      const isLast = i === parts.length - 1;

      let existing = current.find((n) => n.name === part && n.isFolder === !isLast);
      if (!existing) {
        existing = {
          name: part,
          path: isLast ? filePath : accumulated,
          isFolder: !isLast,
          children: [],
        };
        current.push(existing);
      }
      current = existing.children;
    }
  }

  return root;
}

interface FileTreeProps {
  files: string[];
  activeFile: string | null;
  onSelect: (path: string) => void;
  onCreateFile?: (path: string) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
  onDeleteFile?: (path: string) => void;
  fileStatus?: (path: string) => 'pass' | 'fail' | null;
  ghostFiles?: string[];
}

export function FileTree({
  files,
  activeFile,
  onSelect,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  fileStatus,
  ghostFiles,
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState<string | null>(null); // parent folder path or '' for root
  const [renaming, setRenaming] = useState<string | null>(null); // full file path being renamed

  const allFiles = useMemo(() => {
    if (!ghostFiles || ghostFiles.length === 0) return files;
    return [...files, ...ghostFiles];
  }, [files, ghostFiles]);

  const ghostSet = useMemo(
    () => new Set(ghostFiles ?? []),
    [ghostFiles],
  );

  const tree = useMemo(() => buildTree(allFiles), [allFiles]);

  const toggleFolder = useCallback((folderPath: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) next.delete(folderPath);
      else next.add(folderPath);
      return next;
    });
  }, []);

  const handleCreateCommit = useCallback(
    (name: string, parentPath: string) => {
      if (!name.trim()) {
        setCreating(null);
        return;
      }
      const fullPath = parentPath ? `${parentPath}/${name.trim()}` : name.trim();
      onCreateFile?.(fullPath);
      setCreating(null);
    },
    [onCreateFile],
  );

  const handleRenameCommit = useCallback(
    (newName: string, oldPath: string) => {
      if (!newName.trim() || newName.trim() === oldPath.split('/').pop()) {
        setRenaming(null);
        return;
      }
      const parts = oldPath.split('/');
      parts[parts.length - 1] = newName.trim();
      const newPath = parts.join('/');
      onRenameFile?.(oldPath, newPath);
      setRenaming(null);
    },
    [onRenameFile],
  );

  const handleDelete = useCallback(
    (path: string) => {
      onDeleteFile?.(path);
    },
    [onDeleteFile],
  );

  const startCreateAtRoot = useCallback(() => {
    setCreating('');
  }, []);

  const startCreateInFolder = useCallback((folderPath: string) => {
    setCreating(folderPath);
    setExpandedFolders((prev) => new Set(prev).add(folderPath));
  }, []);

  return (
    <div className="flex w-44 shrink-0 flex-col border-r border-border bg-muted/20">
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Files
        </span>
        {onCreateFile && (
          <button
            onClick={startCreateAtRoot}
            className="text-muted-foreground hover:text-foreground"
            title="New file"
          >
            <FilePlus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto">
        {tree.map((node) => (
          <TreeNodeRow
            key={node.path}
            node={node}
            depth={0}
            activeFile={activeFile}
            expandedFolders={expandedFolders}
            creating={creating}
            renaming={renaming}
            onSelect={onSelect}
            onToggleFolder={toggleFolder}
            onCreateCommit={handleCreateCommit}
            onRenameCommit={handleRenameCommit}
            onDelete={handleDelete}
            onStartCreate={startCreateInFolder}
            onStartRename={setRenaming}
            showCrud={!!onCreateFile}
            fileStatus={fileStatus}
            ghostSet={ghostSet}
          />
        ))}
        {creating === '' && (
          <InlineInput
            depth={0}
            initialValue=""
            onCommit={(name) => handleCreateCommit(name, '')}
            onCancel={() => setCreating(null)}
          />
        )}
      </nav>
    </div>
  );
}

function TreeNodeRow({
  node,
  depth,
  activeFile,
  expandedFolders,
  creating,
  renaming,
  onSelect,
  onToggleFolder,
  onCreateCommit,
  onRenameCommit,
  onDelete,
  onStartCreate,
  onStartRename,
  showCrud,
  fileStatus,
  ghostSet,
}: {
  node: TreeNode;
  depth: number;
  activeFile: string | null;
  expandedFolders: Set<string>;
  creating: string | null;
  renaming: string | null;
  onSelect: (path: string) => void;
  onToggleFolder: (path: string) => void;
  onCreateCommit: (name: string, parentPath: string) => void;
  onRenameCommit: (name: string, oldPath: string) => void;
  onDelete: (path: string) => void;
  onStartCreate: (folderPath: string) => void;
  onStartRename: (path: string) => void;
  showCrud: boolean;
  fileStatus?: (path: string) => 'pass' | 'fail' | null;
  ghostSet?: Set<string>;
}) {
  const paddingLeft = depth * 12 + 8;

  if (node.isFolder) {
    const isExpanded = expandedFolders.has(node.path);

    const folderRow = (
      <div
        className="group flex w-full items-center gap-1 py-1 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        style={{ paddingLeft }}
      >
        <button
          onClick={() => onToggleFolder(node.path)}
          className="flex flex-1 items-center gap-1 overflow-hidden"
        >
          <span className="shrink-0 text-[10px]">{isExpanded ? '\u25BE' : '\u25B8'}</span>
          <span className="truncate font-medium">{node.name}</span>
        </button>
        {showCrud && (
          <button
            onClick={() => onStartCreate(node.path)}
            className="mr-1 shrink-0 opacity-0 group-hover:opacity-100"
            title="New file in folder"
          >
            <FilePlus className="h-3 w-3" />
          </button>
        )}
      </div>
    );

    return (
      <>
        {showCrud ? (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              {folderRow}
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => onStartCreate(node.path)}>
                <FilePlus className="mr-2 h-3.5 w-3.5" /> New File
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ) : (
          folderRow
        )}
        {isExpanded && (
          <>
            {node.children.map((child) => (
              <TreeNodeRow
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                expandedFolders={expandedFolders}
                creating={creating}
                renaming={renaming}
                onSelect={onSelect}
                onToggleFolder={onToggleFolder}
                onCreateCommit={onCreateCommit}
                onRenameCommit={onRenameCommit}
                onDelete={onDelete}
                onStartCreate={onStartCreate}
                onStartRename={onStartRename}
                showCrud={showCrud}
                fileStatus={fileStatus}
                ghostSet={ghostSet}
              />
            ))}
            {creating === node.path && (
              <InlineInput
                depth={depth + 1}
                initialValue=""
                onCommit={(name) => onCreateCommit(name, node.path)}
                onCancel={() => onCreateCommit('', node.path)}
              />
            )}
          </>
        )}
      </>
    );
  }

  // File node
  const isGhost = ghostSet?.has(node.path) ?? false;

  if (renaming === node.path) {
    return (
      <InlineInput
        depth={depth}
        initialValue={node.name}
        onCommit={(name) => onRenameCommit(name, node.path)}
        onCancel={() => onRenameCommit(node.name, node.path)}
      />
    );
  }

  const fileRow = (
    <div
      className={cn(
        'group flex w-full items-center gap-1.5 py-1.5 text-left text-xs transition-colors',
        isGhost
          ? 'italic opacity-50 text-muted-foreground hover:bg-muted hover:text-foreground'
          : node.path === activeFile
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      style={{ paddingLeft }}
    >
      <button
        onClick={() => onSelect(node.path)}
        className="flex flex-1 items-center gap-1.5 overflow-hidden"
      >
        <span className="inline-flex h-4 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-muted-foreground">
          {getFileIcon(node.path)}
        </span>
        <span className="truncate">{node.name}</span>
        <FileIndicatorDot path={node.path} fileStatus={fileStatus} />
      </button>
      {showCrud && !isGhost && (
        <span className="mr-1 flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onStartRename(node.path)}
            className="text-muted-foreground hover:text-foreground"
            title="Rename"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDelete(node.path)}
            className="text-muted-foreground hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </span>
      )}
    </div>
  );

  if (showCrud && !isGhost) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {fileRow}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onStartRename(node.path)}>
            <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => onDelete(node.path)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return fileRow;
}

function FileIndicatorDot({
  path,
  fileStatus,
}: {
  path: string;
  fileStatus?: (path: string) => 'pass' | 'fail' | null;
}) {
  const status = fileStatus?.(path) ?? null;
  const color = status === 'pass' ? 'bg-pass'
    : status === 'fail' ? 'bg-fail'
    : null;
  if (!color) return null;
  return (
    <span className={cn('ml-auto inline-block h-1.5 w-1.5 shrink-0 rounded-full', color)} />
  );
}

function InlineInput({
  depth,
  initialValue,
  onCommit,
  onCancel,
}: {
  depth: number;
  initialValue: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (initialValue) {
      // Select filename without extension
      const dotIdx = initialValue.lastIndexOf('.');
      inputRef.current?.setSelectionRange(0, dotIdx > 0 ? dotIdx : initialValue.length);
    }
  }, [initialValue]);

  return (
    <div style={{ paddingLeft: depth * 12 + 8 }} className="py-0.5 pr-2">
      <input
        ref={inputRef}
        type="text"
        defaultValue={initialValue}
        className="w-full rounded border border-border bg-background px-1 py-0.5 text-xs text-foreground outline-none focus:border-primary"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onCommit(e.currentTarget.value);
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={(e) => onCommit(e.currentTarget.value)}
      />
    </div>
  );
}
