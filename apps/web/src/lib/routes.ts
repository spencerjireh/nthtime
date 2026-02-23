export function challengeHref(
  id: string,
  packSlug?: string,
  view?: 'details',
): string {
  const params = new URLSearchParams();
  if (view) params.set('view', view);
  if (packSlug) params.set('pack', packSlug);
  const qs = params.toString();
  return `/challenge/${id}${qs ? `?${qs}` : ''}`;
}
