import { createStore } from 'zustand/vanilla';
import type { EditorStore, EditorState, EditorFile, ResultsCodeView } from './types.js';
import {
  saveDraft as saveDraftToStorage,
  loadDraft as loadDraftFromStorage,
  clearDraft as clearDraftFromStorage,
} from './draft-storage.js';

const initialState: EditorState = {
  challengeId: null,
  files: {},
  activeFilePath: null,
  tabOrder: [],
  runState: 'idle',
  verificationResult: null,
  hintsRevealed: 0,
  totalHints: 0,
  hints: [],
  challengeMetadata: null,
  viewMode: 'editing',
  resultsCodeView: 'submitted',
  submittedFiles: null,
  referenceSolutionFiles: null,
};

export function createEditorStore() {
  return createStore<EditorStore>((set, get) => ({
    ...initialState,

    initFromChallenge(challenge, challengeId, fileStubs = true) {
      const files: Record<string, EditorFile> = {};
      let firstPath: string | null = null;

      if (fileStubs) {
        for (const file of challenge.referenceSolution) {
          files[file.path] = { path: file.path, content: '' };
          if (!firstPath) firstPath = file.path;
        }
      }

      const referenceSolutionFiles: Record<string, EditorFile> = {};
      for (const file of challenge.referenceSolution) {
        referenceSolutionFiles[file.path] = { path: file.path, content: file.content };
      }

      const baseState: EditorState = {
        ...initialState,
        challengeId: challengeId ?? null,
        files,
        referenceSolutionFiles,
        activeFilePath: firstPath,
        tabOrder: Object.keys(files),
        totalHints: challenge.hints.length,
        hints: [...challenge.hints],
        challengeMetadata: {
          title: challenge.title,
          prompt: challenge.prompt,
          difficulty: challenge.difficulty,
          tags: [...challenge.tags],
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

    createFile(path, content = '') {
      const { files, tabOrder } = get();
      if (files[path]) return; // duplicate -- no-op
      set({
        files: { ...files, [path]: { path, content } },
        activeFilePath: path,
        tabOrder: [...tabOrder, path],
      });
    },

    renameFile(oldPath, newPath) {
      const { files, activeFilePath, tabOrder } = get();
      if (!files[oldPath] || files[newPath]) return; // missing source or duplicate target
      const { [oldPath]: file, ...rest } = files;
      const updatedFiles = { ...rest, [newPath]: { path: newPath, content: file.content } };

      set({
        files: updatedFiles,
        activeFilePath: activeFilePath === oldPath ? newPath : activeFilePath,
        tabOrder: tabOrder.map((p) => (p === oldPath ? newPath : p)),
      });
    },

    deleteFile(path) {
      const { files, activeFilePath, tabOrder } = get();
      if (!files[path]) return;
      const rest = Object.fromEntries(Object.entries(files).filter(([k]) => k !== path));

      let nextActive = activeFilePath;
      if (activeFilePath === path) {
        const idx = tabOrder.indexOf(path);
        nextActive = tabOrder[idx + 1] ?? tabOrder[idx - 1] ?? null;
      }

      set({
        files: rest,
        activeFilePath: nextActive,
        tabOrder: tabOrder.filter((p) => p !== path),
      });
    },

    openTab(path) {
      const { files, tabOrder } = get();
      if (!files[path]) return;
      const updates: Partial<EditorState> = { activeFilePath: path };
      if (!tabOrder.includes(path)) {
        updates.tabOrder = [...tabOrder, path];
      }
      set(updates);
    },

    closeTab(path) {
      const { tabOrder, activeFilePath } = get();
      const idx = tabOrder.indexOf(path);
      if (idx === -1) return;
      const newTabOrder = tabOrder.filter((p) => p !== path);

      let nextActive = activeFilePath;
      if (activeFilePath === path) {
        nextActive = newTabOrder[idx] ?? newTabOrder[idx - 1] ?? null;
      }

      set({ tabOrder: newTabOrder, activeFilePath: nextActive });
    },

    reorderTabs(fromIndex, toIndex) {
      const { tabOrder } = get();
      if (
        fromIndex < 0 || fromIndex >= tabOrder.length ||
        toIndex < 0 || toIndex >= tabOrder.length
      ) return;
      const newOrder = [...tabOrder];
      const [moved] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, moved);
      set({ tabOrder: newOrder });
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

    submit() {
      const { files } = get();
      set({
        submittedFiles: { ...files },
        viewMode: 'results',
        resultsCodeView: 'submitted',
      });
    },

    retry() {
      const { submittedFiles } = get();
      set({
        viewMode: 'editing',
        resultsCodeView: 'submitted',
        runState: 'idle',
        verificationResult: null,
        // Restore submitted code into editor
        ...(submittedFiles ? { files: { ...submittedFiles } } : {}),
      });
    },

    reset() {
      set(initialState);
    },

    setResultsCodeView(view: ResultsCodeView) {
      set({ resultsCodeView: view });
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
