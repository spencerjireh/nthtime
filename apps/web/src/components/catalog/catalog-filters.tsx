'use client';

import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type CompletionStatus = '' | 'not-started' | 'in-progress' | 'completed';

interface CatalogFiltersProps {
  language: string;
  difficulty: string;
  availableTags: string[];
  selectedTags: string[];
  status: CompletionStatus;
  onLanguageChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  onStatusChange: (status: CompletionStatus) => void;
}

const LANGUAGES = [
  { value: '', label: 'All languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
];

const DIFFICULTIES = [
  { value: '', label: 'All' },
  { value: 'beginner', label: 'Beginner', variant: 'beginner' as const },
  {
    value: 'intermediate',
    label: 'Intermediate',
    variant: 'intermediate' as const,
  },
  { value: 'advanced', label: 'Advanced', variant: 'advanced' as const },
];

const STATUSES: { value: CompletionStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'not-started', label: 'Not started' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export function CatalogFilters({
  language,
  difficulty,
  availableTags,
  selectedTags,
  status,
  onLanguageChange,
  onDifficultyChange,
  onTagsChange,
  onStatusChange,
}: CatalogFiltersProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All languages" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value || '__all'} value={lang.value || '__all'}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1.5">
          {DIFFICULTIES.map((d) => {
            const isActive = difficulty === d.value;
            return (
              <button
                key={d.value || '__all'}
                onClick={() => onDifficultyChange(d.value)}
                className="transition-opacity"
              >
                <Badge
                  variant={
                    isActive && d.variant ? d.variant : isActive ? 'default' : 'outline'
                  }
                  className={isActive ? '' : 'opacity-60 hover:opacity-100'}
                >
                  {d.label}
                </Badge>
              </button>
            );
          })}
        </div>

        <div className="flex gap-1.5">
          {STATUSES.map((s) => {
            const isActive = status === s.value;
            return (
              <button
                key={s.value || '__all_status'}
                onClick={() => onStatusChange(s.value)}
                className="transition-opacity"
              >
                <Badge
                  variant={isActive ? 'default' : 'outline'}
                  className={isActive ? '' : 'opacity-60 hover:opacity-100'}
                >
                  {s.label}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button key={tag} onClick={() => toggleTag(tag)} className="transition-opacity">
                <Badge
                  variant={isSelected ? 'secondary' : 'outline'}
                  className={isSelected ? '' : 'opacity-60 hover:opacity-100'}
                >
                  {tag}
                </Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
