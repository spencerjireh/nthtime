export interface TrackSummary {
  readonly _id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly packCount: number;
}

export interface TrackPackSummary {
  readonly _id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly language: string;
  readonly framework?: string;
  readonly tags: readonly string[];
  readonly challengeCount: number;
  readonly passedCount: number;
}

export interface TrackDetail {
  readonly _id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly longDescription?: string;
  readonly tags: readonly string[];
  readonly packs: readonly TrackPackSummary[];
}

export interface AuthorTrackSummary {
  readonly _id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly packSlugs: readonly string[];
  readonly packCount: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface AuthorTrackDetail extends AuthorTrackSummary {
  readonly longDescription?: string;
}

export interface CreateTrackInput {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly longDescription?: string;
  readonly tags: string[];
  readonly packSlugs: string[];
}

export interface UpdateTrackInput {
  readonly trackId: string;
  readonly slug?: string;
  readonly title?: string;
  readonly description?: string;
  readonly longDescription?: string;
  readonly tags?: string[];
  readonly packSlugs?: string[];
}

export interface TrackRepository {
  listTracks(): Promise<readonly TrackSummary[]>;
  getTrack(slug: string, userId?: string): Promise<TrackDetail | null>;
}
