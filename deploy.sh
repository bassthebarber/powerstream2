set -e
#!/bin/bash

echo "🚀 DEPLOY STARTING..."

cd /var/www/powerstream_live

git pull origin main

# CHANGE THIS LINE TO MATCH YOUR STRUCTURE
cd frontend || { echo "❌ FRONTEND NOT FOUND"; exit 1; }

echo "📦 Installing..."
npm install

echo "🏗 Building..."
npm run build

echo "🧹 Cleaning old site..."
rm -rf /var/www/html/*

echo "📂 Deploying..."
cp -r dist/* /var/www/html/

echo "🔁 Restarting backend..."
pm2 restart all

echo "✅ DEPLOY COMPLETE"
