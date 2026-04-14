#!/usr/bin/env bash
set -e

APP_ROOT="/var/www/powerstream_live/Powerstream"
FRONTEND_DIR="$APP_ROOT/frontend"
LIVE_DIR="/var/www/html"

echo "==> Deploy starting..."

cd "$APP_ROOT"

echo "==> Pulling latest code"
git pull origin main

echo "==> Installing backend deps"
cd backend || true
npm install --production || true

echo "==> Building frontend"
cd "$FRONTEND_DIR"
npm install
npm run build

echo "==> Publishing to nginx"
rm -rf "$LIVE_DIR"/*
cp -r dist/* "$LIVE_DIR"/

echo "==> Restarting services"
pm2 restart all || true
systemctl restart nginx

echo "==> DONE"
