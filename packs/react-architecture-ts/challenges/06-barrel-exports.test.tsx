// @vitest-environment jsdom

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatUSD(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

describe('06 barrel exports', () => {
  it('formats a date', () => {
    expect(formatDate(new Date('2026-04-19T00:00:00Z'))).toBe('2026-04-19');
  });

  it('formats USD', () => {
    expect(formatUSD(1234.5)).toBe('$1,234.50');
  });
});
