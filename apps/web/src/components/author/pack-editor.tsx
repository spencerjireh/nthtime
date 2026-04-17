'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogoSpinner } from '@/components/ui/logo-spinner';
import { PackForm, type PackFormData } from './pack-form';
import { ChallengeOrderList } from './challenge-order-list';
import { useAuthorPack, useAuthorPackForExport, useUpdatePack, useDeletePack } from '@/hooks/use-author';
import { exportPackAsZip } from '@/lib/author/export-pack';
import { authorPackHref, authorPacksHref } from '@/lib/routes';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';

interface PackEditorProps {
  slug: string;
}

export function PackEditor({ slug }: PackEditorProps) {
  const { pack, isLoading } = useAuthorPack(slug);
  const { packData: exportData } = useAuthorPackForExport(slug);
  const updatePack = useUpdatePack();
  const deletePack = useDeletePack();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-screen-2xl items-center justify-center px-9 py-16">
        <LogoSpinner size="lg" />
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-center px-9 py-16 text-center">
        <h2 className="font-sans text-lg font-semibold text-foreground">Pack not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This pack does not exist or you do not have permission to edit it.
        </p>
        <Button variant="ghost" className="mt-4" asChild>
          <Link href={authorPacksHref()}>Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  async function handleUpdate(data: PackFormData) {
    if (!pack) return;
    setIsSubmitting(true);
    try {
      const tagsArray = data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await updatePack(slug, {
        name: data.name,
        slug: data.slug,
        description: data.description,
        language: data.language,
        framework: data.framework || undefined,
        version: data.version,
        tags: tagsArray,
        visibility: data.visibility,
      });

      // If slug changed, redirect to new URL
      if (data.slug !== slug) {
        router.push(authorPackHref(data.slug));
      }
    } catch (err) {
      console.error('Failed to update pack:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!pack) return;
    if (!confirm(`Delete "${pack.name}"? This will delete all challenges and attempts.`)) return;
    try {
      await deletePack(slug);
      router.push(authorPacksHref());
    } catch (err) {
      console.error('Failed to delete pack:', err);
    }
  }

  return (
    <div className="mx-auto max-w-screen-2xl space-y-8 px-9 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
            <Link href={authorPacksHref()}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            {pack.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!exportData}
            onClick={() => exportData && exportPackAsZip(exportData)}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export ZIP
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-sans text-sm font-semibold text-foreground">Pack Metadata</h2>
        <PackForm
          initial={{
            name: pack.name,
            slug: pack.slug,
            description: pack.description,
            language: pack.language,
            framework: pack.framework ?? '',
            version: pack.version,
            tags: pack.tags.join(', '),
            visibility: pack.visibility ?? 'public',
          }}
          excludePackId={pack._id}
          onSubmit={handleUpdate}
          submitLabel="Save Changes"
          isSubmitting={isSubmitting}
        />
      </div>

      <hr className="border-border" />

      <ChallengeOrderList
        packSlug={pack.slug}
        challenges={pack.challenges}
      />
    </div>
  );
}
