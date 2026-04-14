'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'nthtime:recently-visited';
const MAX_ENTRIES = 5;

export interface RecentEntry {
  kind: 'pack' | 'track' | 'challenge';
  label: string;
  href: string;
  visitedAt: number;
}

function read(): RecentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is RecentEntry =>
        e &&
        typeof e === 'object' &&
        typeof e.label === 'string' &&
        typeof e.href === 'string' &&
        typeof e.visitedAt === 'number' &&
        (e.kind === 'pack' || e.kind === 'track' || e.kind === 'challenge'),
    );
  } catch {
    return [];
  }
}

function write(entries: RecentEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore quota / disabled storage
  }
}

export function useRecentlyVisited() {
  const [entries, setEntries] = useState<RecentEntry[]>([]);

  useEffect(() => {
    setEntries(read());
  }, []);

  const record = useCallback(
    (entry: Omit<RecentEntry, 'visitedAt'>) => {
      const now = Date.now();
      setEntries((prev) => {
        const filtered = prev.filter((e) => e.href !== entry.href);
        const next = [{ ...entry, visitedAt: now }, ...filtered].slice(
          0,
          MAX_ENTRIES,
        );
        write(next);
        return next;
      });
    },
    [],
  );

  const clear = useCallback(() => {
    write([]);
    setEntries([]);
  }, []);

  return { entries, record, clear };
}
