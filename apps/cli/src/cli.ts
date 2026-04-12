import { Command } from 'commander';
import { registerConfigCommand } from './config-command.js';
import { runVerify } from './verify-command.js';
import { prepareStart } from './start-command.js';
import { startWatchMode } from './watch.js';
import { getServerUrl } from './config.js';
import { fetchTracks, fetchTrackDetail } from './api.js';

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

program
  .command('tracks')
  .description('List tracks, or show packs in a track')
  .argument('[slug]', 'Track slug (omit to list all)')
  .action(async (slug: string | undefined) => {
    try {
      const serverUrl = getServerUrl();
      if (!slug) {
        const tracks = await fetchTracks(serverUrl);
        if (tracks.length === 0) {
          console.log('No tracks available.');
          return;
        }
        console.log(`${tracks.length} track(s):\n`);
        for (const t of tracks) {
          console.log(`  ${t.slug.padEnd(24)} ${t.title} (${t.packCount} packs)`);
        }
      } else {
        const track = await fetchTrackDetail(serverUrl, slug);
        console.log(`${track.title}\n`);
        console.log(`  ${track.description}\n`);
        console.log(`  Packs (${track.packs.length}):\n`);
        for (const p of track.packs) {
          console.log(`    ${String(p.position).padEnd(4)} ${p.slug.padEnd(28)} ${p.name}`);
        }
      }
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  });

registerConfigCommand(program);

program.parse();
