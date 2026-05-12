import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workerRoot = dirname(scriptDir);
const localBinary = join(workerRoot, 'node_modules', '.bin', 'wrangler');
const localConfig = join(workerRoot, 'wrangler.local.toml');
const baseConfig = join(workerRoot, 'wrangler.toml');

const [, , command, ...restArgs] = process.argv;

if (!command) {
  console.error('Usage: node scripts/run-wrangler.mjs <dev|deploy|types> [args...]');
  process.exit(1);
}

const configPath = existsSync(localConfig) ? localConfig : baseConfig;
const configArg = ['--config', configPath];
const hasLocalBinary = existsSync(localBinary);

const result = spawnSync(
  hasLocalBinary ? localBinary : 'pnpm',
  hasLocalBinary
    ? [command, ...configArg, ...restArgs]
    : ['dlx', 'wrangler', command, ...configArg, ...restArgs],
  {
    cwd: workerRoot,
    stdio: 'inherit',
    env: process.env,
  },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);