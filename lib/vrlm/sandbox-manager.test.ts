import { describe, it, expect } from 'vitest';
import { collectNewFiles, stopSandbox } from './sandbox-manager';
import { LocalSandbox } from './local-sandbox';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('collectNewFiles', () => {
  it('finds files in the given directory via the sandbox', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'collect-test-'));
    const sub = join(dir, 'src');
    mkdirSync(sub);
    writeFileSync(join(sub, 'index.ts'), 'export const x = 1;');
    writeFileSync(join(sub, 'util.js'), 'module.exports = {}');

    const sandbox = new LocalSandbox(dir);
    // collectNewFiles scans *inside* the sandbox using the sandbox's runCommand
    const files = await collectNewFiles(sandbox, dir, ['ts', 'js']);

    expect(files.length).toBeGreaterThanOrEqual(2);
    const names = files.map(f => f.path.split('/').pop());
    expect(names).toContain('index.ts');
    expect(names).toContain('util.js');

    rmSync(dir, { recursive: true, force: true });
  });

  it('returns empty array when directory has no matching files', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'collect-empty-'));
    writeFileSync(join(dir, 'readme.txt'), 'nothing here');

    const sandbox = new LocalSandbox(dir);
    const files = await collectNewFiles(sandbox, dir, ['ts']);
    expect(files).toEqual([]);

    rmSync(dir, { recursive: true, force: true });
  });
});

describe('stopSandbox', () => {
  it('calls stop on the sandbox without throwing', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'stop-test-'));
    const sandbox = new LocalSandbox(dir);
    // Should not throw even on a valid sandbox
    await expect(stopSandbox(sandbox)).resolves.toBeUndefined();
  });

  it('swallows errors from stop()', async () => {
    // Sandbox with already-deleted dir — stop() should not throw
    const sandbox = new LocalSandbox('/nonexistent/path');
    await expect(stopSandbox(sandbox)).resolves.toBeUndefined();
  });
});
