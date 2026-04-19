// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, ChangeEvent } from 'react';

type Theme = 'light' | 'dark' | 'system';

function Preferences() {
  const [theme, setTheme] = useState<Theme>('system');
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const onThemeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as Theme);
  };

  const onSubscribedChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSubscribed(e.target.checked);
  };

  return (
    <div>
      <select value={theme} onChange={onThemeChange}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      <label>
        <input type="checkbox" checked={subscribed} onChange={onSubscribedChange} />
        Subscribe to newsletter
      </label>
      <p>{`theme=${theme}, subscribed=${subscribed}`}</p>
    </div>
  );
}

describe('02 Controlled Select + Checkbox', () => {
  it('renders defaults', () => {
    render(<Preferences />);
    expect(screen.getByText('theme=system, subscribed=false')).toBeDefined();
  });

  it('updates on select change', () => {
    render(<Preferences />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'dark' } });
    expect(screen.getByText('theme=dark, subscribed=false')).toBeDefined();
  });

  it('toggles checkbox', () => {
    render(<Preferences />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(screen.getByText('theme=system, subscribed=true')).toBeDefined();
  });
});
