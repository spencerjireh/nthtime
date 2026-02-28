import { Command } from 'commander';
import { registerConfigCommand } from './config-command.js';
import { runVerify } from './verify-command.js';
import { prepareStart } from './start-command.js';
import { startWatchMode } from './watch.js';

const program = new Command();

program
  .name('nthtime')
  .description('Drill code patterns from the terminal')
  .version('0.0.1');

program
  .command('start')
  .description('Start a challenge in watch mode')
  .argument('<pack/challenge>', 'Challenge slug (e.g. express-basics/hello-world)')
  .option('-d, --dir <path>', 'Working directory for challenge files')
  .action(async (slug: string, opts: { dir?: string }) => {
    try {
      const { dir, metadata, resumed } = await prepareStart(slug, opts);
      await startWatchMode({ dir, metadata, resumed });
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  });

program
  .command('verify')
  .description('Verify challenge solution (one-shot)')
  .argument('[pack/challenge]', 'Challenge slug (auto-detects from .nthtime.json if omitted)')
  .option('-d, --dir <path>', 'Working directory to verify')
  .action(async (slug: string | undefined, opts: { dir?: string }) => {
    try {
      await runVerify(slug, opts.dir);
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  });

registerConfigCommand(program);

program.parse();
