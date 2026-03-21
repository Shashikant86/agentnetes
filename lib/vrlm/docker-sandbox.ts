import { execSync } from 'child_process';

const DOCKER_IMAGE = 'node:20-alpine';

/**
 * Docker sandbox — each agent gets its own container with the repo cloned in.
 * Requires Docker to be running locally. No cloud accounts needed.
 */
export class DockerSandbox {
  public id: string;
  private containerId: string;

  constructor(containerId: string) {
    this.containerId = containerId;
    this.id = `docker-${containerId.slice(0, 12)}`;
  }

  async runCommand(_shell: string, args: string[]): Promise<{
    stdout: () => Promise<string>;
    exitCode: number;
  }> {
    const cmd = args.join(' ');
    try {
      const output = execSync(
        `docker exec ${this.containerId} sh -c ${JSON.stringify(cmd)}`,
        { encoding: 'utf-8', timeout: 60_000 },
      );
      return { stdout: async () => output ?? '', exitCode: 0 };
    } catch (err: any) {
      const out = ((err.stdout ?? '') + (err.stderr ?? '')) || (err.message ?? '');
      return { stdout: async () => out, exitCode: err.status ?? 1 };
    }
  }

  async readFile({ path }: { path: string }): Promise<AsyncIterable<Buffer> | null> {
    try {
      const content = execSync(`docker exec ${this.containerId} cat ${path}`, {
        timeout: 10_000,
      });
      async function* gen() { yield content; }
      return gen();
    } catch {
      return null;
    }
  }

  async stop(): Promise<void> {
    try {
      execSync(`docker rm -f ${this.containerId}`, { stdio: 'ignore' });
    } catch { /* best-effort */ }
  }
}

export async function createDockerSandbox(repoUrl: string): Promise<DockerSandbox> {
  // Start a detached container
  const containerId = execSync(
    `docker run -d --rm ${DOCKER_IMAGE} sh -c "sleep 3600"`,
    { encoding: 'utf-8' },
  ).trim();

  // Install git (alpine uses apk, much faster than apt-get)
  execSync(
    `docker exec ${containerId} sh -c "apk add --no-cache git 2>/dev/null"`,
    { timeout: 30_000, stdio: 'ignore' },
  );

  // Clone the repo
  execSync(
    `docker exec ${containerId} git clone --depth 1 ${repoUrl} /workspace`,
    { timeout: 120_000, stdio: 'ignore' },
  );

  return new DockerSandbox(containerId);
}
