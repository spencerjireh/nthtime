'use client';

import { useCallback } from 'react';
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
import { isFeatureEnabled } from '@/lib/feature-flags';
import { RESET_LAYOUT_EVENT, clearPanelStorage } from '@/components/challenge/default-layout';
import type { FeedbackConfig, EditorKeybindings } from '@nthtime/shared';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ALL_FEEDBACK_FLAGS: { key: keyof FeedbackConfig; label: string }[] = [
  { key: 'showPassFail', label: 'Show pass/fail per assertion' },
  { key: 'showHints', label: 'Show hints' },
  { key: 'showAssertionDetails', label: 'Show assertion details and line numbers' },
  { key: 'showDiff', label: 'Show diff (your code vs reference solution)' },
  { key: 'showSolution', label: 'Show reference solution' },
];

const FEEDBACK_FLAGS = isFeatureEnabled('solutionView')
  ? ALL_FEEDBACK_FLAGS
  : ALL_FEEDBACK_FLAGS.filter((f) => f.key !== 'showSolution');

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const store = getSettingsStore();
  const settings = useStore(store, (s) => s.settings);

  const updateFormatterDefault = useCallback(
    (key: string, value: unknown) => {
      store.getState().setFormatter({
        defaults: { ...store.getState().settings.formatter.defaults, [key]: value },
      });
    },
    [store],
  );

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

          {/* File Stubs */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="file-stubs"
                checked={settings.fileStubs}
                onCheckedChange={(checked) =>
                  store.getState().setFileStubs(checked === true)
                }
              />
              <label htmlFor="file-stubs" className="text-sm text-foreground">
                Start with file stubs
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Create empty files at the expected paths when starting a challenge.
              Disable to start with a completely blank editor.
            </p>
          </section>

          {/* Trace Mode */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="trace-mode"
                checked={settings.traceMode}
                onCheckedChange={(checked) =>
                  store.getState().setTraceMode(checked === true)
                }
              />
              <label htmlFor="trace-mode" className="text-sm text-foreground">
                Trace mode
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Show ghost text guiding you through the reference solution as you type.
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
                  onValueChange={(v) => updateFormatterDefault('tabSize', Number(v))}
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
                  onCheckedChange={(checked) => updateFormatterDefault('useTabs', checked === true)}
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
                onValueChange={(v) => updateFormatterDefault('trigger', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="onSave">On save</SelectItem>
                  <SelectItem value="onSubmit">On submit</SelectItem>
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
                clearPanelStorage();
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
