// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { Children, isValidElement, ReactNode } from 'react';

type MenuItemProps = {
  label: string;
  onSelect: () => void;
};

function MenuItem(_: MenuItemProps) {
  return null;
}

function Menu({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(
    (child): child is React.ReactElement<MenuItemProps> =>
      isValidElement(child) && child.type === MenuItem,
  );

  return (
    <ul>
      {items.map((item, idx) => (
        <li key={idx}>
          <button onClick={item.props.onSelect}>{item.props.label}</button>
        </li>
      ))}
    </ul>
  );
}

describe('09 Children as Config', () => {
  it('interprets each MenuItem child as a configuration entry', () => {
    const log: string[] = [];
    render(
      <Menu>
        <MenuItem label="Open" onSelect={() => log.push('open')} />
        <MenuItem label="Save" onSelect={() => log.push('save')} />
        <div>ignored non-MenuItem child</div>
      </Menu>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(log).toEqual(['open', 'save']);
    expect(screen.queryByText(/ignored/)).toBeNull();
  });
});
