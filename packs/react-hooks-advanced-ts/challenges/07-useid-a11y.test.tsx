// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { useId, useState } from 'react';

type LabeledInputProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
};

function LabeledInput({ label, value, onChange }: LabeledInputProps) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </>
  );
}

function Host() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  return (
    <>
      <LabeledInput label="first" value={a} onChange={setA} />
      <LabeledInput label="second" value={b} onChange={setB} />
    </>
  );
}

describe('07 useId', () => {
  it('each label is wired to its own input', () => {
    render(<Host />);
    const firstLabel = screen.getByText('first') as HTMLLabelElement;
    const secondLabel = screen.getByText('second') as HTMLLabelElement;
    expect(firstLabel.htmlFor).toBeTruthy();
    expect(secondLabel.htmlFor).toBeTruthy();
    expect(firstLabel.htmlFor).not.toEqual(secondLabel.htmlFor);
  });
});
