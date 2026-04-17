export function packHref(slug: string, from?: string): string {
  return from ? `/packs/${slug}?from=${encodeURIComponent(from)}` : `/packs/${slug}`;
}

export function challengeHrefBySlug(
  packSlug: string,
  challengeSlug: string,
  view?: 'details' | 'editor' | 'solution',
): string {
  if (view === 'solution') return solutionHrefBySlug(packSlug, challengeSlug);
  const path = `/packs/${packSlug}/challenges/${challengeSlug}`;
  // Default to details view — clicking a challenge row shows the prompt
  // first; the "Start Challenge" button opens the editor.
  return view === 'editor' ? path : `${path}?view=details`;
}

export function solutionHrefBySlug(packSlug: string, challengeSlug: string): string {
  return `/packs/${packSlug}/challenges/${challengeSlug}/solution`;
}

// --- Author routes ---

export function authorPacksHref(): string {
  return '/author/packs';
}

export function authorPackHref(slug: string): string {
  return `/author/packs/${slug}`;
}

export function authorChallengeEditHref(packSlug: string, challengeSlug: string): string {
  return `/author/packs/${packSlug}/challenges/${challengeSlug}`;
}

export function authorChallengeNewHref(packSlug: string): string {
  return `/author/packs/${packSlug}/challenges/new`;
}

export function authorPreviewHref(packSlug: string, challengeSlug: string): string {
  return `/author/packs/${packSlug}/preview/${challengeSlug}`;
}
