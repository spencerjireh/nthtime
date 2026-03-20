import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { RESET_LAYOUT_EVENT, clearPanelStorage } from '@/components/challenge/default-layout';
import type { SettingsPanelProps } from './settings-dialog';

export function FormattingSettings({ store, settings }: SettingsPanelProps) {
  const updateFormatterDefault = useCallback(
    (key: string, value: unknown) => {
      store.getState().setFormatter({
        defaults: { ...store.getState().settings.formatter.defaults, [key]: value },
      });
    },
    [store],
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Formatter */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Formatter</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Tab size</label>
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
            <label htmlFor="use-tabs" className="text-sm text-muted-foreground">
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
  );
}
