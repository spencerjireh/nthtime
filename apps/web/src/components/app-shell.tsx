import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { SettingsTrigger } from './settings/settings-trigger';
import { ConditionalUserMenu } from './auth/conditional-user-menu';
import { ConditionalFooter } from './conditional-footer';
import { ConditionalAuthorLink } from './author/conditional-author-link';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-9">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground hover:text-primary"
          >
            <Image
              src="/logo-mark.png"
              alt=""
              width={20}
              height={20}
              className="dark:invert"
            />
            <span className="font-mono text-xs font-medium uppercase tracking-wider">
              nthtime
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ConditionalAuthorLink />
            <div className="flex items-center gap-1">
              <SettingsTrigger />
              <ThemeToggle />
              <ConditionalUserMenu />
            </div>
          </div>
        </div>
      </header>
      <main className="w-full flex-1">{children}</main>
      <ConditionalFooter />
    </div>
  );
}
