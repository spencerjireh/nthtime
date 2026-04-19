// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { useCallback, useState } from 'react';

function useToggle(initial: boolean = false): [boolean, () => void] {
  const [on, setOn] = useState<boolean>(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return [on, toggle];
}

describe('08 renderHook for useToggle', () => {
  it('flips state via the toggle setter', () => {
    const { result } = renderHook(() => useToggle(false));
    expect(result.current[0]).toBe(false);
    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);
  });
});
