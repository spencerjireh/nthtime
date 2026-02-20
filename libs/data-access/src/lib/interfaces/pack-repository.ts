import type { Pack, Challenge } from '@nthtime/shared';

export interface PackRepository {
  listPacks(): Promise<readonly Pack[]>;
  getChallenges(slug: string): Promise<readonly Challenge[]>;
  getChallenge(id: string): Promise<Challenge | null>;
}
