import Link from 'next/link';
import { Fragment } from 'react';

import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        'w-full border-b border-border bg-background',
        className,
      )}
    >
      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex h-10 max-w-screen-2xl items-center gap-2 px-9"
      >
        <ol className="flex items-center gap-2">
          {items.map((item, index) => {
            const isLeaf = index === items.length - 1;
            return (
              <Fragment key={`${item.label}-${index}`}>
                <li>
                  {isLeaf || !item.href ? (
                    <span className="eyebrow" aria-current={isLeaf ? 'page' : undefined}>
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
                {!isLeaf && (
                  <li
                    aria-hidden
                    className="font-mono text-xs text-border"
                  >
                    &rsaquo;
                  </li>
                )}
              </Fragment>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
