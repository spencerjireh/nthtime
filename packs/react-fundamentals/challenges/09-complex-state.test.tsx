// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useReducer } from 'react';

// Inline reference solution
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

type CartAction =
  | { type: 'add'; item: { id: number; name: string; price: number } }
  | { type: 'remove'; id: number }
  | { type: 'updateQuantity'; id: number; quantity: number }
  | { type: 'clear' };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = state.find((item) => item.id === action.item.id);
      if (existing) {
        return state.map((item) =>
          item.id === action.item.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...state, { ...action.item, quantity: 1 }];
    }
    case 'remove':
      return state.filter((item) => item.id !== action.id);
    case 'updateQuantity':
      return state.map((item) =>
        item.id === action.id ? { ...item, quantity: action.quantity } : item,
      );
    case 'clear':
      return [];
    default:
      return state;
  }
}

function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function CartDisplay({
  items,
  onRemove,
}: {
  items: CartItem[];
  onRemove: (id: number) => void;
}) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.name} x{item.quantity}
          <button onClick={() => onRemove(item.id)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}

function App() {
  const [items, dispatch] = useReducer(cartReducer, []);

  return (
    <div>
      <p>Items: {getItemCount(items)}</p>
      <p>Total: ${getCartTotal(items).toFixed(2)}</p>
      <button
        onClick={() =>
          dispatch({ type: 'add', item: { id: 1, name: 'Widget', price: 9.99 } })
        }
      >
        Add Widget
      </button>
      <button onClick={() => dispatch({ type: 'clear' })}>Clear</button>
      <CartDisplay items={items} onRemove={(id) => dispatch({ type: 'remove', id })} />
    </div>
  );
}

describe('09 Complex State with useReducer', () => {
  it('starts with empty cart', () => {
    render(<App />);
    expect(screen.getByText('Items: 0')).toBeDefined();
    expect(screen.getByText('Total: $0.00')).toBeDefined();
  });

  it('adds an item to the cart', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /add widget/i }));
    expect(screen.getByText('Items: 1')).toBeDefined();
    expect(screen.getByText('Total: $9.99')).toBeDefined();
    expect(screen.getByText(/Widget x1/)).toBeDefined();
  });

  it('increments quantity when adding same item twice', () => {
    render(<App />);
    const addBtn = screen.getByRole('button', { name: /add widget/i });
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    expect(screen.getByText('Items: 2')).toBeDefined();
    expect(screen.getByText('Total: $19.98')).toBeDefined();
    expect(screen.getByText(/Widget x2/)).toBeDefined();
  });

  it('removes an item from the cart', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /add widget/i }));
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(screen.getByText('Items: 0')).toBeDefined();
  });

  it('clears the cart', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /add widget/i }));
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(screen.getByText('Items: 0')).toBeDefined();
    expect(screen.getByText('Total: $0.00')).toBeDefined();
  });
});
