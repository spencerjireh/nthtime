// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { Component, ReactNode } from 'react';

type Props = { fallback: ReactNode; children: ReactNode };
type State = { hasError: boolean };

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State {
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

describe('10 error boundary fallback', () => {
  it('renders fallback when child throws', () => {
    render(
      <ErrorBoundary fallback={<p>boom-fallback</p>}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('boom-fallback')).toBeDefined();
  });
});
