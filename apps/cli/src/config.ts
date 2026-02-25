import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import envPaths from 'env-paths';
import type { CliConfig } from './types.js';

const paths = envPaths('nthtime', { suffix: '' });
const defaultConfigPath = join(paths.config, 'config.json');

export const DEFAULT_SERVER_URL = 'https://nthtime.dev';

export function resolveServerUrl(
  envUrl: string | undefined,
  config: CliConfig | null,
): string {
  return envUrl ?? config?.serverUrl ?? DEFAULT_SERVER_URL;
}

export function getServerUrl(): string {
  return resolveServerUrl(process.env.NTHTIME_URL, loadConfig());
}

export function loadConfig(configPathOverride?: string): CliConfig | null {
  const path = configPathOverride ?? defaultConfigPath;
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as CliConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: CliConfig, configPathOverride?: string): void {
  const path = configPathOverride ?? defaultConfigPath;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
}

export function getConfigPath(): string {
  return defaultConfigPath;
}

export function getWorkspace(configPathOverride?: string): string | null {
  return loadConfig(configPathOverride)?.workspace ?? null;
}
