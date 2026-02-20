import './global.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AppShell } from '@/components/app-shell';
import { ConvexClientProvider } from '@/lib/convex/provider';

export const metadata = {
  title: 'nthtime',
  description: 'Practice coding through structured challenges',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ConvexClientProvider>
          <ThemeProvider>
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
