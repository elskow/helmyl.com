#!/bin/sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/apps/web"

mkdir -p "$WEB/src/lib/generated"
npx tsx "$ROOT/apps/scripts/generate-labs-metadata.ts" --out "$WEB/src/lib/generated/labs-metadata.json"

cd "$WEB"
npx astro build
cp public/_headers public/_redirects public/_routes.json dist/
