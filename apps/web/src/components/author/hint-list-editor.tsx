'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

interface HintListEditorProps {
  hints: string[];
  onChange: (hints: string[]) => void;
}

export function HintListEditor({ hints, onChange }: HintListEditorProps) {
  const addHint = () => {
    onChange([...hints, '']);
  };

  const removeHint = (index: number) => {
    onChange(hints.filter((_, i) => i !== index));
  };

  const updateHint = (index: number, value: string) => {
    const updated = [...hints];
    updated[index] = value;
    onChange(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...hints];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const moveDown = (index: number) => {
    if (index === hints.length - 1) return;
    const updated = [...hints];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">
        Hints ({hints.length})
      </label>
      {hints.map((hint, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">
            {index + 1}
          </span>
          <Input
            value={hint}
            onChange={(e) => updateHint(index, e.target.value)}
            placeholder="Hint text..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={index === 0}
            onClick={() => moveUp(index)}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={index === hints.length - 1}
            onClick={() => moveDown(index)}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={() => removeHint(index)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addHint}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add Hint
      </Button>
    </div>
  );
}
