import '../global.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ConvexClientProvider } from '@/lib/convex/provider';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <ThemeProvider>
        <div className="flex h-screen flex-col bg-background">
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
            >
              nthtime
            </Link>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </ThemeProvider>
    </ConvexClientProvider>
  );
}
