// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { memo, useCallback, useState } from 'react';

let itemRenderCount = 0;
const ItemButton = memo(function ItemButton({
  id,
  onPick,
}: {
  id: number;
  onPick: (id: number) => void;
}) {
  itemRenderCount++;
  return <button onClick={() => onPick(id)}>item {id}</button>;
});

function Picker({ onPicked }: { onPicked: (id: number) => void }) {
  const [tick, setTick] = useState<number>(0);
  const handlePick = useCallback((id: number) => onPicked(id), [onPicked]);

  return (
    <div>
      <button onClick={() => setTick((t) => t + 1)}>tick={tick}</button>
      <ItemButton id={1} onPick={handlePick} />
      <ItemButton id={2} onPick={handlePick} />
      <ItemButton id={3} onPick={handlePick} />
    </div>
  );
}

describe('04 useCallback stable identity', () => {
  beforeEach(() => {
    itemRenderCount = 0;
  });

  it('memoized children skip re-renders across parent state ticks', () => {
    const onPicked = () => {};
    render(<Picker onPicked={onPicked} />);
    expect(itemRenderCount).toBe(3);

    fireEvent.click(screen.getByRole('button', { name: /tick=0/ }));
    fireEvent.click(screen.getByRole('button', { name: /tick=1/ }));
    expect(itemRenderCount).toBe(3);
  });
});
