import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { SettingsPanelProps } from './settings-dialog';
import type { EditorKeybindings } from '@nthtime/shared';

export function EditorSettings({ store, settings }: SettingsPanelProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Keybindings */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Keybindings</h3>
        <Select
          value={settings.keybindings}
          onValueChange={(v) => store.getState().setKeybindings(v as EditorKeybindings)}
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
            onCheckedChange={(checked) => store.getState().setAutocomplete(checked === true)}
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
            onCheckedChange={(checked) => store.getState().setFileStubs(checked === true)}
          />
          <label htmlFor="file-stubs" className="text-sm text-foreground">
            Start with file stubs
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Create empty files at the expected paths when starting a challenge. Disable to start with
          a completely blank editor.
        </p>
      </section>

      {/* Trace Mode */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="trace-mode"
            checked={settings.traceMode}
            onCheckedChange={(checked) => store.getState().setTraceMode(checked === true)}
          />
          <label htmlFor="trace-mode" className="text-sm text-foreground">
            Trace mode
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Show ghost text guiding you through the reference solution as you type.
        </p>
      </section>
    </div>
  );
}
