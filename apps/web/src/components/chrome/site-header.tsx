import Image from 'next/image';
import Link from 'next/link';

import { ConditionalUserMenu } from '@/components/auth/conditional-user-menu';
import { SettingsTrigger } from '@/components/settings/settings-trigger';
import { ThemeToggle } from '@/components/theme-toggle';

import { CommandPaletteTrigger } from './command-palette-trigger';
import { MobileNavSheet } from './mobile-nav-sheet';
import { NavLinks } from './nav-links';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-6 px-9">
        <div className="flex min-w-0 items-center gap-10">
          <Link
            href="/"
            className="flex flex-shrink-0 items-center gap-2 text-foreground transition-colors hover:text-primary"
            aria-label="nthtime home"
          >
            <Image
              src="/logo-mark.png"
              alt=""
              width={20}
              height={20}
              className="dark:invert"
              priority
            />
            <span className="font-mono text-xs font-medium uppercase tracking-wider">
              nthtime
            </span>
          </Link>
          <NavLinks className="hidden md:flex" />
        </div>

        <div className="flex items-center gap-2">
          <CommandPaletteTrigger className="hidden md:inline-flex" />
          <div className="flex items-center gap-1">
            <SettingsTrigger />
            <ThemeToggle />
            <ConditionalUserMenu />
          </div>
          <MobileNavSheet className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
