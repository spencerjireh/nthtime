import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';

export function Footer() {
  return (
    <footer className="w-full border-t border-border">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-9 py-6">
        <div className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="" width={14} height={14} className="dark:invert" />
          <span className="text-xs text-muted-foreground">nthtime</span>
        </div>
        <ThemeToggle />
      </div>
    </footer>
  );
}
