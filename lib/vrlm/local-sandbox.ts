import { execSync, execFileSync } from 'child_process';
import { readFileSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Local sandbox — runs shell commands in a cloned repo on the local machine.
 * Drop-in replacement for @vercel/sandbox when running without Vercel.
 */
export class LocalSandbox {
  public id = 'local';
  public dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  async runCommand(shell: string, args: string[]): Promise<{
    stdout: () => Promise<string>;
    exitCode: number;
  }> {
    try {
      // When a shell is specified (e.g. 'bash', ['-c', 'echo hello']),
      // use execFileSync to pass args as a proper argv array.
      // Without a shell, join args into a single string for execSync.
      const output = shell
        ? execFileSync(shell, args, {
            cwd: this.dir,
            encoding: 'utf-8',
            timeout: 60_000,
            stdio: ['ignore', 'pipe', 'pipe'],
          })
        : execSync(args.join(' '), {
            cwd: this.dir,
            encoding: 'utf-8',
            timeout: 60_000,
            stdio: ['ignore', 'pipe', 'pipe'],
          });
      return { stdout: async () => output ?? '', exitCode: 0 };
    } catch (err: any) {
      const out = ((err.stdout ?? '') + (err.stderr ?? '')) || (err.message ?? '');
      return { stdout: async () => out, exitCode: err.status ?? 1 };
    }
  }

  async readFile({ path: filePath }: { path: string }): Promise<AsyncIterable<Buffer> | null> {
    try {
      const resolved = filePath.startsWith('/') ? filePath : join(this.dir, filePath);
      const content = readFileSync(resolved);
      async function* gen() { yield content; }
      return gen();
    } catch {
      return null;
    }
  }

  async stop() {
    // best-effort cleanup of temp dir
    try { rmSync(this.dir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

/**
 * Create a local sandbox by cloning the repo into a temp directory.
 */
export async function createLocalSandbox(repoUrl: string): Promise<LocalSandbox> {
  const dir = mkdtempSync(join(tmpdir(), 'agentnetes-'));
  execSync(`git clone --depth 1 ${repoUrl} .`, {
    cwd: dir,
    timeout: 120_000,
    stdio: 'ignore',
  });
  return new LocalSandbox(dir);
}
