import { tool } from 'ai';
import { z } from 'zod';
import type { Sandbox } from '@vercel/sandbox';

/**
 * Creates the two-tool MCP surface for a worker agent.
 * search() and execute() are backed by a real Firecracker sandbox.
 * Combined footprint is ~1,000 tokens regardless of codebase size.
 */
export function createAgentTools(sandbox: Sandbox) {
  const search = tool({
    description:
      'Search for patterns across the codebase. Returns matching file paths. ' +
      'Use this to locate where interfaces, types, functions, and patterns are defined.',
    inputSchema: z.object({
      pattern: z.string().describe('The regex or literal pattern to search for'),
      path: z.string().optional().describe('Directory to search in (default: current dir)'),
      fileGlob: z.string().optional().describe('Glob for file types, e.g. "*.ts" or "*.json"'),
    }),
    execute: async ({ pattern, path = '.', fileGlob }) => {
      const include = fileGlob ? `--include="${fileGlob}"` : '';
      const cmd = `grep -r ${JSON.stringify(pattern)} ${path} ${include} -l 2>/dev/null | head -40 || true`;
      const result = await sandbox.runCommand('bash', ['-c', cmd]);
      const out = (await result.stdout()).trim();
      return out || '(no matches)';
    },
  });

  const execute = tool({
    description:
      'Execute any shell command in the isolated sandbox. ' +
      'Use to read files (cat), list directories (ls/find), ' +
      'run tests (vitest), compile (tsc), write files (tee), install packages, etc.',
    inputSchema: z.object({
      command: z.string().describe('The shell command to execute'),
    }),
    execute: async ({ command }) => {
      const cmd = `(${command}) 2>&1 | head -200`;
      const result = await sandbox.runCommand('bash', ['-c', cmd]);
      const output = (await result.stdout()).trim();
      return {
        output: output || '(no output)',
        exitCode: result.exitCode,
      };
    },
  });

  return { search, execute };
}
