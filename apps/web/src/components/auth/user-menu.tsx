'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, PenLine, User } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthSession } from '@/hooks/use-auth-session';
import { authorPacksHref } from '@/lib/routes';
import { cn } from '@/lib/utils';

import { SignInButton } from './sign-in-button';

const Skeleton = () => (
  <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
);

export function UserMenu() {
  const [mounted, setMounted] = useState(false);
  const { status } = useAuthSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading') {
    return <Skeleton />;
  }

  if (status !== 'authenticated') {
    return <SignInButton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors',
          'hover:border-foreground/40 hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'data-[state=open]:border-foreground/40 data-[state=open]:text-foreground',
        )}
      >
        <User className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={authorPacksHref()} className="cursor-pointer">
            <PenLine className="h-3.5 w-3.5" aria-hidden />
            Author tools
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            window.location.href = '/api/auth/signout';
          }}
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
