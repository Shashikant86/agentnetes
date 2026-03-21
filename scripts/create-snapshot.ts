/**
 * One-time script: creates a Vercel Sandbox snapshot of the vercel/ai monorepo.
 * Run once, copy the snapshotId into REPO_SNAPSHOT_ID in your .env.local.
 *
 * Usage:
 *   npx tsx scripts/create-snapshot.ts
 *
 * Requires VERCEL_OIDC_TOKEN or sandbox credentials in the environment.
 * Takes ~2-5 minutes depending on npm install speed.
 */

import { Sandbox } from '@vercel/sandbox';

const REPO_URL = 'https://github.com/vercel/ai.git';
const REPO_REV = 'main'; // or pin to a specific commit for reproducibility

async function main() {
  console.log('Creating sandbox from vercel/ai git source...');
  console.log(`  repo: ${REPO_URL}`);
  console.log(`  rev:  ${REPO_REV}`);
  console.log('');

  const sandbox = await Sandbox.create({
    source: {
      type: 'git',
      url: REPO_URL,
      revision: REPO_REV,
      depth: 1,
    },
    timeout: 10 * 60 * 1000, // 10 min for npm install
  });

  console.log('Sandbox created. Installing dependencies...');

  // Install pnpm (the monorepo uses pnpm)
  const pnpmInstall = await sandbox.runCommand('bash', [
    '-c',
    'npm install -g pnpm@latest 2>&1 | tail -5',
  ]);
  console.log('pnpm:', (await pnpmInstall.stdout()).trim());

  // Install workspace dependencies (this warms up node_modules for all packages)
  console.log('Running pnpm install (this takes 2-4 minutes)...');
  const install = await sandbox.runCommand('bash', [
    '-c',
    'cd /vercel/sandbox && pnpm install --frozen-lockfile 2>&1 | tail -20',
  ]);
  console.log((await install.stdout()).trim());

  // Build the core packages so tsc type-checking works
  console.log('Building core packages...');
  const build = await sandbox.runCommand('bash', [
    '-c',
    'cd /vercel/sandbox && pnpm build --filter=@ai-sdk/provider --filter=@ai-sdk/provider-utils --filter=ai 2>&1 | tail -20',
  ]);
  console.log((await build.stdout()).trim());

  // Verify the repo is ready
  const check = await sandbox.runCommand('bash', [
    '-c',
    'ls /vercel/sandbox/packages | head -20',
  ]);
  console.log('\nPackages in repo:');
  console.log((await check.stdout()).trim());

  // Take the snapshot
  console.log('\nTaking filesystem snapshot...');
  const snap = await sandbox.snapshot();
  console.log('');
  console.log('='.repeat(60));
  console.log('SUCCESS! Add this to your .env.local:');
  console.log('');
  console.log(`REPO_SNAPSHOT_ID=${snap.snapshotId}`);
  console.log('');
  console.log('='.repeat(60));

  await sandbox.stop();
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
