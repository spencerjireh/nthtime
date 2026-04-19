// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, ChangeEvent, FocusEvent } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EmailField() {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (error) setError(null);
  };

  const onBlur = (_e: FocusEvent<HTMLInputElement>) => {
    setError(EMAIL_RE.test(value) ? null : 'Invalid email');
  };

  return (
    <div>
      <input type="email" value={value} onChange={onChange} onBlur={onBlur} />
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}

describe('04 Per-Field Validation', () => {
  it('shows error after blur on invalid value', () => {
    render(<EmailField />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'nope' } });
    fireEvent.blur(input);
    expect(screen.getByRole('alert').textContent).toBe('Invalid email');
  });

  it('clears the error on next keystroke', () => {
    render(<EmailField />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'nope' } });
    fireEvent.blur(input);
    expect(screen.queryByRole('alert')).not.toBeNull();
    fireEvent.change(input, { target: { value: 'n' } });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('accepts a valid email on blur', () => {
    render(<EmailField />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'a@b.io' } });
    fireEvent.blur(input);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
