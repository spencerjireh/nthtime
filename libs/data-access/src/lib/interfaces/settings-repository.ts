import type { UserSettings } from '@nthtime/shared';

export interface SettingsRepository {
  getSettings(): Promise<UserSettings>;
  updateSettings(partial: Partial<UserSettings>): Promise<UserSettings>;
}
