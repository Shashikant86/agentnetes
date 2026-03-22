import { describe, it, expect } from 'vitest';
import { LocalSandbox } from './local-sandbox';

/**
 * Tests for the workspace path resolution logic used in runtime.ts runWorker().
 * The actual runtime requires LLM keys so we test the path logic in isolation.
 */
describe('workspace path resolution', () => {
  function resolveWorkDir(sandbox: unknown): string {
    // Mirror the logic from runtime.ts runWorker()
    return 'dir' in (sandbox as object) ? (sandbox as any).dir
      : 'containerId' in (sandbox as object) ? '/workspace'
      : '/vercel/sandbox';
  }

  it('resolves LocalSandbox to its dir property', () => {
    const sandbox = new LocalSandbox('/tmp/test-sandbox');
    expect(resolveWorkDir(sandbox)).toBe('/tmp/test-sandbox');
  });

  it('resolves DockerSandbox (has containerId) to /workspace', () => {
    const sandbox = { containerId: 'abc123', runCommand: async () => {}, readFile: async () => null, stop: async () => {} };
    expect(resolveWorkDir(sandbox)).toBe('/workspace');
  });

  it('resolves Vercel sandbox (neither dir nor containerId) to /vercel/sandbox', () => {
    const sandbox = { id: 'sbx_123', runCommand: async () => {}, readFile: async () => null, stop: async () => {} };
    expect(resolveWorkDir(sandbox)).toBe('/vercel/sandbox');
  });
});
