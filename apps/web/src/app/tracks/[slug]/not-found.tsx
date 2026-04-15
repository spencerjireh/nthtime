import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TrackNotFound() {
  return (
    <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-center px-9 py-16 text-center">
      <h2 className="font-sans text-lg font-semibold text-foreground">
        Track not found
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        That track does not exist or has been removed.
      </p>
      <Button variant="ghost" className="mt-4" asChild>
        <Link href="/catalog">Back to catalog</Link>
      </Button>
    </div>
  );
}
