// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { memo, useState } from 'react';

type RowProps = { label: string; onClick: () => void };

let renderCount = 0;
const Row = memo(function Row({ label, onClick }: RowProps) {
  renderCount++;
  return <button onClick={onClick}>{label}</button>;
});

function Parent({ onClick }: { onClick: () => void }) {
  const [tick, setTick] = useState<number>(0);
  return (
    <div>
      <button onClick={() => setTick((t) => t + 1)}>tick={tick}</button>
      <Row label="item" onClick={onClick} />
    </div>
  );
}

describe('02 React.memo leaf', () => {
  beforeEach(() => {
    renderCount = 0;
  });

  it('skips re-renders when row props are unchanged', () => {
    const stableHandler = () => {};
    render(<Parent onClick={stableHandler} />);
    expect(renderCount).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: /tick=0/ }));
    fireEvent.click(screen.getByRole('button', { name: /tick=1/ }));
    expect(renderCount).toBe(1);
  });
});
