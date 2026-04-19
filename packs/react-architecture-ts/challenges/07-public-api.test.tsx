// @vitest-environment jsdom

function applyTax(subtotal: number, rate: number): number {
  return subtotal * (1 + rate);
}

function totalWithTax(items: number[], rate: number): number {
  return applyTax(items.reduce((a, b) => a + b, 0), rate);
}

describe('07 public API', () => {
  it('totalWithTax sums and applies tax', () => {
    expect(totalWithTax([10, 20, 30], 0.1)).toBeCloseTo(66);
  });

  it('rate of 0 is identity', () => {
    expect(totalWithTax([1, 2, 3], 0)).toBe(6);
  });
});
