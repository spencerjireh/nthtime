import './global.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AppShell } from '@/components/app-shell';
import { ConvexClientProvider } from '@/lib/convex/provider';
import { DataAccessProvider } from '@/lib/data-access';

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
          <DataAccessProvider>
            <ThemeProvider>
              <AppShell>{children}</AppShell>
            </ThemeProvider>
          </DataAccessProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
