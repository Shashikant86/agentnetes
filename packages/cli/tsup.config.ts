import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node20',
  outDir: 'dist',
  bundle: true,
  clean: true,
  banner: { js: '#!/usr/bin/env node' },
  // Keep optional cloud sandbox packages external (not everyone needs them)
  external: ['@vercel/sandbox', 'e2b', '@daytonaio/sdk'],
  // tsup runs from packages/cli, so ../../lib/* paths resolve to root lib/
  tsconfig: 'tsconfig.json',
});
