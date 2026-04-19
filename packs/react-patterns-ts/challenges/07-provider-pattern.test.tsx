// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
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
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

function ThemeButton() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>theme: {theme}</button>;
}

describe('07 Provider Pattern', () => {
  it('reads and toggles the theme', () => {
    render(
      <ThemeProvider>
        <ThemeButton />
      </ThemeProvider>,
    );
    expect(screen.getByRole('button', { name: 'theme: light' })).toBeDefined();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: 'theme: dark' })).toBeDefined();
  });

  it('throws outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThemeButton />)).toThrow(/ThemeProvider/);
    spy.mockRestore();
  });
});
