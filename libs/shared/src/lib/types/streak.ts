export interface HeatmapDay {
  readonly date: string;
  readonly count: number;
}

export interface StreakSnapshot {
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly lastPassDate: string | null;
  readonly heatmap: readonly HeatmapDay[];
}

export interface BackfillEntry {
  readonly challengeId: string;
  readonly passedAt: string;
}
