'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChallengeList } from './challenge-list';
import { useChallenges } from '@/hooks/use-packs';
import { ArrowLeft } from 'lucide-react';

interface PackPageProps {
  slug: string;
}

export function PackPage({ slug }: PackPageProps) {
  const { pack, challenges, isLoading } = useChallenges(slug);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-screen-2xl items-center justify-center px-9 py-16 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-center px-9 py-16 text-center">
        <h2 className="font-sans text-lg font-semibold text-foreground">
          Pack not found
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The pack &quot;{slug}&quot; does not exist.
        </p>
        <Button variant="ghost" className="mt-4" asChild>
          <Link href="/">Back to catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-9 py-10">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
          <Link href="/">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            {pack.name}
          </h1>
          <Badge variant="secondary">{pack.language}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {pack.description}
        </p>
        <div className="mt-2 flex gap-1.5">
          {pack.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <ChallengeList challenges={challenges} isLoading={isLoading} packSlug={slug} />
    </div>
  );
}
