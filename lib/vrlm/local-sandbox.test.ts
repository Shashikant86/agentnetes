import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalSandbox } from './local-sandbox';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('LocalSandbox', () => {
  let dir: string;
  let sandbox: LocalSandbox;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'sandbox-test-'));
    sandbox = new LocalSandbox(dir);
  });

  afterEach(() => {
    try { rmSync(dir, { recursive: true, force: true }); } catch {}
  });

  describe('runCommand', () => {
    it('uses the shell argument to execute commands', async () => {
      const result = await sandbox.runCommand('bash', ['-c', 'echo hello']);
      const output = await result.stdout();
      expect(output.trim()).toBe('hello');
      expect(result.exitCode).toBe(0);
    });

    it('runs in the sandbox directory', async () => {
      writeFileSync(join(dir, 'marker.txt'), 'found');
      const result = await sandbox.runCommand('bash', ['-c', 'cat marker.txt']);
      const output = await result.stdout();
      expect(output.trim()).toBe('found');
    });

    it('returns non-zero exit code on failure', async () => {
      const result = await sandbox.runCommand('bash', ['-c', 'exit 42']);
      expect(result.exitCode).toBe(42);
    });

    it('works without a shell argument', async () => {
      const result = await sandbox.runCommand('', ['echo', 'hi']);
      const output = await result.stdout();
      expect(output.trim()).toBe('hi');
    });
  });

  describe('readFile', () => {
    it('reads a file by absolute path', async () => {
      const filePath = join(dir, 'test.txt');
      writeFileSync(filePath, 'absolute content');
      const stream = await sandbox.readFile({ path: filePath });
      expect(stream).not.toBeNull();
      const chunks: Buffer[] = [];
      for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
      expect(Buffer.concat(chunks).toString()).toBe('absolute content');
    });

    it('resolves relative paths against sandbox dir', async () => {
      writeFileSync(join(dir, 'relative.txt'), 'relative content');
      const stream = await sandbox.readFile({ path: 'relative.txt' });
      expect(stream).not.toBeNull();
      const chunks: Buffer[] = [];
      for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
      expect(Buffer.concat(chunks).toString()).toBe('relative content');
    });

    it('returns null for missing files', async () => {
      const stream = await sandbox.readFile({ path: '/nonexistent/file.txt' });
      expect(stream).toBeNull();
    });
  });

  describe('stop', () => {
    it('removes the sandbox directory', async () => {
      await sandbox.stop();
      const { existsSync } = await import('fs');
      expect(existsSync(dir)).toBe(false);
    });
  });
});
