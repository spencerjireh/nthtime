export function challengeHref(
  id: string,
  packSlug?: string,
  view?: 'details' | 'editor' | 'solution',
): string {
  if (view === 'solution') return solutionHref(id, packSlug);
  const params = new URLSearchParams();
  if (view !== 'editor') params.set('view', 'details');
  if (packSlug) params.set('pack', packSlug);
  const qs = params.toString();
  return `/challenge/${id}${qs ? `?${qs}` : ''}`;
}

export function solutionHref(id: string, packSlug?: string): string {
  const params = new URLSearchParams();
  if (packSlug) params.set('pack', packSlug);
  const qs = params.toString();
  return `/challenge/${id}/solution${qs ? `?${qs}` : ''}`;
}
