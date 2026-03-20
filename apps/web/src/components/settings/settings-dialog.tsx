'use client';

import { useState } from 'react';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { getSettingsStore } from '@/lib/settings-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { Code2, MessageSquare, SlidersHorizontal } from 'lucide-react';
import { EditorSettings } from './editor-settings';
import { FeedbackSettings } from './feedback-settings';
import { FormattingSettings } from './formatting-settings';
import type { SettingsStore } from '@/lib/settings-store';
import type { UserSettings } from '@nthtime/shared';
import type { LucideIcon } from 'lucide-react';

export interface SettingsPanelProps {
  store: StoreApi<SettingsStore>;
  settings: UserSettings;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsCategory = 'editor' | 'feedback' | 'formatting';

const CATEGORIES: { id: SettingsCategory; label: string; icon: LucideIcon }[] = [
  { id: 'editor', label: 'Editor', icon: Code2 },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'formatting', label: 'Formatting & Layout', icon: SlidersHorizontal },
];

function CategoryContent({ category, ...props }: SettingsPanelProps & { category: SettingsCategory }) {
  switch (category) {
    case 'editor':
      return <EditorSettings {...props} />;
    case 'feedback':
      return <FeedbackSettings {...props} />;
    case 'formatting':
      return <FormattingSettings {...props} />;
  }
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const store = getSettingsStore();
  const settings = useStore(store, (s) => s.settings);
  const isMobile = useIsMobile();
  const [category, setCategory] = useState<SettingsCategory>('editor');

  const panelProps: SettingsPanelProps = { store, settings };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="flex max-h-[85dvh] flex-col rounded-t-lg">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Configure feedback, editor behavior, and appearance.
            </SheetDescription>
          </SheetHeader>
          <div className="-mx-2 flex-1 overflow-y-auto px-2 pb-6">
            <div className="space-y-8">
              <EditorSettings {...panelProps} />
              <FeedbackSettings {...panelProps} />
              <FormattingSettings {...panelProps} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] sm:max-w-3xl p-0 gap-0">
        <div className="flex h-[60vh] max-h-[600px]">
          <nav className="flex w-48 shrink-0 flex-col border-r bg-muted/30">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="text-base">Settings</DialogTitle>
              <DialogDescription className="text-xs">
                Configure feedback, editor behavior, and appearance.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-1 p-2">
              {CATEGORIES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    category === id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </nav>
          <div className="flex-1 overflow-y-auto p-6">
            <CategoryContent category={category} {...panelProps} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
