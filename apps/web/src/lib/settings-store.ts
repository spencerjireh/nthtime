import { createStore } from 'zustand/vanilla';
import type {
  UserSettings,
  FeedbackLevel,
  EditorKeybindings,
  FormatterConfig,
} from '@nthtime/shared';

const STORAGE_KEY = 'nthtime:settings';

export interface SettingsState {
  settings: UserSettings;
  loaded: boolean;
}

export interface SettingsActions {
  setFeedbackLevel(level: FeedbackLevel): void;
  setKeybindings(kb: EditorKeybindings): void;
  setDarkMode(dark: boolean): void;
  setFormatter(config: Partial<FormatterConfig>): void;
  setAutocomplete(enabled: boolean): void;
  syncFromServer(settings: Partial<UserSettings>): void;
  hydrate(): void;
}

export type SettingsStore = SettingsState & SettingsActions;

const DEFAULT_SETTINGS: UserSettings = {
  feedbackLevel: 3 as FeedbackLevel,
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
};

function persistToLocalStorage(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function loadFromLocalStorage(): UserSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSettings;
  } catch {
    return null;
  }
}

export function createSettingsStore() {
  return createStore<SettingsStore>((set) => ({
    settings: DEFAULT_SETTINGS,
    loaded: false,

    setFeedbackLevel(level) {
      set((state) => {
        const settings = { ...state.settings, feedbackLevel: level };
        persistToLocalStorage(settings);
        return { settings };
      });
    },

    setKeybindings(kb) {
      set((state) => {
        const settings = { ...state.settings, keybindings: kb };
        persistToLocalStorage(settings);
        return { settings };
      });
    },

    setDarkMode(dark) {
      set((state) => {
        const settings = { ...state.settings, darkMode: dark };
        persistToLocalStorage(settings);
        return { settings };
      });
    },

    setAutocomplete(enabled) {
      set((state) => {
        const settings = { ...state.settings, autocomplete: enabled };
        persistToLocalStorage(settings);
        return { settings };
      });
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
  }));
}

// Singleton store for app-wide usage
let _store: ReturnType<typeof createSettingsStore> | null = null;

export function getSettingsStore() {
  if (!_store) {
    _store = createSettingsStore();
  }
  return _store;
}
