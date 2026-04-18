// @vitest-environment jsdom
import { render, screen, act } from '@testing-library/react';
import React, { useSyncExternalStore } from 'react';

function useWindowWidth(): number {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('resize', onStoreChange);
      return () => window.removeEventListener('resize', onStoreChange);
    },
    () => window.innerWidth,
    () => 0,
  );
}

function WindowWidth() {
  const width = useWindowWidth();
  return <p>width: {width}</p>;
}

describe('09 useSyncExternalStore', () => {
  it('reads window.innerWidth and re-reads on resize', () => {
    (window as unknown as { innerWidth: number }).innerWidth = 1024;
    render(<WindowWidth />);
    expect(screen.getByText('width: 1024')).toBeDefined();

    act(() => {
      (window as unknown as { innerWidth: number }).innerWidth = 640;
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByText('width: 640')).toBeDefined();
  });
});
