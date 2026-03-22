import { LocalSandbox, createLocalSandbox } from './local-sandbox';
import { DockerSandbox, createDockerSandbox } from './docker-sandbox';

// Unified sandbox type used across the runtime
export type AnySandbox = LocalSandbox | DockerSandbox | import('@vercel/sandbox').Sandbox;

export interface RunResult {
  output: string;
  exitCode: number;
}

/**
 * Detect which sandbox provider to use based on environment variables.
 *
 * Priority:
 *   1. SANDBOX_PROVIDER=vercel  → Vercel Firecracker (requires VERCEL_TOKEN or OIDC)
 *   2. SANDBOX_PROVIDER=e2b     → E2B (requires E2B_API_KEY)
 *   3. SANDBOX_PROVIDER=daytona → Daytona (requires DAYTONA_API_KEY)
 *   4. SANDBOX_PROVIDER=local   → Local shell in a temp dir (no auth needed)
 *   5. Auto-detect: Vercel env present → vercel, else local
 */
function detectProvider(): 'vercel' | 'e2b' | 'daytona' | 'docker' | 'local' {
  const explicit = process.env.SANDBOX_PROVIDER?.toLowerCase();
  if (explicit === 'vercel')  return 'vercel';
  if (explicit === 'e2b')     return 'e2b';
  if (explicit === 'daytona') return 'daytona';
  if (explicit === 'docker')  return 'docker';
  if (explicit === 'local')   return 'local';
  // Auto-detect
  if (process.env.VERCEL_TOKEN || process.env.VERCEL) return 'vercel';
  if (process.env.E2B_API_KEY)                        return 'e2b';
  if (process.env.DAYTONA_API_KEY)                    return 'daytona';
  return 'docker'; // default to docker for local demo
}

export async function createWorkerSandbox(repoUrl: string, snapshotId?: string, providerOverride?: string): Promise<AnySandbox> {
  const provider = providerOverride as ReturnType<typeof detectProvider> ?? detectProvider();

  if (provider === 'vercel') {
    const { Sandbox } = await import('@vercel/sandbox');
    if (snapshotId) {
      return Sandbox.create({ source: { type: 'snapshot', snapshotId }, timeout: 10 * 60 * 1000 });
    }
    return Sandbox.create({ source: { type: 'git', url: repoUrl, depth: 1 }, timeout: 10 * 60 * 1000 });
  }

  if (provider === 'e2b') {
    // npm install e2b to enable
    console.warn('[sandbox] e2b: install the "e2b" package to use this provider. Falling back to local.');
  }

  if (provider === 'daytona') {
    // npm install @daytonaio/sdk to enable
    console.warn('[sandbox] daytona: install the "@daytonaio/sdk" package to use this provider. Falling back to local.');
  }

  if (provider === 'docker') {
    return createDockerSandbox(repoUrl);
  }

  // Local fallback — runs real shell commands in a cloned temp dir
  return createLocalSandbox(repoUrl);
}

// ── Shared utilities ─────────────────────────────────────────────────────────

export async function collectNewFiles(
  sandbox: AnySandbox,
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

export async function stopSandbox(sandbox: AnySandbox): Promise<void> {
  try { await sandbox.stop(); } catch { /* best-effort */ }
}
