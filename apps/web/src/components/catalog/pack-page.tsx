'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChallengeList } from './challenge-list';
import { MOCK_PACKS, MOCK_CHALLENGES } from '@/lib/mock-packs';
import { ArrowLeft } from 'lucide-react';

interface PackPageProps {
  slug: string;
}

export function PackPage({ slug }: PackPageProps) {
  // Use mock data when Convex is not configured
  const pack = MOCK_PACKS.find((p) => p.slug === slug);
  const challenges = MOCK_CHALLENGES[slug];

  if (!pack) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-lg font-semibold text-foreground">
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
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
          <Link href="/">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {pack.name}
          </h1>
          <Badge variant="secondary">{pack.language}</Badge>
          {pack.framework && <Badge variant="outline">{pack.framework}</Badge>}
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

      <ChallengeList challenges={challenges} isLoading={false} />
    </div>
  );
}
