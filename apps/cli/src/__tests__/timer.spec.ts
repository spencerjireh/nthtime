import { formatElapsed } from '../utils/timer.js';

describe('formatElapsed', () => {
  it('formats 0 seconds as 0:00', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    expect(formatElapsed(now)).toBe('0:00');
  });

  it('formats 65 seconds as 1:05', () => {
    const start = 1000;
    vi.spyOn(Date, 'now').mockReturnValue(start + 65_000);
    expect(formatElapsed(start)).toBe('1:05');
  });

  it('formats 5 seconds with zero-padded seconds', () => {
    const start = 1000;
    vi.spyOn(Date, 'now').mockReturnValue(start + 5_000);
    expect(formatElapsed(start)).toBe('0:05');
  });

  it('formats 600 seconds as 10:00', () => {
    const start = 1000;
    vi.spyOn(Date, 'now').mockReturnValue(start + 600_000);
    expect(formatElapsed(start)).toBe('10:00');
  });

  it('handles large values', () => {
    const start = 1000;
    vi.spyOn(Date, 'now').mockReturnValue(start + 3661_000);
    expect(formatElapsed(start)).toBe('61:01');
  });
});
