// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { Component, ReactNode } from 'react';

type Props = { fallback: ReactNode; children: ReactNode };
type State = { hasError: boolean };

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): { hasError: true } {
    return { hasError: true };
  }
  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function Boom(): never {
  throw new Error('boom');
}

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterAll(() => {
  vi.restoreAllMocks();
});

describe('02 ErrorBoundary', () => {
  it('renders children when ok', () => {
    render(
      <ErrorBoundary fallback={<p>fallback</p>}>
        <p>ok</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('ok')).toBeDefined();
  });

  it('renders fallback when child throws', () => {
    render(
      <ErrorBoundary fallback={<p>fallback</p>}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('fallback')).toBeDefined();
  });
});
