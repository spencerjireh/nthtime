import { createStore } from 'zustand/vanilla';
import type { EditorStore, EditorState } from './types.js';
import {
  saveDraft as saveDraftToStorage,
  loadDraft as loadDraftFromStorage,
  clearDraft as clearDraftFromStorage,
} from './draft-storage.js';

const initialState: EditorState = {
  challengeId: null,
  files: {},
  activeFilePath: null,
  runState: 'idle',
  verificationResult: null,
  hintsRevealed: 0,
  totalHints: 0,
  hints: [],
  timer: { startedAt: null, elapsedSeconds: 0 },
  challengeMetadata: null,
};

export function createEditorStore() {
  return createStore<EditorStore>((set, get) => ({
    ...initialState,

    initFromChallenge(challenge, challengeId) {
      const files: Record<string, { path: string; content: string }> = {};
      let firstPath: string | null = null;
      for (const file of challenge.files) {
        files[file.path] = { path: file.path, content: file.content };
        if (!firstPath) firstPath = file.path;
      }

      const baseState: EditorState = {
        ...initialState,
        challengeId: challengeId ?? null,
        files,
        activeFilePath: firstPath,
        totalHints: challenge.hints.length,
        hints: [...challenge.hints],
        challengeMetadata: {
          title: challenge.title,
          prompt: challenge.prompt,
          difficulty: challenge.difficulty,
          tags: [...challenge.tags],
          timeEstimateSeconds: challenge.timeEstimateSeconds,
        },
      };

      // Attempt to restore draft
      if (challengeId) {
        const draft = loadDraftFromStorage(challengeId);
        if (draft) {
          set({
            ...baseState,
            files: draft.files,
            hintsRevealed: Math.min(
              draft.hintsRevealed,
              challenge.hints.length,
            ),
          });
          return;
        }
      }

      set(baseState);
    },

    setFileContent(path, content) {
      set((state) => ({
        files: {
          ...state.files,
          [path]: { path, content },
        },
      }));
    },

    setActiveFile(path) {
      set({ activeFilePath: path });
    },

    setRunState(runState) {
      set({ runState });
    },

    setVerificationResult(result) {
      set({ verificationResult: result });
    },

    revealNextHint() {
      set((state) => ({
        hintsRevealed: Math.min(state.hintsRevealed + 1, state.totalHints),
      }));
    },

    startTimer() {
      const { timer } = get();
      if (timer.startedAt !== null) return;
      set({ timer: { ...timer, startedAt: Date.now() } });
    },

    tickTimer() {
      const { timer } = get();
      if (timer.startedAt === null) return;
      const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
      set({ timer: { ...timer, elapsedSeconds: elapsed } });
    },

    stopTimer() {
      set((state) => ({
        timer: { ...state.timer, startedAt: null },
      }));
    },

    reset() {
      set(initialState);
    },

    getAllFileEntries() {
      return Object.values(get().files).map((f) => ({
        path: f.path,
        content: f.content,
      }));
    },

    saveDraft() {
      const { challengeId, files, hintsRevealed } = get();
      if (!challengeId) return;
      saveDraftToStorage(challengeId, {
        files,
        hintsRevealed,
        timestamp: Date.now(),
      });
    },

    loadDraft(challengeId) {
      const draft = loadDraftFromStorage(challengeId);
      if (!draft) return false;
      set({
        files: draft.files,
        hintsRevealed: Math.min(draft.hintsRevealed, get().totalHints),
      });
      return true;
    },

    clearDraft() {
      const { challengeId } = get();
      if (challengeId) {
        clearDraftFromStorage(challengeId);
      }
    },
  }));
}
