import type { Command } from 'commander';
import type { CliConfig } from './types.js';
import { getConfigPath, loadConfig, saveConfig } from './config.js';

const VALID_KEYS: ReadonlySet<keyof CliConfig> = new Set(['serverUrl', 'workspace']);

function assertValidKey(key: string): asserts key is keyof CliConfig {
  if (!VALID_KEYS.has(key as keyof CliConfig)) {
    console.error(`Unknown config key: ${key}`);
    console.error(`Valid keys: ${[...VALID_KEYS].join(', ')}`);
    process.exit(1);
  }
}

export function registerConfigCommand(program: Command): void {
  const config = program
    .command('config')
    .description('Manage CLI configuration');

  config
    .command('set')
    .description('Set a config value')
    .argument('<key>', 'Config key (serverUrl, workspace)')
    .argument('<value>', 'Value to set')
    .action((key: string, value: string) => {
      assertValidKey(key);
      const existing = loadConfig() ?? ({} as Partial<CliConfig>);
      saveConfig({ ...existing, [key]: value } as CliConfig);
      console.log(`${key} = ${value}`);
    });

  config
    .command('get')
    .description('Get a config value')
    .argument('<key>', 'Config key (serverUrl, workspace)')
    .action((key: string) => {
      assertValidKey(key);
      const cfg = loadConfig();
      const value = cfg?.[key];
      if (value === undefined) {
        console.error(`${key} is not set`);
        process.exit(1);
      }
      console.log(value);
    });

  config
    .command('list')
    .description('Print all config as JSON')
    .action(() => {
      const cfg = loadConfig() ?? {};
      console.log(JSON.stringify(cfg, null, 2));
    });

  config
    .command('path')
    .description('Print the config file path')
    .action(() => {
      console.log(getConfigPath());
    });
}
