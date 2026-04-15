'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useRecentlyVisited } from '@/hooks/use-recently-visited';

export function ResumeCard() {
  const { entries } = useRecentlyVisited();
  const top = entries[0];

  if (!top) return null;

  return (
    <section className="space-y-4">
      <p className="eyebrow">Resume</p>
      <Link
        href={top.href}
        className="group/resume flex items-center justify-between gap-4 rounded-lg border bg-card p-6 transition-colors hover:border-primary/50"
      >
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Last visited {top.kind}
          </p>
          <p className="mt-1 truncate font-sans text-base font-medium text-foreground">
            {top.label}
          </p>
        </div>
        <span className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors group-hover/resume:text-primary">
          Resume
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover/resume:translate-x-0.5"
            aria-hidden
          />
        </span>
      </Link>
    </section>
  );
}
