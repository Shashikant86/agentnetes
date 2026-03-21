#!/usr/bin/env node
/**
 * agentnetes CLI
 *
 * Usage:
 *   agentnetes run "Add comprehensive test coverage"
 *   agentnetes snapshot create
 *   agentnetes snapshot list
 */

import { execSync } from 'child_process';
import { run } from './commands/run.js';
import { snapshotCreate, snapshotList } from './commands/snapshot.js';

// Parse args
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (command === 'run') {
    const goal = args[1];
    if (!goal) {
      console.error('Usage: agentnetes run "your goal"');
      process.exit(1);
    }
    // Detect git remote
    let repoUrl: string;
    try {
      repoUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
      // Normalize SSH to HTTPS
      if (repoUrl.startsWith('git@github.com:')) {
        repoUrl = repoUrl.replace('git@github.com:', 'https://github.com/').replace('.git', '');
      }
      if (repoUrl.endsWith('.git')) {
        repoUrl = repoUrl.slice(0, -4);
      }
    } catch {
      console.error('Error: not inside a git repository or no remote "origin" found.');
      console.error('Run this command from the root of a git repository.');
      process.exit(1);
    }
    await run({ goal, repoUrl });
  } else if (command === 'snapshot' && args[1] === 'create') {
    await snapshotCreate();
  } else if (command === 'snapshot' && args[1] === 'list') {
    await snapshotList();
  } else {
    console.log('agentnetes - zero to a self-organizing AI agency. On demand.');
    console.log('');
    console.log('Usage:');
    console.log('  agentnetes run "goal"       Run agents on the current git repo');
    console.log('  agentnetes snapshot create  Pre-warm a sandbox snapshot for faster runs');
    console.log('  agentnetes snapshot list    List available snapshots');
    console.log('');
    console.log('Environment variables:');
    console.log('  AI_GATEWAY_BASE_URL  Vercel AI Gateway endpoint');
    console.log('  VERCEL_TOKEN         Vercel API token (for sandbox)');
  }
}

main().catch(err => {
  console.error('Fatal:', (err as Error).message ?? err);
  process.exit(1);
});
