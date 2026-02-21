import { createStore } from 'zustand/vanilla';
import type { EditorStore, EditorState, EditorFile } from './types.js';
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
  timer: { startedAt: null, elapsedSeconds: 0 },
  challengeMetadata: null,
  splitMode: 'single',
  secondActiveFilePath: null,
  viewMode: 'editing',
  submittedFiles: null,
  scaffoldFiles: null,
};

export function createEditorStore() {
  return createStore<EditorStore>((set, get) => ({
    ...initialState,

    initFromChallenge(challenge, challengeId) {
      const isScaffolded = challenge.scaffolded !== false;

      const files: Record<string, EditorFile> = {};
      const scaffoldFiles: Record<string, EditorFile> = {};
      let firstPath: string | null = null;

      if (isScaffolded) {
        for (const file of challenge.files) {
          files[file.path] = { path: file.path, content: file.content };
          scaffoldFiles[file.path] = { path: file.path, content: file.content };
          if (!firstPath) firstPath = file.path;
        }
      }

      const baseState: EditorState = {
        ...initialState,
        challengeId: challengeId ?? null,
        files,
        scaffoldFiles: isScaffolded ? scaffoldFiles : null,
        activeFilePath: firstPath,
        tabOrder: Object.keys(files),
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

      // Attempt to restore draft (only for scaffolded challenges)
      if (isScaffolded && challengeId) {
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
      const { files, activeFilePath, scaffoldFiles, tabOrder } = get();
      if (!files[oldPath] || files[newPath]) return; // missing source or duplicate target
      const { [oldPath]: file, ...rest } = files;
      const updatedFiles = { ...rest, [newPath]: { path: newPath, content: file.content } };

      let updatedScaffold = scaffoldFiles;
      if (scaffoldFiles && scaffoldFiles[oldPath]) {
        const { [oldPath]: sf, ...scaffoldRest } = scaffoldFiles;
        updatedScaffold = {
          ...scaffoldRest,
          [newPath]: { path: newPath, content: sf.content },
        };
      }

      set({
        files: updatedFiles,
        scaffoldFiles: updatedScaffold,
        activeFilePath: activeFilePath === oldPath ? newPath : activeFilePath,
        tabOrder: tabOrder.map((p) => (p === oldPath ? newPath : p)),
      });
    },

    deleteFile(path) {
      const { files, activeFilePath, tabOrder, secondActiveFilePath, splitMode } = get();
      if (!files[path]) return;
      const { [path]: _, ...rest } = files;

      let nextActive = activeFilePath;
      if (activeFilePath === path) {
        const idx = tabOrder.indexOf(path);
        nextActive = tabOrder[idx + 1] ?? tabOrder[idx - 1] ?? null;
      }

      // Reset split if second pane file is deleted
      const splitUpdate =
        splitMode === 'horizontal' && secondActiveFilePath === path
          ? { splitMode: 'single' as const, secondActiveFilePath: null }
          : {};

      set({
        files: rest,
        activeFilePath: nextActive,
        tabOrder: tabOrder.filter((p) => p !== path),
        ...splitUpdate,
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

    toggleSplit() {
      const { splitMode, files, activeFilePath } = get();
      if (splitMode === 'horizontal') {
        set({ splitMode: 'single', secondActiveFilePath: null });
      } else {
        const paths = Object.keys(files);
        const second = paths.find((p) => p !== activeFilePath) ?? activeFilePath;
        set({ splitMode: 'horizontal', secondActiveFilePath: second });
      }
    },

    setSecondActiveFile(path) {
      set({ secondActiveFilePath: path });
    },

    closeSplit() {
      set({ splitMode: 'single', secondActiveFilePath: null });
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

    submit() {
      const { files, timer } = get();
      // Snapshot files and stop timer
      const elapsed =
        timer.startedAt !== null
          ? Math.floor((Date.now() - timer.startedAt) / 1000)
          : timer.elapsedSeconds;
      set({
        submittedFiles: { ...files },
        viewMode: 'results',
        timer: { startedAt: null, elapsedSeconds: elapsed },
      });
    },

    retry() {
      const { submittedFiles } = get();
      set({
        viewMode: 'editing',
        runState: 'idle',
        verificationResult: null,
        // Restore submitted code into editor
        ...(submittedFiles ? { files: { ...submittedFiles } } : {}),
      });
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

    isDirty(path) {
      const { files, scaffoldFiles } = get();
      if (!scaffoldFiles || !files[path] || !scaffoldFiles[path]) return false;
      return files[path].content !== scaffoldFiles[path].content;
    },
  }));
}
