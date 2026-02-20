'use client';

import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CatalogFiltersProps {
  language: string;
  difficulty: string;
  onLanguageChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
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

export function CatalogFilters({
  language,
  difficulty,
  onLanguageChange,
  onDifficultyChange,
}: CatalogFiltersProps) {
  return (
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
    </div>
  );
}
