'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

interface NavLink {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}

const LINKS: readonly NavLink[] = [
  {
    href: '/',
    label: 'Home',
    match: (p) => p === '/',
  },
  {
    href: '/catalog',
    label: 'Catalog',
    match: (p) => p === '/catalog' || p.startsWith('/packs/'),
  },
  {
    href: '/tracks',
    label: 'Tracks',
    match: (p) => p === '/tracks' || p.startsWith('/tracks/'),
  },
];

interface NavLinksProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  onNavigate?: () => void;
}

export function NavLinks({ className, orientation = 'horizontal', onNavigate }: NavLinksProps) {
  const pathname = usePathname() ?? '/';

  return (
    <nav
      className={cn(
        orientation === 'horizontal' ? 'flex items-center gap-8' : 'flex flex-col gap-4',
        className,
      )}
      aria-label="Primary"
    >
      {LINKS.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider transition-colors duration-200',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-200',
                active ? 'bg-primary' : 'bg-transparent',
              )}
            />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
