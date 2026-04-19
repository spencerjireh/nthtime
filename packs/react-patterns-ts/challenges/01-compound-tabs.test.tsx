// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type TabsContextValue = {
  active: string;
  setActive: (id: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs subparts must be used inside <Tabs>');
  return ctx;
}

function Tabs({ defaultActive, children }: { defaultActive: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultActive);
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;
}

function TabList({ children }: { children: ReactNode }) {
  return <div role="tablist">{children}</div>;
}

function TabTrigger({ id, children }: { id: string; children: ReactNode }) {
  const { active, setActive } = useTabsContext();
  return (
    <button role="tab" aria-selected={active === id} onClick={() => setActive(id)}>
      {children}
    </button>
  );
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { active } = useTabsContext();
  if (active !== id) return null;
  return <div role="tabpanel">{children}</div>;
}

describe('01 Compound Tabs', () => {
  it('renders the default active panel', () => {
    render(
      <Tabs defaultActive="a">
        <TabList>
          <TabTrigger id="a">A</TabTrigger>
          <TabTrigger id="b">B</TabTrigger>
        </TabList>
        <TabPanel id="a">A content</TabPanel>
        <TabPanel id="b">B content</TabPanel>
      </Tabs>,
    );
    expect(screen.getByText('A content')).toBeDefined();
    expect(screen.queryByText('B content')).toBeNull();
  });

  it('switches to the clicked tab', () => {
    render(
      <Tabs defaultActive="a">
        <TabList>
          <TabTrigger id="a">A</TabTrigger>
          <TabTrigger id="b">B</TabTrigger>
        </TabList>
        <TabPanel id="a">A content</TabPanel>
        <TabPanel id="b">B content</TabPanel>
      </Tabs>,
    );
    fireEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(screen.getByText('B content')).toBeDefined();
    expect(screen.queryByText('A content')).toBeNull();
  });
});
