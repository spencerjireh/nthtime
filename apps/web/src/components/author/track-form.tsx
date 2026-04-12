'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogoSpinner } from '@/components/ui/logo-spinner';
import {
  useAuthorTrack,
  useCreateTrack,
  useUpdateTrack,
  useDeleteTrack,
} from '@/hooks/use-author';
import { usePackList } from '@/hooks/use-packs';
import { GripVertical, Plus, Trash2, X } from 'lucide-react';

interface TrackFormProps {
  mode: 'create' | 'edit';
  slug?: string;
}

export function TrackForm({ mode, slug: editSlug }: TrackFormProps) {
  const router = useRouter();
  const createTrack = useCreateTrack();
  const updateTrack = useUpdateTrack();
  const deleteTrack = useDeleteTrack();

  const { track, isLoading: trackLoading } = useAuthorTrack(
    mode === 'edit' && editSlug ? editSlug : '',
  );
  const { packs: allPacks } = usePackList({});

  const [title, setTitle] = useState('');
  const [slugValue, setSlugValue] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [packSlugs, setPackSlugs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  useEffect(() => {
    if (mode === 'edit' && track) {
      setTitle(track.title);
      setSlugValue(track.slug);
      setDescription(track.description);
      setLongDescription(track.longDescription ?? '');
      setTagsInput(track.tags.join(', '));
      setPackSlugs([...track.packSlugs]);
    }
  }, [mode, track]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const tags = tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

        if (mode === 'create') {
          await createTrack({
            slug: slugValue,
            title,
            description,
            longDescription,
            tags,
            packSlugs,
          });
          router.push('/author/tracks');
        } else if (editSlug) {
          await updateTrack(editSlug, {
            title,
            description,
            longDescription,
            tags,
            packSlugs,
          });
          router.push('/author/tracks');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      mode,
      editSlug,
      slugValue,
      title,
      description,
      longDescription,
      tagsInput,
      packSlugs,
      createTrack,
      updateTrack,
      router,
    ],
  );

  const handleDelete = useCallback(async () => {
    if (!editSlug || !confirm('Delete this track? This cannot be undone.')) return;
    await deleteTrack(editSlug);
    router.push('/author/tracks');
  }, [editSlug, deleteTrack, router]);

  const addPack = useCallback(
    (packSlug: string) => {
      if (!packSlugs.includes(packSlug)) {
        setPackSlugs((prev) => [...prev, packSlug]);
      }
    },
    [packSlugs],
  );

  const removePack = useCallback((index: number) => {
    setPackSlugs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (dragIndex === null) return;
      setDropIndex(index);
    },
    [dragIndex],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (dragIndex === null || dropIndex === null || dragIndex === dropIndex) {
        setDragIndex(null);
        setDropIndex(null);
        return;
      }
      setPackSlugs((prev) => {
        const reordered = [...prev];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(dropIndex, 0, moved);
        return reordered;
      });
      setDragIndex(null);
      setDropIndex(null);
    },
    [dragIndex, dropIndex],
  );

  if (mode === 'edit' && trackLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LogoSpinner size="lg" />
      </div>
    );
  }

  const availablePacks = allPacks.filter((p) => !packSlugs.includes(p.slug));

  return (
    <div className="mx-auto max-w-screen-md space-y-6 px-9 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
          {mode === 'create' ? 'New Track' : 'Edit Track'}
        </h1>
        {mode === 'edit' && (
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        {mode === 'create' && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Slug</label>
            <Input
              value={slugValue}
              onChange={(e) => setSlugValue(e.target.value)}
              placeholder="python-curriculum"
              required
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">
            Long Description (Markdown)
          </label>
          <textarea
            className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">
            Tags (comma-separated)
          </label>
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="python, curriculum"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Packs ({packSlugs.length})
          </label>

          {packSlugs.length > 0 && (
            <div
              className="space-y-1"
              onDragEnd={() => {
                setDragIndex(null);
                setDropIndex(null);
              }}
            >
              {packSlugs.map((ps, index) => {
                const pack = allPacks.find((p) => p.slug === ps);
                return (
                  <div
                    key={ps}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={handleDrop}
                    className={`flex items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
                      dragIndex === index
                        ? 'opacity-50'
                        : dropIndex === index
                          ? 'border-primary'
                          : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                    <span className="w-6 shrink-0 text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate text-sm text-foreground">
                      {pack?.name ?? ps}
                    </span>
                    {pack && (
                      <Badge variant="secondary" className="text-xs">
                        {pack.language}
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => removePack(index)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {availablePacks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {availablePacks.map((pack) => (
                <button
                  key={pack.slug}
                  type="button"
                  onClick={() => addPack(pack.slug)}
                  className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  <Plus className="h-3 w-3" />
                  {pack.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : mode === 'create'
                ? 'Create Track'
                : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/author/tracks')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
