import { ChallengeListSkeleton } from '@/components/catalog/challenge-list-skeleton';

export default function PackLoading() {
  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-9 py-10">
      <div>
        <div className="-ml-2 mb-2 h-7 w-16 animate-pulse rounded bg-muted" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
      </div>
      <ChallengeListSkeleton />
    </div>
  );
}
