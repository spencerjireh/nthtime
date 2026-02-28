'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDeleteChallenge, useReorderChallenges } from '@/hooks/use-author';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';

interface ChallengeSummary {
  _id: string;
  title: string;
  difficulty: string;
  order: number;
}

interface ChallengeOrderListProps {
  packId: string;
  packSlug: string;
  challenges: readonly ChallengeSummary[];
}

export function ChallengeOrderList({ packId, packSlug, challenges }: ChallengeOrderListProps) {
  const reorder = useReorderChallenges();
  const deleteChallenge = useDeleteChallenge();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const sorted = [...challenges].sort((a, b) => a.order - b.order);

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
    async (e: React.DragEvent) => {
      e.preventDefault();
      if (dragIndex === null || dropIndex === null || dragIndex === dropIndex) {
        setDragIndex(null);
        setDropIndex(null);
        return;
      }

      const reordered = [...sorted];
      const [moved] = reordered.splice(dragIndex, 1);
      reordered.splice(dropIndex, 0, moved);

      setDragIndex(null);
      setDropIndex(null);

      await reorder(packSlug, reordered.map((c) => c._id));
    },
    [dragIndex, dropIndex, sorted, reorder, packSlug],
  );

  const handleDelete = useCallback(
    async (challengeId: string) => {
      if (!confirm('Delete this challenge? All attempts will also be deleted.')) return;
      setDeleting(challengeId);
      try {
        await deleteChallenge(challengeId);
      } finally {
        setDeleting(null);
      }
    },
    [deleteChallenge],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-sm font-semibold text-foreground">
          Challenges ({sorted.length})
        </h2>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/author/${packSlug}/challenges/new`}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Challenge
          </Link>
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">No challenges yet.</p>
        </div>
      ) : (
        <div ref={listRef} className="space-y-1" onDragEnd={() => { setDragIndex(null); setDropIndex(null); }}>
          {sorted.map((challenge, index) => (
            <div
              key={challenge._id}
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
              <span className="w-6 shrink-0 text-xs text-muted-foreground">{challenge.order}</span>
              <span className="flex-1 truncate text-sm text-foreground">{challenge.title}</span>
              <Badge variant="outline" className="text-xs">
                {challenge.difficulty}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                asChild
              >
                <Link href={`/author/${packSlug}/challenges/${challenge.order}`}>
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                disabled={deleting === challenge._id}
                onClick={() => handleDelete(challenge._id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
