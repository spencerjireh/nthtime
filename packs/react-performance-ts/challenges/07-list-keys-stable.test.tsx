// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, ChangeEvent } from 'react';

type Item = { id: string; label: string };

function EditableList({ items: initial }: { items: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);

  const updateLabel = (id: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, label: next } : i)));
  };

  return (
    <div>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <input value={i.label} onChange={updateLabel(i.id)} />
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setItems((prev) => [...prev].reverse())}>
        Reverse
      </button>
    </div>
  );
}

describe('07 Stable Keys', () => {
  it('reverses without losing edits', () => {
    render(
      <EditableList
        items={[
          { id: 'a', label: 'apple' },
          { id: 'b', label: 'banana' },
          { id: 'c', label: 'cherry' },
        ]}
      />,
    );

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: 'avocado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reverse' }));

    const after = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(after.map((i) => i.value)).toEqual(['cherry', 'banana', 'avocado']);
  });
});
