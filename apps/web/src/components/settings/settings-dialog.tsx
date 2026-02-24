'use client';

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
import { Button } from '@/components/ui/button';
import { getSettingsStore } from '@/lib/settings-store';
import { RESET_LAYOUT_EVENT } from '@/components/challenge/default-layout';
import type { FeedbackConfig, EditorKeybindings, FormatterTrigger } from '@nthtime/shared';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEEDBACK_FLAGS: { key: keyof FeedbackConfig; label: string }[] = [
  { key: 'showPassFail', label: 'Show pass/fail per assertion' },
  { key: 'showHints', label: 'Show hints' },
  { key: 'showAssertionDetails', label: 'Show assertion details and line numbers' },
  { key: 'showDiff', label: 'Show diff (scaffold vs submitted)' },
  { key: 'showSolution', label: 'Show reference solution' },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const store = getSettingsStore();
  const settings = useStore(store, (s) => s.settings);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure feedback, editor behavior, and appearance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feedback */}
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              Feedback
            </h3>
            <div className="space-y-2">
              {FEEDBACK_FLAGS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={`feedback-${key}`}
                    checked={settings.feedback[key]}
                    onCheckedChange={(checked) =>
                      store.getState().setFeedback({ [key]: checked === true })
                    }
                  />
                  <label
                    htmlFor={`feedback-${key}`}
                    className="text-sm text-foreground"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
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

          {/* Layout */}
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Layout</h3>
            <p className="text-xs text-muted-foreground">
              Reset the challenge panel layout to its default arrangement.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                Object.keys(localStorage)
                  .filter((k) => k.startsWith('react-resizable-panels'))
                  .forEach((k) => localStorage.removeItem(k));
                window.dispatchEvent(new CustomEvent(RESET_LAYOUT_EVENT));
              }}
            >
              Reset panel layout
            </Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
