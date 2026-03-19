// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';

// Inline reference solution
interface CustomInputHandle {
  focus(): void;
  clear(): void;
  selectAll(): void;
}

const CustomInput = forwardRef<CustomInputHandle, object>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => setValue(''),
    selectAll: () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    },
  }));

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Custom input"
    />
  );
});

CustomInput.displayName = 'CustomInput';

function SearchBar() {
  const ref = useRef<CustomInputHandle>(null);

  return (
    <div>
      <CustomInput ref={ref} />
      <button onClick={() => ref.current?.focus()}>Focus</button>
      <button onClick={() => ref.current?.clear()}>Clear</button>
      <button onClick={() => ref.current?.selectAll()}>Select All</button>
    </div>
  );
}

function MeasuredBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      setSize({ width: Math.round(width), height: Math.round(height) });
    }
  }, []);

  return (
    <div>
      <div ref={ref} style={{ padding: 20, border: '1px solid black' }}>
        Measure me
      </div>
      <p>
        Width: {size.width}, Height: {size.height}
      </p>
    </div>
  );
}

function FocusGroup() {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const count = 3;

  function focusNext() {
    const next = (current + 1) % count;
    refs.current[next]?.focus();
    setCurrent(next);
  }

  return (
    <div>
      {Array.from({ length: count }, (_, i) => (
        <input key={i} ref={(el) => (refs.current[i] = el)} placeholder={`Input ${i + 1}`} />
      ))}
      <button onClick={focusNext}>Focus Next</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <SearchBar />
      <MeasuredBox />
      <FocusGroup />
    </div>
  );
}

describe('10 Ref and Imperative Handle', () => {
  it('renders SearchBar with custom input and buttons', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('Custom input')).toBeDefined();
    expect(screen.getByRole('button', { name: /focus$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /clear/i })).toBeDefined();
  });

  it('clear button empties the custom input', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Custom input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(input.value).toBe('');
  });

  it('renders MeasuredBox with dimension display', () => {
    render(<MeasuredBox />);
    expect(screen.getByText('Measure me')).toBeDefined();
    expect(screen.getByText(/Width:/)).toBeDefined();
  });

  it('renders FocusGroup with multiple inputs', () => {
    render(<FocusGroup />);
    expect(screen.getByPlaceholderText('Input 1')).toBeDefined();
    expect(screen.getByPlaceholderText('Input 2')).toBeDefined();
    expect(screen.getByPlaceholderText('Input 3')).toBeDefined();
  });

  it('focus next button cycles through inputs', () => {
    render(<FocusGroup />);
    const btn = screen.getByRole('button', { name: /focus next/i });
    fireEvent.click(btn);
    expect(document.activeElement).toBe(screen.getByPlaceholderText('Input 2'));
  });
});
