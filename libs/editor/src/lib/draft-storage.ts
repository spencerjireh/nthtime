export interface DraftData {
  files: Record<string, { path: string; content: string }>;
  hintsRevealed: number;
  timestamp: number;
}

const DRAFT_PREFIX = 'nthtime:draft:';

export function getDraftKey(challengeId: string): string {
  return `${DRAFT_PREFIX}${challengeId}`;
}

export function saveDraft(challengeId: string, data: DraftData): void {
  try {
    localStorage.setItem(getDraftKey(challengeId), JSON.stringify(data));
  } catch {
    // localStorage full or unavailable -- silently ignore
  }
}

export function loadDraft(challengeId: string): DraftData | null {
  try {
    const raw = localStorage.getItem(getDraftKey(challengeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftData;
    if (!parsed.files || typeof parsed.hintsRevealed !== 'number') return null;
    return parsed;
  } catch {
    // Corrupt data -- remove it and return null
    localStorage.removeItem(getDraftKey(challengeId));
    return null;
  }
}

export function clearDraft(challengeId: string): void {
  localStorage.removeItem(getDraftKey(challengeId));
}

export function clearAllDrafts(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(DRAFT_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}
