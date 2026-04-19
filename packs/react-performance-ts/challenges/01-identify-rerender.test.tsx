// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { Profiler, useState, ProfilerOnRenderCallback } from 'react';

type RenderLog = {
  id: string;
  phase: 'mount' | 'update' | 'nested-update';
  actualDuration: number;
};

function MeasuredCounter({ onRender }: { onRender: (log: RenderLog) => void }) {
  const [count, setCount] = useState<number>(0);

  const handleRender: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
    onRender({ id, phase, actualDuration });
  };

  return (
    <Profiler id="counter" onRender={handleRender}>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
    </Profiler>
  );
}

describe('01 Profile Re-renders', () => {
  it('logs one mount + one update per click', () => {
    const onRender = vi.fn();
    render(<MeasuredCounter onRender={onRender} />);
    expect(onRender).toHaveBeenCalledTimes(1);
    expect(onRender.mock.calls[0][0].phase).toBe('mount');

    fireEvent.click(screen.getByRole('button'));
    expect(onRender).toHaveBeenCalledTimes(2);
    expect(onRender.mock.calls[1][0].phase).toBe('update');
  });
});
