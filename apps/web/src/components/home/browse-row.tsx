import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface BrowseTile {
  label: string;
  href: string;
  hint: string;
}

const TILES: readonly BrowseTile[] = [
  { label: 'Catalog', href: '/catalog', hint: 'Every pack, grouped' },
  { label: 'Tracks', href: '/tracks', hint: 'Curated learning paths' },
  { label: 'Random', href: '/random', hint: 'Dealer’s choice' },
];

export function BrowseRow() {
  return (
    <section className="space-y-4">
      <p className="eyebrow">Browse</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group/tile flex items-center justify-between rounded-lg border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <div>
              <p className="font-mono text-sm font-medium uppercase tracking-wider text-foreground">
                {tile.label}
              </p>
              <p className="mt-1 font-sans text-xs text-muted-foreground">{tile.hint}</p>
            </div>
            <ArrowRight
              className="h-4 w-4 text-muted-foreground transition-all group-hover/tile:translate-x-0.5 group-hover/tile:text-primary"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
