import { Sandbox } from '@vercel/sandbox';

const SANDBOX_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export interface RunResult {
  output: string;
  exitCode: number;
}

// Creates a sandbox from snapshot (fast) or by cloning repoUrl from git (slower but always works)
export async function createWorkerSandbox(repoUrl: string, snapshotId?: string): Promise<Sandbox> {
  if (snapshotId) {
    return Sandbox.create({
      source: { type: 'snapshot', snapshotId },
      timeout: SANDBOX_TIMEOUT_MS,
    });
  }

  if (!repoUrl) {
    throw new Error('repoUrl is required when no snapshotId is provided');
  }

  return Sandbox.create({
    source: { type: 'git', url: repoUrl, depth: 1 },
    timeout: SANDBOX_TIMEOUT_MS,
  });
}

// Run a bash command, cap output at maxLines to avoid token bloat
export async function runInSandbox(
  sandbox: Sandbox,
  command: string,
  maxLines = 200,
): Promise<RunResult> {
  const cmd = `(${command}) 2>&1 | head -${maxLines}`;
  const result = await sandbox.runCommand('bash', ['-c', cmd]);
  return {
    output: (await result.stdout()).trim(),
    exitCode: result.exitCode,
  };
}

// Collect files written under dir with given extensions, read their content from sandbox
// Uses sandbox.readFile() which returns an async iterable of chunks
export async function collectNewFiles(
  sandbox: Sandbox,
  dir: string,
  extensions: string[] = ['ts', 'js', 'json', 'md'],
): Promise<Array<{ path: string; content: string }>> {
  const extList = extensions.map(e => `-name "*.${e}"`).join(' -o ');
  const findCmd = `find ${dir} \\( ${extList} \\) -type f 2>/dev/null | head -30`;
  const result = await sandbox.runCommand('bash', ['-c', findCmd]);
  const files = (await result.stdout()).trim().split('\n').filter(Boolean);

  const out: Array<{ path: string; content: string }> = [];
  for (const filePath of files) {
    const stream = await sandbox.readFile({ path: filePath });
    if (!stream) continue;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string));
    }
    out.push({ path: filePath, content: Buffer.concat(chunks).toString('utf-8') });
  }
  return out;
}

// Best-effort stop
export async function stopSandbox(sandbox: Sandbox): Promise<void> {
  try {
    await sandbox.stop();
  } catch {
    // best-effort cleanup
  }
}
