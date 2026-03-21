import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import pc from 'picocolors';
import { Sandbox } from '@vercel/sandbox';

export async function snapshotCreate(): Promise<void> {
  // Detect git remote
  let repoUrl: string;
  try {
    repoUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
    if (repoUrl.startsWith('git@github.com:')) {
      repoUrl = repoUrl.replace('git@github.com:', 'https://github.com/').replace('.git', '');
    }
    if (repoUrl.endsWith('.git')) repoUrl = repoUrl.slice(0, -4);
  } catch {
    console.error('Error: not inside a git repository with a remote "origin".');
    process.exit(1);
    return;
  }

  console.log('');
  console.log(pc.bold('Creating sandbox snapshot'));
  console.log(pc.dim('Repo: ') + repoUrl);
  console.log(pc.dim('This takes 3-8 minutes depending on repo size.'));
  console.log('');

  const sandbox = await Sandbox.create({
    source: { type: 'git', url: repoUrl, depth: 1 },
    timeout: 15 * 60 * 1000,
  });

  console.log(pc.dim('Sandbox created. Installing dependencies...'));

  // Detect package manager and install
  const detectCmd = await sandbox.runCommand('bash', ['-c',
    'if [ -f pnpm-lock.yaml ]; then echo pnpm; elif [ -f yarn.lock ]; then echo yarn; else echo npm; fi'
  ]);
  const pkgManager = (await detectCmd.stdout()).trim();

  const installCmd = pkgManager === 'pnpm'
    ? 'npm i -g pnpm && pnpm install --frozen-lockfile'
    : pkgManager === 'yarn'
    ? 'yarn install --frozen-lockfile'
    : 'npm install';

  console.log(pc.dim(`Running ${pkgManager} install...`));
  const install = await sandbox.runCommand('bash', ['-c', `${installCmd} 2>&1 | tail -10`]);
  console.log(pc.dim(await install.stdout()));

  console.log(pc.dim('Taking snapshot...'));
  const snap = await (sandbox as unknown as { snapshot(): Promise<{ snapshotId: string }> }).snapshot();

  // Save to .agentnetes/snapshot.json
  const dir = join(process.cwd(), '.agentnetes');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'snapshot.json'), JSON.stringify({
    snapshotId: snap.snapshotId,
    repoUrl,
    createdAt: new Date().toISOString(),
  }, null, 2));

  // Add to .gitignore
  const gitignorePath = join(process.cwd(), '.gitignore');
  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, 'utf-8');
    if (!content.includes('.agentnetes/')) {
      appendFileSync(gitignorePath, '\n.agentnetes/\n');
    }
  }

  console.log('');
  console.log(pc.bold(pc.green('Snapshot created!')));
  console.log(pc.dim('ID: ') + snap.snapshotId);
  console.log(pc.dim('Saved to .agentnetes/snapshot.json'));
  console.log('');
  console.log('Future runs will use this snapshot automatically (near-instant start).');

  await sandbox.stop();
}

export async function snapshotList(): Promise<void> {
  console.log('');
  console.log(pc.bold('Available snapshots'));
  console.log('');
  // Use the Vercel Sandbox API to list snapshots
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    console.error(pc.red('Error: VERCEL_TOKEN environment variable is not set.'));
    process.exit(1);
    return;
  }
  const resp = await fetch('https://api.vercel.com/v1/sandbox/snapshots', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    console.error(pc.red(`Error fetching snapshots: ${resp.status} ${resp.statusText}`));
    process.exit(1);
    return;
  }
  const data = await resp.json() as { snapshots: Array<{ id: string; createdAt: string; sizeBytes: number }> };
  for (const snap of data.snapshots) {
    console.log(pc.cyan(snap.id));
    console.log(pc.dim(`  Created: ${new Date(snap.createdAt).toLocaleString()}`));
    console.log(pc.dim(`  Size:    ${Math.round(snap.sizeBytes / 1024 / 1024)} MB`));
    console.log('');
  }
}
