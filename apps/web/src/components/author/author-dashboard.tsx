'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogoSpinner } from '@/components/ui/logo-spinner';
import { useMyPacks } from '@/hooks/use-author';
import { importPackFromZip } from '@/lib/author/import-pack';
import { Plus, Upload } from 'lucide-react';

export function AuthorDashboard() {
  const { packs, isLoading } = useMyPacks();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const buffer = await file.arrayBuffer();
        const data = importPackFromZip(buffer);
        sessionStorage.setItem('nthtime:import', JSON.stringify(data));
        router.push('/author/new?import=1');
      } catch (err) {
        console.error('Failed to import:', err);
        alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [router],
  );

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-9 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            My Packs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your challenge packs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/author/tracks">My Tracks</Link>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import ZIP
          </Button>
          <Button size="sm" asChild>
            <Link href="/author/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Pack
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <LogoSpinner size="lg" />
        </div>
      ) : packs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No packs yet.</p>
          <Button size="sm" className="mt-4" asChild>
            <Link href="/author/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create your first pack
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => (
            <Link
              key={pack._id}
              href={`/author/${pack.slug}`}
              className="group rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-sans text-sm font-semibold text-foreground group-hover:text-primary">
                  {pack.name}
                </h3>
                <Badge variant="outline" className="text-xs capitalize">
                  {pack.visibility}
                </Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {pack.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {pack.language}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {pack.challengeCount} challenge{pack.challengeCount !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
