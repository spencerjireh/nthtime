// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useCallback, useState } from 'react';

type TextInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
};

function TextInput({ value, defaultValue = '', onChange }: TextInputProps) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as string) : internal;

  const handleChange = useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return <input value={current} onChange={(e) => handleChange(e.target.value)} />;
}

describe('04 Controlled / Uncontrolled Input', () => {
  it('uncontrolled seeds from defaultValue and updates itself', () => {
    render(<TextInput defaultValue="hi" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('hi');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');
  });

  it('controlled uses parent state', () => {
    function Host() {
      const [v, setV] = useState('parent');
      return (
        <>
          <TextInput value={v} onChange={setV} />
          <output>{v}</output>
        </>
      );
    }
    render(<Host />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('parent');
    fireEvent.change(input, { target: { value: 'new' } });
    expect(screen.getByText('new')).toBeDefined();
  });
});
