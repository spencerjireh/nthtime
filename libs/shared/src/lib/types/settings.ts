export enum FeedbackLevel {
  None = 0,
  PassFail = 1,
  Hints = 2,
  AssertionDetails = 3,
  FullDiagnostics = 4,
}

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
  readonly feedbackLevel: FeedbackLevel;
  readonly difficulty: Difficulty;
  readonly keybindings: EditorKeybindings;
  readonly formatter: FormatterConfig;
  readonly darkMode: boolean;
  readonly autocomplete: boolean;
}
