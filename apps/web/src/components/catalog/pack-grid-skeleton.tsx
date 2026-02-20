import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

function SkeletonCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-12 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
          <div className="h-5 w-10 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-14 animate-pulse rounded-md bg-muted" />
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
      </CardFooter>
    </Card>
  );
}

export function PackGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
