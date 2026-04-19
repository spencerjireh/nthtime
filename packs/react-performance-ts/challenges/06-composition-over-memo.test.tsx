// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, ChangeEvent, ReactNode } from 'react';

let slowRenders = 0;
function Slow({ label }: { label: string }) {
  slowRenders++;
  return <p>{label}</p>;
}

function Shell({ children }: { children: ReactNode }) {
  const [text, setText] = useState<string>('');
  return (
    <div>
      <input
        value={text}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
      />
      <div>{children}</div>
    </div>
  );
}

function App() {
  return (
    <Shell>
      <Slow label="heavy" />
    </Shell>
  );
}

describe('06 Composition over memo', () => {
  beforeEach(() => {
    slowRenders = 0;
  });

  it('Slow stays at one render across Shell input changes', () => {
    render(<App />);
    expect(slowRenders).toBe(1);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
    expect(slowRenders).toBe(1);
  });
});
