import { parseSlug, SlugParseError } from '../utils/slug.js';

describe('parseSlug', () => {
  it('parses a valid pack/challenge slug', () => {
    expect(parseSlug('express-basics/hello-world')).toEqual({
      packSlug: 'express-basics',
      challengeSlug: 'hello-world',
    });
  });

  it('handles hyphens and numbers', () => {
    expect(parseSlug('react-101/challenge-02')).toEqual({
      packSlug: 'react-101',
      challengeSlug: 'challenge-02',
    });
  });

  it('throws SlugParseError on empty string', () => {
    expect(() => parseSlug('')).toThrow(SlugParseError);
    expect(() => parseSlug('')).toThrow('Slug must not be empty');
  });

  it('throws SlugParseError when missing separator', () => {
    expect(() => parseSlug('no-separator')).toThrow(SlugParseError);
    expect(() => parseSlug('no-separator')).toThrow('Slug must be in format pack/challenge');
  });

  it('throws SlugParseError with too many separators', () => {
    expect(() => parseSlug('a/b/c')).toThrow(SlugParseError);
  });

  it('throws SlugParseError on trailing slash', () => {
    expect(() => parseSlug('pack/')).toThrow(SlugParseError);
  });

  it('throws SlugParseError on leading slash', () => {
    expect(() => parseSlug('/challenge')).toThrow(SlugParseError);
  });
});
