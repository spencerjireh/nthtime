// @vitest-environment jsdom
import { render, screen, act } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

function Probe() {
  const narrow = useMediaQuery('(max-width: 600px)');
  return <p>narrow: {String(narrow)}</p>;
}

describe('07 useMediaQuery', () => {
  let listeners: Array<(e: MediaQueryListEvent) => void> = [];
  let currentMatches = false;

  beforeEach(() => {
    listeners = [];
    currentMatches = false;
    (window as unknown as { matchMedia: unknown }).matchMedia = (query: string) => {
      return {
        matches: currentMatches,
        media: query,
        onchange: null,
        addEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => listeners.push(l),
        removeEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => {
          listeners = listeners.filter((x) => x !== l);
        },
        dispatchEvent: () => false,
        addListener: () => {},
        removeListener: () => {},
      };
    };
  });

  it('reflects the matchMedia value', () => {
    render(<Probe />);
    expect(screen.getByText('narrow: false')).toBeDefined();
    act(() => {
      currentMatches = true;
      listeners.forEach((l) =>
        l({ matches: true, media: '(max-width: 600px)' } as MediaQueryListEvent),
      );
    });
    expect(screen.getByText('narrow: true')).toBeDefined();
  });
});
