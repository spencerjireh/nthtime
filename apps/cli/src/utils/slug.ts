export class SlugParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SlugParseError';
  }
}

export interface ParsedSlug {
  readonly packSlug: string;
  readonly challengeSlug: string;
}

export function parseSlug(slug: string): ParsedSlug {
  if (!slug) {
    throw new SlugParseError('Slug must not be empty');
  }

  const parts = slug.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new SlugParseError('Slug must be in format pack/challenge');
  }

  return { packSlug: parts[0], challengeSlug: parts[1] };
}
