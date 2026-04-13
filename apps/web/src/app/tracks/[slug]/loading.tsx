import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

function SkeletonPackCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
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

export default function TrackLoading() {
  return (
    <div className="mx-auto max-w-screen-2xl space-y-8 px-9 py-10">
      <div>
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-8 w-96 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonPackCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
