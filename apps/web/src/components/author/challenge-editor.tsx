'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChallengeMetadataTab, type ChallengeMetadata } from './challenge-metadata-tab';
import { FileEditorTab } from './file-editor-tab';
import { AssertionEditor } from './assertion-editor';
import { ValidationPanel } from './validation-panel';
import { useCreateChallenge, useUpdateChallenge, useAuthorPack } from '@/hooks/use-author';
import { ArrowLeft, Eye, Save } from 'lucide-react';
import { authorPackHref, authorPreviewHref } from '@/lib/routes';
import { slugify } from '@/lib/author/slug-utils';

interface ChallengeEditorProps {
  packSlug: string;
  /** Existing challenge data for edit mode. Undefined = create mode. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingChallenge?: any;
}

const DEFAULT_ASSERTIONS = JSON.stringify(
  { perFile: {}, crossFile: [] },
  null,
  2,
);

export function ChallengeEditor({ packSlug, existingChallenge }: ChallengeEditorProps) {
  const router = useRouter();
  const { pack } = useAuthorPack(packSlug);
  const createChallenge = useCreateChallenge();
  const updateChallenge = useUpdateChallenge();
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = !!existingChallenge;

  // Metadata state
  const [metadata, setMetadata] = useState<ChallengeMetadata>(() => ({
    title: existingChallenge?.title ?? '',
    prompt: existingChallenge?.prompt ?? '',
    difficulty: existingChallenge?.difficulty ?? 'beginner',
    tags: existingChallenge?.tags?.join(', ') ?? '',
    timeEstimateSeconds: existingChallenge?.timeEstimateSeconds ?? 300,
    hints: existingChallenge?.hints ?? [],
  }));

  // Solution state (reference solution used for validation)
  const [solutionFiles, setSolutionFiles] = useState<{ path: string; content: string }[]>(
    () => existingChallenge?.referenceSolution ?? [],
  );

  // Assertions JSON string
  const [assertionsJson, setAssertionsJson] = useState<string>(() =>
    existingChallenge?.assertions
      ? JSON.stringify(existingChallenge.assertions, null, 2)
      : DEFAULT_ASSERTIONS,
  );

  const handleSave = useCallback(async () => {
    if (!pack) return;
    if (!metadata.title.trim()) return;

    let assertions;
    try {
      assertions = JSON.parse(assertionsJson);
    } catch {
      alert('Invalid assertions JSON. Please fix syntax errors before saving.');
      return;
    }

    const tagsArray = metadata.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const challengeData = {
      slug: existingChallenge?.slug ?? slugify(metadata.title),
      title: metadata.title,
      prompt: metadata.prompt,
      difficulty: metadata.difficulty,
      tags: tagsArray,
      timeEstimateSeconds: metadata.timeEstimateSeconds,
      hints: metadata.hints,
      assertions,
      referenceSolution: solutionFiles,
    };

    setIsSaving(true);
    try {
      if (isEdit) {
        await updateChallenge({
          challengeId: existingChallenge._id,
          ...challengeData,
        });
      } else {
        await createChallenge({
          packSlug,
          ...challengeData,
        });
      }
      router.push(authorPackHref(packSlug));
    } catch (err) {
      console.error('Failed to save challenge:', err);
    } finally {
      setIsSaving(false);
    }
  }, [
    pack,
    metadata,
    solutionFiles,
    assertionsJson,
    isEdit,
    existingChallenge,
    createChallenge,
    updateChallenge,
    router,
    packSlug,
  ]);

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-9 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
            <Link href={authorPackHref(packSlug)}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to {pack?.name ?? 'pack'}
            </Link>
          </Button>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? 'Edit Challenge' : 'New Challenge'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && existingChallenge?.slug && (
            <Button variant="outline" size="sm" asChild>
              <Link href={authorPreviewHref(packSlug, existingChallenge.slug)}>
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Preview
              </Link>
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={isSaving || !metadata.title.trim()}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metadata">
        <TabsList>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="solution">Solution</TabsTrigger>
          <TabsTrigger value="assertions">Assertions</TabsTrigger>
          <TabsTrigger value="validate">Validate</TabsTrigger>
        </TabsList>

        <TabsContent value="metadata">
          <ChallengeMetadataTab metadata={metadata} onChange={setMetadata} />
        </TabsContent>

        <TabsContent value="solution">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Reference solution used to validate assertions pass. This is shown when the student
              views the solution.
            </p>
            <FileEditorTab initialFiles={solutionFiles} onChange={setSolutionFiles} />
          </div>
        </TabsContent>

        <TabsContent value="assertions">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              JSON assertions that verify student code. Use the snippet palette to insert
              templates. Format: {`{ "perFile": { "path": [...] }, "crossFile": [...] }`}
            </p>
            <AssertionEditor value={assertionsJson} onChange={setAssertionsJson} />
          </div>
        </TabsContent>

        <TabsContent value="validate">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Run your assertions against the solution files to verify they pass.
            </p>
            <ValidationPanel
              assertionsJson={assertionsJson}
              solutionFiles={solutionFiles}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
