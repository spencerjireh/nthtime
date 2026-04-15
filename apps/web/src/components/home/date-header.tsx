'use client';

import { useEffect, useState } from 'react';

/**
 * Local-time date strip. Deliberately local (not UTC): it's a social marker
 * at the top of the dashboard, not a streak boundary. Streak math still runs
 * in UTC server-side.
 */
export function DateHeader() {
  // Render an empty string on the first paint to avoid hydration mismatch
  // (server has no TZ context; client renders the local weekday/date after
  // mount).
  const [label, setLabel] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(now);
    const month = new Intl.DateTimeFormat(undefined, { month: 'long' }).format(now);
    const day = now.getDate();
    setLabel(`${weekday} · ${month} ${day}`.toUpperCase());
  }, []);

  return (
    <section className="space-y-3">
      <p className="eyebrow">Today</p>
      <p
        className="font-mono text-lg font-medium uppercase tracking-[0.2em] text-foreground sm:text-xl"
        suppressHydrationWarning
      >
        {label || '\u00A0'}
      </p>
    </section>
  );
}
