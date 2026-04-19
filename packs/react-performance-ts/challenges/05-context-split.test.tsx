// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from 'react';

const CountStateContext = createContext<number>(0);
const CountDispatchContext = createContext<Dispatch<SetStateAction<number>>>(() => {});

function CountProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState<number>(0);
  return (
    <CountStateContext.Provider value={count}>
      <CountDispatchContext.Provider value={setCount}>
        {children}
      </CountDispatchContext.Provider>
    </CountStateContext.Provider>
  );
}

function useCountDispatch() {
  return useContext(CountDispatchContext);
}

let buttonRenders = 0;
function IncrementButton() {
  buttonRenders++;
  const setCount = useCountDispatch();
  return <button onClick={() => setCount((c) => c + 1)}>+1</button>;
}

function Display() {
  const c = useContext(CountStateContext);
  return <p>count: {c}</p>;
}

describe('05 Split Context', () => {
  beforeEach(() => {
    buttonRenders = 0;
  });

  it('dispatch-only consumer skips re-renders when state changes', () => {
    render(
      <CountProvider>
        <Display />
        <IncrementButton />
      </CountProvider>,
    );
    expect(buttonRenders).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: '+1' }));
    fireEvent.click(screen.getByRole('button', { name: '+1' }));
    expect(screen.getByText('count: 2')).toBeDefined();
    expect(buttonRenders).toBe(1);
  });
});
