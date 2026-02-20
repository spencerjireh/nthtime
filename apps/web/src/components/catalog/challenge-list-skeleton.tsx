function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border px-4 py-3">
      <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-12 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}

export function ChallengeListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
