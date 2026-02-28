// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';

// Inline reference solution (from 07-custom-hook.json)
// Mock localStorage
const storage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, value: string) => {
    storage[key] = value;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    for (const key of Object.keys(storage)) delete storage[key];
  },
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

function useLocalStorage(key: string, initialValue: string) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ?? initialValue;
  });

  const setStoredValue = (newValue: string) => {
    setValue(newValue);
    localStorage.setItem(key, newValue);
  };

  return [value, setStoredValue] as const;
}

function App() {
  const [name, setName] = useLocalStorage('name', '');

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <p>Stored: {name}</p>
    </div>
  );
}

describe('07 Custom Hook (useLocalStorage)', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('renders input element', () => {
    render(<App />);
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('input updates and persists to localStorage', () => {
    render(<App />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(input.value).toBe('Alice');
    expect(storage['name']).toBe('Alice');
  });

  it('displays stored value in paragraph', () => {
    render(<App />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Bob' } });
    expect(screen.getByText('Stored: Bob')).toBeDefined();
  });
});
