// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { createContext, useContext, useState } from 'react';

// Inline reference solution
interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return <button onClick={toggleTheme}>Current theme: {theme}</button>;
}

function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe('07 Context and Composition', () => {
  it('renders with light theme by default', () => {
    render(<App />);
    expect(screen.getByText('Current theme: light')).toBeDefined();
  });

  it('toggles to dark theme on click', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Current theme: dark')).toBeDefined();
  });

  it('toggles back to light on second click', () => {
    render(<App />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByText('Current theme: light')).toBeDefined();
  });
});
