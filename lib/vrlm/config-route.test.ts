import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('api/config route', () => {
  it('uses force-static for static export compatibility', () => {
    const source = readFileSync(
      join(__dirname, '../../app/api/config/route.ts'),
      'utf-8',
    );
    expect(source).toContain("export const dynamic = 'force-static'");
  });
});

describe('cli package.json', () => {
  it('prepublishOnly runs build:serve to include web UI', () => {
    const pkg = JSON.parse(
      readFileSync(
        join(__dirname, '../../packages/cli/package.json'),
        'utf-8',
      ),
    );
    expect(pkg.scripts.prepublishOnly).toBe('npm run build:serve');
  });
});
