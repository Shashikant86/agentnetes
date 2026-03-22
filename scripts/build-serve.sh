#!/usr/bin/env bash
# Build the Next.js standalone output and copy it into the CLI package.
# Run from the repo root: bash scripts/build-serve.sh
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI_WEB="$REPO_ROOT/packages/cli/web"

echo "Building Next.js standalone..."
BUILD_STANDALONE=true npx next build

echo "Copying standalone output to packages/cli/web..."
rm -rf "$CLI_WEB"
cp -r "$REPO_ROOT/.next/standalone" "$CLI_WEB"

# Static assets and public dir must sit alongside server.js
cp -r "$REPO_ROOT/.next/static" "$CLI_WEB/.next/static"
cp -r "$REPO_ROOT/public" "$CLI_WEB/public"

# Safety check: make sure no .env files ended up in the output
ENV_FILES=$(find "$CLI_WEB" -name ".env*" 2>/dev/null)
if [ -n "$ENV_FILES" ]; then
  echo ""
  echo "ERROR: .env files found in the standalone output — aborting!"
  echo "$ENV_FILES"
  rm -rf "$CLI_WEB"
  exit 1
fi

echo "Done. Standalone web UI is at packages/cli/web/"
echo "Size: $(du -sh "$CLI_WEB" | cut -f1)"
