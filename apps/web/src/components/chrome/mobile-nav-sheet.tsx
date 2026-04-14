'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { CommandPaletteTrigger } from './command-palette-trigger';
import { NavLinks } from './nav-links';

interface MobileNavSheetProps {
  className?: string;
}

export function MobileNavSheet({ className }: MobileNavSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground',
          className,
        )}
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-8 pt-16">
        <SheetHeader className="text-left">
          <SheetTitle className="eyebrow">Navigate</SheetTitle>
        </SheetHeader>
        <CommandPaletteTrigger
          className="w-full justify-start"
          onOpen={() => setOpen(false)}
        />
        <NavLinks orientation="vertical" onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
