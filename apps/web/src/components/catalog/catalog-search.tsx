'use client';

import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface CatalogSearchProps {
  value: string;
  onChange: (value: string) => void;
}

// Fully controlled: emits every keystroke immediately so the parent can filter in memory
// instantly. The URL push (which refires the RSC) is debounced by the parent, not here.
export function CatalogSearch({ value, onChange }: CatalogSearchProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange],
  );

  const handleClear = useCallback(() => onChange(''), [onChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search packs and challenges..."
        value={value}
        onChange={handleChange}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
