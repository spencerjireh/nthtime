import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSettingsStore } from './settings-store';
import { FeedbackLevel } from '@nthtime/shared';

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
    expect(state.settings.feedbackLevel).toBe(FeedbackLevel.AssertionDetails);
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

  it('setFeedbackLevel updates state and persists', () => {
    const store = createSettingsStore();
    store.getState().setFeedbackLevel(FeedbackLevel.Hints);
    expect(store.getState().settings.feedbackLevel).toBe(FeedbackLevel.Hints);

    const stored = JSON.parse(localStorage.getItem('nthtime:settings')!);
    expect(stored.feedbackLevel).toBe(FeedbackLevel.Hints);
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
    store1.getState().setFeedbackLevel(FeedbackLevel.None);
    store1.getState().setAutocomplete(false);

    const store2 = createSettingsStore();
    store2.getState().hydrate();

    expect(store2.getState().settings.keybindings).toBe('emacs');
    expect(store2.getState().settings.feedbackLevel).toBe(FeedbackLevel.None);
    expect(store2.getState().settings.autocomplete).toBe(false);
    expect(store2.getState().loaded).toBe(true);
  });

  it('syncFromServer overrides local state', () => {
    const store = createSettingsStore();
    store.getState().setKeybindings('vim');
    store.getState().syncFromServer({ keybindings: 'emacs', feedbackLevel: FeedbackLevel.Hints });

    expect(store.getState().settings.keybindings).toBe('emacs');
    expect(store.getState().settings.feedbackLevel).toBe(FeedbackLevel.Hints);
    expect(store.getState().loaded).toBe(true);
  });

  it('syncFromServer preserves settings not included in partial', () => {
    const store = createSettingsStore();
    store.getState().setAutocomplete(false);
    store.getState().syncFromServer({ keybindings: 'vim' });

    expect(store.getState().settings.autocomplete).toBe(false);
    expect(store.getState().settings.keybindings).toBe('vim');
  });
});
