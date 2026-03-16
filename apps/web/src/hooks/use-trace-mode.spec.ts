import { offsetToPosition } from './use-trace-mode';

describe('offsetToPosition', () => {
  it('offset 0 returns (1, 1)', () => {
    expect(offsetToPosition('hello', 0)).toEqual({ lineNumber: 1, column: 1 });
  });

  it('offset within first line', () => {
    expect(offsetToPosition('hello world', 5)).toEqual({ lineNumber: 1, column: 6 });
  });

  it('offset at newline advances to next line', () => {
    // offset 5 is '\n' -> (1,6); offset 6 is 'w' -> (2,1)
    expect(offsetToPosition('hello\nworld', 5)).toEqual({ lineNumber: 1, column: 6 });
    expect(offsetToPosition('hello\nworld', 6)).toEqual({ lineNumber: 2, column: 1 });
  });

  it('offset spanning multiple lines', () => {
    const content = 'aaa\nbbb\nccc';
    // offset 8 = 'aaa\nbbb\n' (8 chars consumed) -> line 3, col 1
    expect(offsetToPosition(content, 8)).toEqual({ lineNumber: 3, column: 1 });
    // offset 10 = 'aaa\nbbb\ncc' -> line 3, col 3
    expect(offsetToPosition(content, 10)).toEqual({ lineNumber: 3, column: 3 });
  });

  it('offset at end of content', () => {
    const content = 'ab\ncd';
    // offset 5 = entire string consumed -> line 2, col 3
    expect(offsetToPosition(content, 5)).toEqual({ lineNumber: 2, column: 3 });
  });

  it('offset beyond content length clamps', () => {
    const content = 'hi';
    // offset 10 should clamp to end of content (offset 2) -> line 1, col 3
    expect(offsetToPosition(content, 10)).toEqual({ lineNumber: 1, column: 3 });
  });

  it('handles empty content', () => {
    expect(offsetToPosition('', 0)).toEqual({ lineNumber: 1, column: 1 });
    expect(offsetToPosition('', 5)).toEqual({ lineNumber: 1, column: 1 });
  });

  it('handles content that is only newlines', () => {
    expect(offsetToPosition('\n\n\n', 2)).toEqual({ lineNumber: 3, column: 1 });
  });

  it('handles trailing newline', () => {
    const content = 'function greet() {\n  return "hi";\n}\n';
    // offset at the very end
    expect(offsetToPosition(content, content.length)).toEqual({ lineNumber: 4, column: 1 });
  });
});
