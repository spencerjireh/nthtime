interface ContextStripProps {
  trackCount: number;
  packCount: number;
  challengeCount: number;
}

export function ContextStrip({
  trackCount,
  packCount,
  challengeCount,
}: ContextStripProps) {
  return (
    <section className="mb-10">
      <p className="eyebrow">Practice</p>
      <h1 className="mt-3 font-sans text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        Pick a pack. Write code. Pass the tests. Repeat.
      </h1>
      <p className="mt-4 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {trackCount} Tracks
        <span aria-hidden className="mx-2 text-border">&middot;</span>
        {packCount} Packs
        <span aria-hidden className="mx-2 text-border">&middot;</span>
        {challengeCount} Challenges
      </p>
    </section>
  );
}
