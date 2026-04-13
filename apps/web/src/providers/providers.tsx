'use client';

import { QueryProvider } from './query-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </QueryProvider>
  );
}
