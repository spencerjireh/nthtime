'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabBarProps {
  tabs: string[];
  activeTab: string | null;
  onSelect: (path: string) => void;
  onClose?: (path: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  modifiedPaths?: Set<string>;
}

function useScrollOverflow(scrollRef: React.RefObject<HTMLDivElement | null>, tabCount: number) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateOverflow();

    el.addEventListener('scroll', updateOverflow, { passive: true });
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', updateOverflow);
      observer.disconnect();
    };
  }, [scrollRef, updateOverflow]);

  useEffect(() => {
    updateOverflow();
  }, [tabCount, updateOverflow]);

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  }, [scrollRef]);

  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  }, [scrollRef]);

  return { canScrollLeft, canScrollRight, scrollLeft, scrollRight };
}

export function TabBar({
  tabs,
  activeTab,
  onSelect,
  onClose,
  onReorder,
  modifiedPaths,
}: TabBarProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useScrollOverflow(
    scrollRef,
    tabs.length,
  );

  const hasOverflow = canScrollLeft || canScrollRight;

  useEffect(() => {
    if (!activeTab || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-tab-path="${CSS.escape(activeTab)}"]`);
    if (el) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }, [activeTab]);

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
        onReorder?.(dragIndex, index);
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
      <div className="relative flex flex-1 overflow-hidden">
        {canScrollLeft && (
          <>
            <button
              onClick={scrollLeft}
              className="absolute left-0 z-10 flex h-full w-7 items-center justify-center bg-muted/30 transition-colors hover:bg-muted/60"
              aria-label="Scroll tabs left"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <div className="pointer-events-none absolute left-7 z-10 h-full w-4 bg-gradient-to-r from-muted/30 to-transparent" />
          </>
        )}

        <div
          ref={scrollRef}
          className="scrollbar-none flex flex-1 overflow-x-auto"
          style={hasOverflow ? { scrollPaddingInline: 28 } : undefined}
          title="Switch tabs: Cmd+Shift+[ / ] · Ctrl+Tab / Ctrl+Shift+Tab · Ctrl+1-9 · Ctrl+W to close"
        >
          {tabs.map((path, index) => (
            <div
              key={path}
              data-tab-path={path}
              draggable={!!onReorder}
              onDragStart={onReorder ? (e) => handleDragStart(e, index) : undefined}
              onDragOver={onReorder ? (e) => handleDragOver(e, index) : undefined}
              onDrop={onReorder ? (e) => handleDrop(e, index) : undefined}
              onDragEnd={onReorder ? handleDragEnd : undefined}
              className={cn(
                'group flex shrink-0 items-center border-r border-border px-3 py-1.5 text-xs transition-colors',
                path === activeTab
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                dropIndex === index && 'border-l-2 border-l-primary',
              )}
            >
              <button onClick={() => onSelect(path)} className="truncate">
                {path.split('/').pop()}
              </button>
              {modifiedPaths?.has(path) && (
                <span className="ml-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              )}
              {onClose && (
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
              )}
            </div>
          ))}
        </div>

        {canScrollRight && (
          <>
            <div className="pointer-events-none absolute right-7 z-10 h-full w-4 bg-gradient-to-l from-muted/30 to-transparent" />
            <button
              onClick={scrollRight}
              className="absolute right-0 z-10 flex h-full w-7 items-center justify-center bg-muted/30 transition-colors hover:bg-muted/60"
              aria-label="Scroll tabs right"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
