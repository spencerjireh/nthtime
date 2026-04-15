'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TerminalBootProps {
  onComplete: () => void;
}

interface BootLine {
  prefix: string;
  text: string;
}

const LINES: readonly BootLine[] = [
  { prefix: '$', text: 'nthtime init' },
  { prefix: '›', text: 'initializing runtime...' },
  { prefix: '›', text: "loading today's challenge..." },
  { prefix: '›', text: 'ready.' },
];

// Type speed: ~40ms per char with a tiny jitter to avoid mechanical feel.
const BASE_DELAY = 32;
const JITTER = 12;

/**
 * First-visit boot overlay. Types three lines in a monospace terminal pane,
 * then fades out. Any keypress skips. The `nthtime:seen-boot` localStorage
 * flag gates re-showing (see `HomeDashboard` for the mount condition).
 */
export function TerminalBoot({ onComplete }: TerminalBootProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const skippedRef = useRef(false);

  const allText = useMemo(() => LINES.map((l) => l.text), []);

  useEffect(() => {
    if (skippedRef.current) return;
    if (lineIndex >= LINES.length) {
      const timer = setTimeout(() => setFading(true), 420);
      return () => clearTimeout(timer);
    }
    if (charIndex < allText[lineIndex].length) {
      const delay = BASE_DELAY + Math.random() * JITTER;
      const timer = setTimeout(() => setCharIndex((c) => c + 1), delay);
      return () => clearTimeout(timer);
    }
    // End of this line — pause briefly, then advance.
    const pause = setTimeout(() => {
      setLineIndex((i) => i + 1);
      setCharIndex(0);
    }, 120);
    return () => clearTimeout(pause);
  }, [lineIndex, charIndex, allText]);

  useEffect(() => {
    function onKey() {
      if (skippedRef.current) return;
      skippedRef.current = true;
      setFading(true);
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!fading) return;
    const finish = setTimeout(() => {
      try {
        localStorage.setItem('nthtime:seen-boot', '1');
      } catch {
        // swallow; best-effort only
      }
      onComplete();
    }, 260);
    return () => clearTimeout(finish);
  }, [fading, onComplete]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] flex items-center justify-center bg-background transition-opacity duration-300',
        fading ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-xl rounded-lg border border-border bg-card p-8 font-mono text-sm shadow-none">
        <div className="mb-6 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            spencer@nthtime
          </span>
        </div>

        <div className="space-y-2 text-foreground">
          {LINES.map((line, i) => {
            const shownChars = i < lineIndex ? line.text.length : i === lineIndex ? charIndex : 0;
            const isActive = i === lineIndex && !fading;
            const visible = line.text.slice(0, shownChars);
            if (i > lineIndex && !fading) return null;
            return (
              <p key={i} className="flex items-center gap-2 leading-relaxed">
                <span className="text-muted-foreground">{line.prefix}</span>
                <span>{visible}</span>
                {isActive && <BlinkingCursor />}
              </p>
            );
          })}
        </div>

        <p className="mt-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Press any key to skip
        </p>
      </div>
    </div>
  );
}

function BlinkingCursor() {
  return (
    <span
      aria-hidden
      className="inline-block h-[1em] w-[0.55em] -translate-y-[1px] animate-cursor-blink bg-primary"
    />
  );
}
