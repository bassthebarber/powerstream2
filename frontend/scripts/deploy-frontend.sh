#!/usr/bin/env bash
# Run on the Linux server after `npm run build` (or rsync dist from CI).
# Usage: sudo bash scripts/deploy-frontend.sh   (from repo frontend/ or adjust paths)

set -euo pipefail

FRONTEND_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="${FRONTEND_ROOT}/dist"
TARGET="/var/www/powerstream"

echo "[deploy] Validating env..."
cd "$FRONTEND_ROOT"
npm run validate-env

echo "[deploy] Cleaning dist..."
rm -rf "$DIST"

echo "[deploy] Building..."
npm run build

echo "[deploy] Syncing to ${TARGET}..."
sudo mkdir -p "$TARGET"
sudo rsync -a --delete "${DIST}/" "${TARGET}/"

echo "[deploy] Restarting nginx..."
sudo systemctl restart nginx

echo "Frontend deployed with env injection complete"
