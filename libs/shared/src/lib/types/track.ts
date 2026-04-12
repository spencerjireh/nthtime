export interface Track {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly longDescription?: string;
  readonly tags: readonly string[];
  readonly packSlugs: readonly string[];
}
