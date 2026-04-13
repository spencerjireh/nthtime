import { PackGridSkeleton } from '@/components/catalog/pack-grid-skeleton';

export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-9 py-10">
      <div>
        <p className="eyebrow">Practice</p>
        <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-foreground">
          Challenge Packs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a pack, work through the challenges, and build real skills.
        </p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-36 w-80 shrink-0 animate-pulse rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
      <PackGridSkeleton />
    </div>
  );
}
