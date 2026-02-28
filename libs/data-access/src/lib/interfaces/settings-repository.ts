import type { UserSettings } from '@nthtime/shared';

export interface SettingsRepository {
  getSettings(userId: string): Promise<UserSettings | null>;
  updateSettings(userId: string, partial: Partial<UserSettings>): Promise<UserSettings>;
}
