import type { VerificationResult, Difficulty } from '@nthtime/shared';

export interface EditorFile {
  readonly path: string;
  content: string;
}

export type RunState = 'idle' | 'running' | 'complete';

export type ViewMode = 'editing' | 'results' | 'solution';

export type SplitMode = 'single' | 'horizontal';

export interface TimerState {
  startedAt: number | null;
  elapsedSeconds: number;
}

export interface ChallengeMetadata {
  readonly title: string;
  readonly prompt: string;
  readonly difficulty: Difficulty;
  readonly tags: readonly string[];
  readonly timeEstimateSeconds: number;
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
  timer: TimerState;
  challengeMetadata: ChallengeMetadata | null;
  splitMode: SplitMode;
  secondActiveFilePath: string | null;
  viewMode: ViewMode;
  submittedFiles: Record<string, EditorFile> | null;
  scaffoldFiles: Record<string, EditorFile> | null;
  referenceSolutionFiles: Record<string, EditorFile> | null;
}

export interface EditorActions {
  initFromChallenge(
    challenge: {
      files: readonly { path: string; content: string }[];
      hints: readonly string[];
      title: string;
      prompt: string;
      difficulty: Difficulty;
      tags: readonly string[];
      timeEstimateSeconds: number;
      scaffolded?: boolean;
      referenceSolution?: readonly { path: string; content: string }[];
    },
    challengeId?: string,
  ): void;
  setFileContent(path: string, content: string): void;
  setActiveFile(path: string): void;
  createFile(path: string, content?: string): void;
  renameFile(oldPath: string, newPath: string): void;
  deleteFile(path: string): void;
  openTab(path: string): void;
  closeTab(path: string): void;
  reorderTabs(fromIndex: number, toIndex: number): void;
  toggleSplit(): void;
  setSecondActiveFile(path: string): void;
  closeSplit(): void;
  setRunState(state: RunState): void;
  setVerificationResult(result: VerificationResult | null): void;
  revealNextHint(): void;
  startTimer(): void;
  tickTimer(): void;
  stopTimer(): void;
  submit(): void;
  retry(): void;
  reset(): void;
  showSolution(): void;
  hideSolution(): void;
  getAllFileEntries(): { path: string; content: string }[];
  saveDraft(): void;
  loadDraft(challengeId: string): boolean;
  clearDraft(): void;
  isDirty(path: string): boolean;
}

export type EditorStore = EditorState & EditorActions;
