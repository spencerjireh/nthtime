'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackForm, type PackFormData } from '@/components/author/pack-form';
import { useCreatePack, useCreateChallenge } from '@/hooks/use-author';
import type { PackImportData } from '@/lib/author/import-pack';
import { ArrowLeft } from 'lucide-react';

export default function NewPackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createPack = useCreatePack();
  const createChallenge = useCreateChallenge();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for import data
  const importData = useMemo<PackImportData | null>(() => {
    if (searchParams.get('import') !== '1') return null;
    try {
      const raw = sessionStorage.getItem('nthtime:import');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [searchParams]);

  // Clean up sessionStorage after reading
  useEffect(() => {
    if (importData) {
      sessionStorage.removeItem('nthtime:import');
    }
  }, [importData]);

  async function handleSubmit(data: PackFormData) {
    setIsSubmitting(true);
    try {
      const tagsArray = data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await createPack({
        name: data.name,
        slug: data.slug,
        description: data.description,
        language: data.language,
        framework: data.framework || undefined,
        version: data.version,
        tags: tagsArray,
        visibility: data.visibility,
      });

      // If importing, create all challenges sequentially
      if (importData?.challenges) {
        for (const challenge of importData.challenges) {
          await createChallenge({
            packSlug: data.slug,
            slug: challenge.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            title: challenge.title,
            prompt: challenge.prompt,
            difficulty: challenge.difficulty,
            tags: challenge.tags,
            timeEstimateSeconds: challenge.timeEstimateSeconds,
            scaffolded: challenge.scaffolded,
            files: challenge.scaffoldFiles,
            hints: challenge.hints,
            assertions: challenge.assertions,
            referenceSolution:
              challenge.solutionFiles.length > 0 ? challenge.solutionFiles : undefined,
          });
        }
      }

      router.push(`/author/${data.slug}`);
    } catch (err) {
      console.error('Failed to create pack:', err);
      setIsSubmitting(false);
    }
  }

  const initialData = importData
    ? {
        name: importData.name,
        slug: importData.slug,
        description: importData.description,
        language: importData.language,
        framework: importData.framework ?? '',
        version: importData.version,
        tags: importData.tags.join(', '),
        visibility: 'public',
      }
    : undefined;

  return (
    <div className="mx-auto max-w-screen-md space-y-6 px-9 py-10">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
          <Link href="/author">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
          {importData ? 'Import Pack' : 'Create New Pack'}
        </h1>
        {importData && (
          <p className="mt-1 text-sm text-muted-foreground">
            Imported {importData.challenges.length} challenge
            {importData.challenges.length !== 1 ? 's' : ''} from ZIP. Review the metadata and
            save.
          </p>
        )}
      </div>

      <PackForm
        initial={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/author')}
        submitLabel={importData ? 'Import Pack' : 'Create Pack'}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
