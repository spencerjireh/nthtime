interface EmptyStateProps {
  variant: 'no-packs' | 'no-challenges' | 'no-search-results';
  query?: string;
}

const MESSAGES = {
  'no-packs': {
    title: 'No packs found',
    description: 'There are no challenge packs available yet. Check back soon.',
  },
  'no-challenges': {
    title: 'No challenges match filters',
    description: 'Try adjusting your filters to see more challenges.',
  },
  'no-search-results': {
    title: 'No results',
    description: 'No packs or challenges match your search.',
  },
};

export function EmptyState({ variant, query }: EmptyStateProps) {
  const message = MESSAGES[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h3 className="text-lg font-semibold text-foreground">{message.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {query
          ? `No results for "${query}". Try a different search term.`
          : message.description}
      </p>
    </div>
  );
}
