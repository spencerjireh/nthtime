import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { SettingsTrigger } from './settings/settings-trigger';
import { ConditionalUserMenu } from './auth/conditional-user-menu';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground hover:text-primary"
          >
            nthtime
          </Link>
          <div className="flex items-center gap-1">
            <SettingsTrigger />
            <ThemeToggle />
            <ConditionalUserMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-screen-2xl px-6 py-8">{children}</main>
    </div>
  );
}
