// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { ComponentType, ReactNode } from 'react';

function compose(providers: ComponentType<{ children: ReactNode }>[]) {
  return ({ children }: { children: ReactNode }) =>
    providers.reduceRight((acc, P) => <P>{acc}</P>, children as ReactNode);
}

function ThemeProvider({ children }: { children: ReactNode }) {
  return <div data-theme="dark">{children}</div>;
}

function I18nProvider({ children }: { children: ReactNode }) {
  return <div lang="en">{children}</div>;
}

const AppProviders = compose([ThemeProvider, I18nProvider]);

describe('08 provider composition', () => {
  it('renders children inside both providers', () => {
    render(
      <AppProviders>
        <p>kids</p>
      </AppProviders>,
    );
    const kids = screen.getByText('kids');
    expect(kids).toBeDefined();
    const i18n = kids.closest('[lang="en"]');
    expect(i18n).not.toBeNull();
    const theme = i18n?.parentElement?.closest('[data-theme="dark"]');
    expect(theme).not.toBeNull();
  });
});
