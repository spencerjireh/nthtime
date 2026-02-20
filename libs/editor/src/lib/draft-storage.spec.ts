import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveDraft,
  loadDraft,
  clearDraft,
  clearAllDrafts,
  getDraftKey,
  type DraftData,
} from './draft-storage.js';

// Mock localStorage
const store = new Map<string, string>();
const localStorageMock: Storage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, value);
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => store.clear(),
  get length() {
    return store.size;
  },
  key: (index: number) => [...store.keys()][index] ?? null,
};

vi.stubGlobal('localStorage', localStorageMock);

const makeDraft = (content = 'hello'): DraftData => ({
  files: { 'app.js': { path: 'app.js', content } },
  hintsRevealed: 1,
  timestamp: Date.now(),
});

beforeEach(() => {
  store.clear();
});

describe('draft-storage', () => {
  it('generates deterministic keys', () => {
    expect(getDraftKey('abc')).toBe('nthtime:draft:abc');
  });

  it('saves and loads a draft', () => {
    const draft = makeDraft();
    saveDraft('c1', draft);
    const loaded = loadDraft('c1');
    expect(loaded).toEqual(draft);
  });

  it('returns null for missing drafts', () => {
    expect(loadDraft('nonexistent')).toBeNull();
  });

  it('isolates drafts by challenge ID', () => {
    saveDraft('c1', makeDraft('one'));
    saveDraft('c2', makeDraft('two'));

    expect(loadDraft('c1')!.files['app.js'].content).toBe('one');
    expect(loadDraft('c2')!.files['app.js'].content).toBe('two');
  });

  it('clears a single draft', () => {
    saveDraft('c1', makeDraft());
    saveDraft('c2', makeDraft());

    clearDraft('c1');
    expect(loadDraft('c1')).toBeNull();
    expect(loadDraft('c2')).not.toBeNull();
  });

  it('clears all drafts', () => {
    saveDraft('c1', makeDraft());
    saveDraft('c2', makeDraft());
    store.set('other-key', 'should survive');

    clearAllDrafts();
    expect(loadDraft('c1')).toBeNull();
    expect(loadDraft('c2')).toBeNull();
    expect(store.get('other-key')).toBe('should survive');
  });

  it('handles corrupt JSON gracefully', () => {
    store.set(getDraftKey('c1'), '{not valid json');
    const loaded = loadDraft('c1');
    expect(loaded).toBeNull();
    // Corrupt entry should be cleaned up
    expect(store.has(getDraftKey('c1'))).toBe(false);
  });

  it('handles malformed draft objects gracefully', () => {
    store.set(getDraftKey('c1'), JSON.stringify({ bad: 'data' }));
    expect(loadDraft('c1')).toBeNull();
  });
});
