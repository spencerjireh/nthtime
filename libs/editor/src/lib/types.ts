import type { VerificationResult, Difficulty } from '@nthtime/shared';

export interface EditorFile {
  readonly path: string;
  content: string;
}

export type RunState = 'idle' | 'running' | 'complete';

export type ViewMode = 'editing' | 'results';

export type ResultsCodeView = 'submitted' | 'diff' | 'solution';

export interface ChallengeMetadata {
  readonly title: string;
  readonly prompt: string;
  readonly difficulty: Difficulty;
  readonly tags: readonly string[];
}

export interface EditorState {
  challengeId: string | null;
  files: Record<string, EditorFile>;
  activeFilePath: string | null;
  tabOrder: string[];
  runState: RunState;
  verificationResult: VerificationResult | null;
  hintsRevealed: number;
  totalHints: number;
  hints: string[];
  challengeMetadata: ChallengeMetadata | null;
  viewMode: ViewMode;
  resultsCodeView: ResultsCodeView;
  submittedFiles: Record<string, EditorFile> | null;
  referenceSolutionFiles: Record<string, EditorFile> | null;
}

export interface EditorActions {
  initFromChallenge(
    challenge: {
      hints: readonly string[];
      title: string;
      prompt: string;
      difficulty: Difficulty;
      tags: readonly string[];
      referenceSolution: readonly { path: string; content: string }[];
    },
    challengeId?: string,
    fileStubs?: boolean,
  ): void;
  setFileContent(path: string, content: string): void;
  setActiveFile(path: string): void;
  createFile(path: string, content?: string): void;
  renameFile(oldPath: string, newPath: string): void;
  deleteFile(path: string): void;
  openTab(path: string): void;
  closeTab(path: string): void;
  reorderTabs(fromIndex: number, toIndex: number): void;
  setRunState(state: RunState): void;
  setVerificationResult(result: VerificationResult | null): void;
  revealNextHint(): void;
  submit(): void;
  retry(): void;
  reset(): void;
  setResultsCodeView(view: ResultsCodeView): void;
  getAllFileEntries(): { path: string; content: string }[];
  saveDraft(): void;
  loadDraft(challengeId: string): boolean;
  clearDraft(): void;
}

export type EditorStore = EditorState & EditorActions;
