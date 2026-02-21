import type { VerificationResult, Difficulty } from '@nthtime/shared';

export interface EditorFile {
  readonly path: string;
  content: string;
}

export type RunState = 'idle' | 'running' | 'complete';

export type ViewMode = 'editing' | 'results';

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
  runState: RunState;
  verificationResult: VerificationResult | null;
  hintsRevealed: number;
  totalHints: number;
  hints: string[];
  timer: TimerState;
  challengeMetadata: ChallengeMetadata | null;
  viewMode: ViewMode;
  submittedFiles: Record<string, EditorFile> | null;
  scaffoldFiles: Record<string, EditorFile> | null;
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
    },
    challengeId?: string,
  ): void;
  setFileContent(path: string, content: string): void;
  setActiveFile(path: string): void;
  setRunState(state: RunState): void;
  setVerificationResult(result: VerificationResult | null): void;
  revealNextHint(): void;
  startTimer(): void;
  tickTimer(): void;
  stopTimer(): void;
  submit(): void;
  retry(): void;
  reset(): void;
  getAllFileEntries(): { path: string; content: string }[];
  saveDraft(): void;
  loadDraft(challengeId: string): boolean;
  clearDraft(): void;
  isDirty(path: string): boolean;
}

export type EditorStore = EditorState & EditorActions;
