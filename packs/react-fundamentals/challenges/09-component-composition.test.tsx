// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Inline reference solution (from 09-component-composition.json)
function Button({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return <button onClick={onClick}>{children}</button>;
}

function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function App() {
  return (
    <Card title="Welcome">
      <p>Click the button below.</p>
      <Button onClick={() => console.log('clicked')}>Click me</Button>
    </Card>
  );
}

describe('09 Component Composition', () => {
  it('renders Card with title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Welcome');
  });

  it('renders paragraph content inside Card', () => {
    render(<App />);
    expect(screen.getByText('Click the button below.')).toBeDefined();
  });

  it('renders Button inside Card', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /click me/i })).toBeDefined();
  });

  it('Button onClick fires', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<App />);
    fireEvent.click(screen.getByRole('button'));
    expect(spy).toHaveBeenCalledWith('clicked');
    spy.mockRestore();
  });
});
