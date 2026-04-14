'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';

import { CommandPalette } from './command-palette';

interface CommandPaletteTriggerProps {
  className?: string;
  variant?: 'pill' | 'icon';
  onOpen?: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function isInsideMonaco(element: Element | null): boolean {
  if (!element) return false;
  return Boolean(element.closest('.monaco-editor'));
}

export function CommandPaletteTrigger({
  className,
  variant = 'pill',
  onOpen,
}: CommandPaletteTriggerProps) {
  const [isMac, setIsMac] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIsMac(
      typeof navigator !== 'undefined' &&
        /Mac|iPhone|iPad|iPod/.test(navigator.platform),
    );
  }, []);

  const handleOpen = useCallback(() => {
    onOpen?.();
    setOpen(true);
  }, [onOpen]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'k' && event.key !== 'K') return;
      if (!(event.metaKey || event.ctrlKey)) return;

      const active = document.activeElement;
      // Let Monaco's own ⌘K chord bindings win when the editor has focus.
      if (isInsideMonaco(active)) return;
      // Allow typing ⌘K inside regular form fields without stealing focus.
      if (isEditableTarget(active)) return;

      event.preventDefault();
      setOpen((v) => !v);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Search"
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground',
            className,
          )}
        >
          <Search className="h-4 w-4" />
        </button>
        <CommandPalette open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Search the catalog"
        className={cn(
          'group inline-flex h-8 items-center gap-3 rounded border border-border bg-background px-3 font-mono text-xs text-muted-foreground transition-colors duration-200 hover:border-foreground/40 hover:text-foreground',
          className,
        )}
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        <span className="tracking-[-0.24px]">Search...</span>
        <kbd
          aria-hidden
          className="pointer-events-none ml-6 inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted/40 px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
        >
          <span className="text-[11px] leading-none">{isMac ? '⌘' : 'Ctrl'}</span>
          <span>K</span>
        </kbd>
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}
