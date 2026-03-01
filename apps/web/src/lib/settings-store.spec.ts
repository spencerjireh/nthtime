import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSettingsStore } from './settings-store';
import { DEFAULT_FEEDBACK } from '@nthtime/shared';

// Node 25 ships an experimental localStorage that lacks .clear().
// Stub with a Map-backed implementation for test isolation.
function createMockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (index: number) => [...store.keys()][index] ?? null,
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createMockStorage());
});

describe('settings store', () => {
  it('starts with default settings', () => {
    const store = createSettingsStore();
    const state = store.getState();
    expect(state.settings.feedback).toEqual(DEFAULT_FEEDBACK);
    expect(state.settings.keybindings).toBe('default');
    expect(state.settings.autocomplete).toBe(true);
    expect(state.loaded).toBe(false);
  });

  it('hydrate from empty localStorage loads defaults', () => {
    const store = createSettingsStore();
    store.getState().hydrate();
    expect(store.getState().loaded).toBe(true);
    expect(store.getState().settings.keybindings).toBe('default');
  });

  it('setFeedback updates individual flags and persists', () => {
    const store = createSettingsStore();
    store.getState().setFeedback({ showDiff: true });
    expect(store.getState().settings.feedback.showDiff).toBe(true);
    // Other flags unchanged
    expect(store.getState().settings.feedback.showPassFail).toBe(true);

    const raw = localStorage.getItem('nthtime:settings');
    if (!raw) throw new Error('Expected settings to be persisted');
    const stored = JSON.parse(raw);
    expect(stored.feedback.showDiff).toBe(true);
  });

  it('setFeedback merges multiple flags', () => {
    const store = createSettingsStore();
    store.getState().setFeedback({ showPassFail: false, showSolution: true });
    const { feedback } = store.getState().settings;
    expect(feedback.showPassFail).toBe(false);
    expect(feedback.showSolution).toBe(true);
    expect(feedback.showHints).toBe(true); // untouched
  });

  it('setKeybindings updates state and persists', () => {
    const store = createSettingsStore();
    store.getState().setKeybindings('vim');
    expect(store.getState().settings.keybindings).toBe('vim');
  });

  it('setAutocomplete updates state and persists', () => {
    const store = createSettingsStore();
    store.getState().setAutocomplete(false);
    expect(store.getState().settings.autocomplete).toBe(false);
  });

  it('setDarkMode updates state and persists', () => {
    const store = createSettingsStore();
    store.getState().setDarkMode(false);
    expect(store.getState().settings.darkMode).toBe(false);
  });

  it('setFormatter updates state and persists', () => {
    const store = createSettingsStore();
    store.getState().setFormatter({
      defaults: { enabled: true, trigger: 'onSave', tabSize: 4, useTabs: true },
    });
    const { formatter } = store.getState().settings;
    expect(formatter.defaults.trigger).toBe('onSave');
    expect(formatter.defaults.tabSize).toBe(4);
  });

  it('round-trip: mutate -> hydrate fresh store -> state matches', () => {
    const store1 = createSettingsStore();
    store1.getState().setKeybindings('emacs');
    store1.getState().setFeedback({ showPassFail: false, showDiff: true });
    store1.getState().setAutocomplete(false);

    const store2 = createSettingsStore();
    store2.getState().hydrate();

    expect(store2.getState().settings.keybindings).toBe('emacs');
    expect(store2.getState().settings.feedback.showPassFail).toBe(false);
    expect(store2.getState().settings.feedback.showDiff).toBe(true);
    expect(store2.getState().settings.autocomplete).toBe(false);
    expect(store2.getState().loaded).toBe(true);
  });

  it('syncFromServer overrides local state', () => {
    const store = createSettingsStore();
    store.getState().setKeybindings('vim');
    store.getState().syncFromServer({
      keybindings: 'emacs',
      feedback: { ...DEFAULT_FEEDBACK, showDiff: true },
    });

    expect(store.getState().settings.keybindings).toBe('emacs');
    expect(store.getState().settings.feedback.showDiff).toBe(true);
    expect(store.getState().loaded).toBe(true);
  });

  it('syncFromServer preserves settings not included in partial', () => {
    const store = createSettingsStore();
    store.getState().setAutocomplete(false);
    store.getState().syncFromServer({ keybindings: 'vim' });

    expect(store.getState().settings.autocomplete).toBe(false);
    expect(store.getState().settings.keybindings).toBe('vim');
  });

  it('migrates old feedbackLevel from localStorage', () => {
    // Write old-format data (pre-migration)
    localStorage.setItem('nthtime:settings', JSON.stringify({
      feedbackLevel: 2,
      keybindings: 'vim',
      darkMode: true,
      autocomplete: true,
      formatter: {
        defaults: { enabled: true, trigger: 'manual', tabSize: 2, useTabs: false },
        overrides: {},
      },
    }));

    const store = createSettingsStore();
    store.getState().hydrate();

    const { feedback } = store.getState().settings;
    expect(feedback.showPassFail).toBe(true);   // level >= 1
    expect(feedback.showHints).toBe(true);       // level >= 2
    expect(feedback.showAssertionDetails).toBe(false); // level < 3
    expect(feedback.showDiff).toBe(false);       // level < 4
    expect(feedback.showSolution).toBe(false);   // always false for migration
    expect(store.getState().settings.keybindings).toBe('vim');
  });

  it('does not migrate when feedback already exists', () => {
    localStorage.setItem('nthtime:settings', JSON.stringify({
      feedbackLevel: 4,
      feedback: { ...DEFAULT_FEEDBACK, showDiff: true },
      keybindings: 'default',
      darkMode: true,
      autocomplete: true,
      formatter: {
        defaults: { enabled: true, trigger: 'manual', tabSize: 2, useTabs: false },
        overrides: {},
      },
    }));

    const store = createSettingsStore();
    store.getState().hydrate();

    // Should use the existing feedback, not regenerate from feedbackLevel
    expect(store.getState().settings.feedback.showDiff).toBe(true);
  });
});
