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
import { useProfile } from '@/hooks/use-profile';
import { useSignOut } from '@/hooks/use-sign-out';
import { accountHref, authorPacksHref } from '@/lib/routes';
import { cn } from '@/lib/utils';

import { SignInButton } from './sign-in-button';

const Skeleton = () => <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />;

export function UserMenu() {
  const [mounted, setMounted] = useState(false);
  const { status } = useAuthSession();
  const { profile } = useProfile();
  const handleSignOut = useSignOut();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading') {
    return <Skeleton />;
  }

  if (status !== 'authenticated') {
    return <SignInButton />;
  }

  // A GitHub account can have no display name and no public avatar.
  const label = profile?.name ?? profile?.handle ?? 'Account';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${label}`}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-muted-foreground transition-colors',
          'hover:border-foreground/40 hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'data-[state=open]:border-foreground/40 data-[state=open]:text-foreground',
        )}
      >
        {profile?.image ? (
          // Plain <img>: next/image would need images.remotePatterns for
          // avatars.githubusercontent.com, which this app does not configure.
          <img
            src={profile.image}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <User className="h-4 w-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={accountHref()} className="cursor-pointer">
            <User className="h-3.5 w-3.5" aria-hidden />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={authorPacksHref()} className="cursor-pointer">
            <PenLine className="h-3.5 w-3.5" aria-hidden />
            Author tools
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void handleSignOut()}>
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
