'use client';

import { useCallback, useRef } from 'react';

interface SplitResizeHandleProps {
  onResize: (leftFraction: number) => void;
}

export function SplitResizeHandle({ onResize }: SplitResizeHandleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const parent = containerRef.current?.parentElement;
      if (!parent) return;

      const onMouseMove = (ev: MouseEvent) => {
        const rect = parent.getBoundingClientRect();
        const fraction = Math.max(0.2, Math.min(0.8, (ev.clientX - rect.left) / rect.width));
        onResize(fraction);
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [onResize],
  );

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      className="w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-primary"
    />
  );
}
