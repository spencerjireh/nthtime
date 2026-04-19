// @vitest-environment jsdom
import { render, screen, RenderOptions } from '@testing-library/react';
import React, { createContext, ReactElement, ReactNode, useContext } from 'react';

const ThemeContext = createContext<'light' | 'dark'>('light');

function ThemeProvider({ value, children }: { value: 'light' | 'dark'; children: ReactNode }) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  return useContext(ThemeContext);
}

function Themed() {
  const theme = useTheme();
  return <p>theme: {theme}</p>;
}

function renderWithTheme(ui: ReactElement, options?: RenderOptions) {
  return render(<ThemeProvider value="dark">{ui}</ThemeProvider>, options);
}

describe('06 context test wrapper', () => {
  it('renders the wrapped theme', () => {
    renderWithTheme(<Themed />);
    expect(screen.getByText('theme: dark')).toBeDefined();
  });
});
