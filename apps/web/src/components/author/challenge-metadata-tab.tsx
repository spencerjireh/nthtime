'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HintListEditor } from './hint-list-editor';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

export interface ChallengeMetadata {
  title: string;
  prompt: string;
  difficulty: string;
  tags: string;
  timeEstimateSeconds: number;
  hints: string[];
}

interface ChallengeMetadataTabProps {
  metadata: ChallengeMetadata;
  onChange: (metadata: ChallengeMetadata) => void;
}

export function ChallengeMetadataTab({ metadata, onChange }: ChallengeMetadataTabProps) {
  function update(partial: Partial<ChallengeMetadata>) {
    onChange({ ...metadata, ...partial });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <Input
            value={metadata.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Challenge title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
            <Select value={metadata.difficulty} onValueChange={(v) => update({ difficulty: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Time Estimate (sec)
            </label>
            <Input
              type="number"
              min={0}
              value={metadata.timeEstimateSeconds}
              onChange={(e) => update({ timeEstimateSeconds: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Prompt (Markdown)</label>
        <textarea
          value={metadata.prompt}
          onChange={(e) => update({ prompt: e.target.value })}
          placeholder="Challenge prompt in Markdown..."
          rows={8}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Tags (comma-separated)
        </label>
        <Input
          value={metadata.tags}
          onChange={(e) => update({ tags: e.target.value })}
          placeholder="hooks, state"
        />
      </div>

      <HintListEditor hints={metadata.hints} onChange={(hints) => update({ hints })} />
    </div>
  );
}
