import { createStore } from 'zustand/vanilla';
import { DEFAULT_FEEDBACK } from '@nthtime/shared';
import type {
  UserSettings,
  FeedbackConfig,
  EditorKeybindings,
  FormatterConfig,
} from '@nthtime/shared';

const STORAGE_KEY = 'nthtime:settings';

export interface SettingsState {
  settings: UserSettings;
  loaded: boolean;
}

export interface SettingsActions {
  setFeedback(config: Partial<FeedbackConfig>): void;
  setKeybindings(kb: EditorKeybindings): void;
  setDarkMode(dark: boolean): void;
  setFormatter(config: Partial<FormatterConfig>): void;
  setAutocomplete(enabled: boolean): void;
  setFileStubs(enabled: boolean): void;
  setTraceMode(enabled: boolean): void;
  setPromptCollapsed(collapsed: boolean): void;
  syncFromServer(settings: Partial<UserSettings>): void;
  hydrate(): void;
}

export type SettingsStore = SettingsState & SettingsActions;

const DEFAULT_SETTINGS: UserSettings = {
  feedback: { ...DEFAULT_FEEDBACK },
  difficulty: 'beginner' as UserSettings['difficulty'],
  keybindings: 'default',
  formatter: {
    defaults: {
      enabled: true,
      trigger: 'manual',
      tabSize: 2,
      useTabs: false,
    },
    overrides: {},
  },
  darkMode: true,
  autocomplete: true,
  fileStubs: true,
  traceMode: false,
  promptCollapsed: false,
};

function persistToLocalStorage(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function migrateFromFeedbackLevel(parsed: Record<string, unknown>): Record<string, unknown> {
  if (typeof parsed.feedbackLevel === 'number' && !parsed.feedback) {
    const level = parsed.feedbackLevel as number;
    parsed.feedback = {
      showPassFail: level >= 1,
      showHints: level >= 2,
      showAssertionDetails: level >= 3,
      showDiff: level >= 4,
      showSolution: false,
    };
    delete parsed.feedbackLevel;
  }
  return parsed;
}

function loadFromLocalStorage(): UserSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = migrateFromFeedbackLevel(JSON.parse(raw));
    // Migrate removed onPaste trigger
    const formatter = parsed.formatter as Record<string, unknown> | undefined;
    const defaults = formatter?.defaults as Record<string, unknown> | undefined;
    if (defaults?.trigger === 'onPaste') {
      defaults.trigger = 'manual';
    }
    return parsed as unknown as UserSettings;
  } catch {
    return null;
  }
}

export function createSettingsStore() {
  return createStore<SettingsStore>((set) => {
    const update = (patch: Partial<UserSettings>) =>
      set((state) => {
        const settings = { ...state.settings, ...patch };
        persistToLocalStorage(settings);
        return { settings };
      });

    return {
      settings: DEFAULT_SETTINGS,
      loaded: false,

      setFeedback(config) {
        set((state) => {
          const settings = {
            ...state.settings,
            feedback: { ...state.settings.feedback, ...config },
          };
          persistToLocalStorage(settings);
          return { settings };
        });
      },

      setKeybindings(kb) {
        update({ keybindings: kb });
      },

      setDarkMode(dark) {
        update({ darkMode: dark });
      },

      setAutocomplete(enabled) {
        update({ autocomplete: enabled });
      },

      setFileStubs(enabled) {
        update({ fileStubs: enabled });
      },

      setTraceMode(enabled) {
        update({ traceMode: enabled });
      },

      setPromptCollapsed(collapsed) {
        update({ promptCollapsed: collapsed });
      },

      setFormatter(config) {
        set((state) => {
          const settings = {
            ...state.settings,
            formatter: { ...state.settings.formatter, ...config },
          };
          persistToLocalStorage(settings);
          return { settings };
        });
      },

      syncFromServer(serverSettings) {
        set((state) => ({
          settings: { ...state.settings, ...serverSettings },
          loaded: true,
        }));
      },

      hydrate() {
        const stored = loadFromLocalStorage();
        if (stored) {
          set({ settings: { ...DEFAULT_SETTINGS, ...stored }, loaded: true });
        } else {
          set({ loaded: true });
        }
      },
    };
  });
}

// Singleton store for app-wide usage.
// Hydrates eagerly from localStorage on first access so that components like
// DockableLayout see persisted values (e.g. promptCollapsed) immediately.
let _store: ReturnType<typeof createSettingsStore> | null = null;

export function getSettingsStore() {
  if (!_store) {
    _store = createSettingsStore();
    if (typeof window !== 'undefined') {
      _store.getState().hydrate();
    }
  }
  return _store;
}
