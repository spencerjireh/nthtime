// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import React from 'react';

type ThemeContextValue = { theme: 'light' | 'dark'; toggle: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme outside provider');
  return ctx;
}

function Toggle() {
  const { theme, toggle } = useTheme();
  return (
    <>
      <p>theme: {theme}</p>
      <button onClick={toggle}>flip</button>
    </>
  );
}

describe('01 context value stable', () => {
  it('toggles theme via memoized value', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Toggle />
      </ThemeProvider>,
    );
    expect(screen.getByText('theme: light')).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'flip' }));
    expect(screen.getByText('theme: dark')).toBeDefined();
  });
});
