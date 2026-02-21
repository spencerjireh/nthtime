'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabBarProps {
  tabs: string[];
  activeTab: string | null;
  isDirty: (path: string) => boolean;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  trailing?: React.ReactNode;
}

export function TabBar({
  tabs,
  activeTab,
  isDirty,
  onSelect,
  onClose,
  onReorder,
  trailing,
}: TabBarProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dragIndex !== null && index !== dragIndex) {
        setDropIndex(index);
      }
    },
    [dragIndex],
  );

  const handleDrop = useCallback(
    (_e: React.DragEvent, index: number) => {
      if (dragIndex !== null && dragIndex !== index) {
        onReorder(dragIndex, index);
      }
      setDragIndex(null);
      setDropIndex(null);
    },
    [dragIndex, onReorder],
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropIndex(null);
  }, []);

  return (
    <div className="flex shrink-0 border-b border-border bg-muted/30">
      <div
        ref={scrollRef}
        className="flex flex-1 overflow-x-auto"
        style={{ scrollbarWidth: 'thin' }}
      >
        {tabs.map((path, index) => (
          <div
            key={path}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              'group flex items-center border-r border-border px-3 py-1.5 text-xs transition-colors',
              path === activeTab
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              dropIndex === index && 'border-l-2 border-l-teal-400',
            )}
          >
            <button onClick={() => onSelect(path)} className="truncate">
              {path.split('/').pop()}
            </button>
            {isDirty(path) && (
              <span className="ml-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(path);
              }}
              className="ml-1.5 shrink-0 text-[10px] opacity-0 hover:text-foreground group-hover:opacity-100"
              title="Close tab"
            >
              x
            </button>
          </div>
        ))}
      </div>
      {trailing && <div className="flex shrink-0 items-center">{trailing}</div>}
    </div>
  );
}
