'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { Badge } from '@/components/ui/badge';

// Pre-tokenized lines with VS Code dark theme colors
type Token = { text: string; color: string };
type Line = Token[];

const kw = '#c586c0';
const str = '#ce9178';
const varC = '#9cdcfe';
const fn = '#dcdcaa';
const punc = '#d4d4d4';

const lines: Line[] = [
  [
    { text: 'import', color: kw },
    { text: ' ', color: punc },
    { text: 'express', color: varC },
    { text: ' ', color: punc },
    { text: 'from', color: kw },
    { text: " '", color: punc },
    { text: 'express', color: str },
    { text: "';", color: punc },
  ],
  [],
  [
    { text: 'const', color: kw },
    { text: ' ', color: punc },
    { text: 'app', color: varC },
    { text: ' = ', color: punc },
    { text: 'express', color: fn },
    { text: '();', color: punc },
  ],
  [],
  [
    { text: 'app', color: varC },
    { text: '.', color: punc },
    { text: 'get', color: fn },
    { text: "(", color: punc },
    { text: "'/api/hello'", color: str },
    { text: ', (', color: punc },
    { text: 'req', color: varC },
    { text: ', ', color: punc },
    { text: 'res', color: varC },
    { text: ') => {', color: punc },
  ],
  [
    { text: '  ', color: punc },
    { text: 'res', color: varC },
    { text: '.', color: punc },
    { text: 'json', color: fn },
    { text: '({ ', color: punc },
    { text: 'message', color: varC },
    { text: ": '", color: punc },
    { text: 'Hello World', color: str },
    { text: "' });", color: punc },
  ],
  [{ text: '});', color: punc }],
  [],
  [
    { text: 'export', color: kw },
    { text: ' ', color: punc },
    { text: 'default', color: kw },
    { text: ' ', color: punc },
    { text: 'app', color: varC },
    { text: ';', color: punc },
  ],
];

const assertions = [
  'Import the express module',
  'Create an Express application instance',
  'Define a GET route handler',
  'Return a JSON response',
  'Export the app as default',
];

// Flatten all characters across lines for typing index
function getTotalChars(): number {
  let total = 0;
  for (const line of lines) {
    if (line.length === 0) {
      total += 1; // blank line counts as 1
    } else {
      for (const token of line) {
        total += token.text.length;
      }
    }
  }
  return total;
}

const totalChars = getTotalChars();

function renderLines(charIndex: number, showCursor: boolean) {
  let charsSoFar = 0;
  const renderedLines: React.ReactNode[] = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineNum = lineIdx + 1;

    if (line.length === 0) {
      // Blank line
      const isVisible = charsSoFar < charIndex;
      charsSoFar += 1;
      if (!isVisible) break;
      renderedLines.push(
        <div key={lineIdx} className="flex">
          <span className="inline-block w-8 shrink-0 select-none text-right text-[#858585]">
            {lineNum}
          </span>
          <span className="ml-4">&nbsp;</span>
        </div>
      );
      continue;
    }

    const lineContent: React.ReactNode[] = [];
    let lineStarted = false;
    let lineComplete = true;

    for (let tokenIdx = 0; tokenIdx < line.length; tokenIdx++) {
      const token = line[tokenIdx];
      for (let ci = 0; ci < token.text.length; ci++) {
        if (charsSoFar < charIndex) {
          lineStarted = true;
          lineContent.push(
            <span key={`${tokenIdx}-${ci}`} style={{ color: token.color }}>
              {token.text[ci]}
            </span>
          );
          charsSoFar++;
        } else {
          lineComplete = false;
          charsSoFar++;
          break;
        }
      }
      if (!lineComplete) break;
    }

    if (!lineStarted) break;

    // Add cursor at typing position
    const cursorHere = showCursor && !lineComplete;

    renderedLines.push(
      <div key={lineIdx} className="flex">
        <span className="inline-block w-8 shrink-0 select-none text-right text-[#858585]">
          {lineNum}
        </span>
        <span className="ml-4">
          {lineContent}
          {cursorHere && (
            <span className="animate-cursor-blink inline-block h-[1.1em] w-[2px] translate-y-[1px] bg-[#aeafad] align-middle" />
          )}
        </span>
      </div>
    );

    if (!lineComplete) break;
  }

  return renderedLines;
}

export function EditorDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'typing' | 'verifying' | 'done'>('idle');
  const [visibleAssertions, setVisibleAssertions] = useState(0);

  useEffect(() => {
    if (!isInView || phase !== 'idle') return;
    setPhase('typing');
  }, [isInView, phase]);

  // Typing phase
  useEffect(() => {
    if (phase !== 'typing') return;

    let currentChar = 0;
    // Pre-compute blank line positions for pausing
    const blankLineStarts = new Set<number>();
    let running = 0;
    for (const line of lines) {
      if (line.length === 0) {
        blankLineStarts.add(running);
      }
      running += line.length === 0 ? 1 : line.reduce((s, t) => s + t.text.length, 0);
    }

    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      currentChar++;
      setCharIndex(currentChar);

      if (currentChar >= totalChars) {
        setTimeout(() => setPhase('verifying'), 500);
        return;
      }

      const delay = blankLineStarts.has(currentChar) ? 200 : 30;
      timeout = setTimeout(tick, delay);
    }

    timeout = setTimeout(tick, 300); // initial delay
    return () => clearTimeout(timeout);
  }, [phase]);

  // Verification phase
  useEffect(() => {
    if (phase !== 'verifying') return;

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleAssertions(count);
      if (count >= assertions.length) {
        clearInterval(interval);
        setPhase('done');
      }
    }, 150);

    return () => clearInterval(interval);
  }, [phase]);

  const showCursor = phase === 'typing';

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded border border-[#333] bg-[#1e1e1e]"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-[#333] px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-[#858585]">app.js</span>
      </div>

      {/* Code area */}
      <div className="p-4 font-mono text-sm leading-6 text-[#d4d4d4]">
        {renderLines(charIndex, showCursor)}
        {/* Show cursor on empty state */}
        {charIndex === 0 && phase === 'typing' && (
          <div className="flex">
            <span className="inline-block w-8 shrink-0 select-none text-right text-[#858585]">
              1
            </span>
            <span className="ml-4">
              <span className="animate-cursor-blink inline-block h-[1.1em] w-[2px] translate-y-[1px] bg-[#aeafad] align-middle" />
            </span>
          </div>
        )}
      </div>

      {/* Verification results */}
      {visibleAssertions > 0 && (
        <div className="border-t border-[#333] px-4 py-3">
          <div className="flex flex-col gap-1.5">
            {assertions.slice(0, visibleAssertions).map((assertion, i) => (
              <div key={i} className="flex items-center gap-2">
                <Badge variant="pass">pass</Badge>
                <span className="font-mono text-xs text-[#d4d4d4]">{assertion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
