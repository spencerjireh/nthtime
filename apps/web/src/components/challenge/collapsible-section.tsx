'use client';

import { ChevronRight, ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  open,
  onToggle,
  badge,
  children,
}: CollapsibleSectionProps) {
  const Icon = open ? ChevronDown : ChevronRight;

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center gap-1.5 px-4 py-2 text-left text-sm font-medium text-foreground hover:bg-muted/50"
        onClick={onToggle}
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span>{title}</span>
        {badge && (
          <span className="ml-auto text-xs font-normal text-muted-foreground">{badge}</span>
        )}
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
