'use client';

import { useEffect, useState } from 'react';

// Returns false during SSR and on the first client render (which must match
// the SSR output exactly), then flips to true in a post-mount effect. Gate
// any localStorage/window-dependent computation on this flag so the
// first client render stays byte-identical to the server HTML.
export function useIsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
