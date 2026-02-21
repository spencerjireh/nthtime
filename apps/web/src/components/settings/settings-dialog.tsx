'use client';

import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getSettingsStore } from '@/lib/settings-store';
import { FeedbackLevel } from '@nthtime/shared';
import type { EditorKeybindings, FormatterTrigger } from '@nthtime/shared';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEEDBACK_LEVELS = [
  { value: FeedbackLevel.None, label: 'L0 -- None', description: 'Just pass/fail' },
  {
    value: FeedbackLevel.PassFail,
    label: 'L1 -- Pass/Fail',
    description: 'Per-assertion pass/fail',
  },
  {
    value: FeedbackLevel.Hints,
    label: 'L2 -- Hints',
    description: '+ Hint access',
  },
  {
    value: FeedbackLevel.AssertionDetails,
    label: 'L3 -- Details',
    description: '+ Assertion details (default)',
  },
  {
    value: FeedbackLevel.FullDiagnostics,
    label: 'L4 -- Full',
    description: 'Full diagnostics',
  },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const store = getSettingsStore();
  const settings = useStore(store, (s) => s.settings);
  const loaded = useStore(store, (s) => s.loaded);

  // Hydrate settings from localStorage on first open
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!hydrated) {
      store.getState().hydrate();
      setHydrated(true);
    }
  }, [store, hydrated]);

  if (!loaded && !hydrated) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure feedback level, editor behavior, and appearance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feedback Level */}
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              Feedback Level
            </h3>
            <Select
              value={String(settings.feedbackLevel)}
              onValueChange={(v) =>
                store.getState().setFeedbackLevel(Number(v) as FeedbackLevel)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_LEVELS.map((level) => (
                  <SelectItem
                    key={level.value}
                    value={String(level.value)}
                  >
                    <span className="font-medium">{level.label}</span>
                    <span className="ml-2 text-muted-foreground">
                      {level.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* Editor Keybindings */}
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              Keybindings
            </h3>
            <Select
              value={settings.keybindings}
              onValueChange={(v) =>
                store.getState().setKeybindings(v as EditorKeybindings)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="vim">Vim</SelectItem>
                <SelectItem value="emacs">Emacs</SelectItem>
              </SelectContent>
            </Select>
          </section>

          {/* Autocomplete */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="autocomplete"
                checked={settings.autocomplete}
                onCheckedChange={(checked) =>
                  store.getState().setAutocomplete(checked === true)
                }
              />
              <label htmlFor="autocomplete" className="text-sm text-foreground">
                Autocomplete (IntelliSense)
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Show code suggestions as you type. Disable for a distraction-free editor.
            </p>
          </section>

          {/* Formatter */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Formatter</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">
                  Tab size
                </label>
                <Select
                  value={String(settings.formatter.defaults.tabSize)}
                  onValueChange={(v) =>
                    store.getState().setFormatter({
                      defaults: {
                        ...settings.formatter.defaults,
                        tabSize: Number(v),
                      },
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Checkbox
                  id="use-tabs"
                  checked={settings.formatter.defaults.useTabs}
                  onCheckedChange={(checked) =>
                    store.getState().setFormatter({
                      defaults: {
                        ...settings.formatter.defaults,
                        useTabs: checked === true,
                      },
                    })
                  }
                />
                <label
                  htmlFor="use-tabs"
                  className="text-sm text-muted-foreground"
                >
                  Use tabs
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Trigger</label>
              <Select
                value={settings.formatter.defaults.trigger}
                onValueChange={(v) =>
                  store.getState().setFormatter({
                    defaults: {
                      ...settings.formatter.defaults,
                      trigger: v as FormatterTrigger,
                    },
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="onSave">On save</SelectItem>
                  <SelectItem value="onSubmit">On submit</SelectItem>
                  <SelectItem value="onPaste">On paste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
