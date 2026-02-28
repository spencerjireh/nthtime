export interface FeedbackConfig {
  readonly showPassFail: boolean;
  readonly showHints: boolean;
  readonly showAssertionDetails: boolean;
  readonly showDiff: boolean;
  readonly showSolution: boolean;
}

// Keep in sync with convex/settings.ts DEFAULT_FEEDBACK
export const DEFAULT_FEEDBACK: FeedbackConfig = {
  showPassFail: true,
  showHints: true,
  showAssertionDetails: true,
  showDiff: false,
  showSolution: false,
};

export enum Difficulty {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export type EditorKeybindings = 'default' | 'vim' | 'emacs';

export type FormatterTrigger = 'onSave' | 'onSubmit' | 'onPaste' | 'manual';

export interface LanguageFormatterSettings {
  readonly enabled: boolean;
  readonly trigger: FormatterTrigger;
  readonly tabSize: number;
  readonly useTabs: boolean;
}

export interface FormatterConfig {
  readonly defaults: LanguageFormatterSettings;
  readonly overrides: Readonly<Record<string, Partial<LanguageFormatterSettings>>>;
}

export interface UserSettings {
  readonly feedback: FeedbackConfig;
  readonly difficulty: Difficulty;
  readonly keybindings: EditorKeybindings;
  readonly formatter: FormatterConfig;
  readonly darkMode: boolean;
  readonly autocomplete: boolean;
  readonly promptCollapsed: boolean;
  readonly fileStubs: boolean;
}
