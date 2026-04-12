#!/bin/bash
# ============================================
# POWERSTREAM SUPER DEPLOY SCRIPT
# One-command deployment to production
# ============================================

# ⚠️ REPLACE WITH YOUR ACTUAL SERVER IP
SERVER_IP="YOUR_SERVER_IP"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying PowerStream to production ($SERVER_IP)...${NC}"
echo ""

# Check if IP is set
if [ "$SERVER_IP" == "YOUR_SERVER_IP" ]; then
    echo -e "${RED}❌ ERROR: Please set your SERVER_IP in this script${NC}"
    echo "   Edit deploy.sh and replace YOUR_SERVER_IP with your actual IP"
    exit 1
fi

ssh root@$SERVER_IP << 'EOF'
echo ""
echo "📂 Navigating to project..."
cd /var/www/PowerStreamMain || cd /var/www/powerstream || { echo "❌ Project folder not found!"; exit 1; }

echo ""
echo "📥 Pulling code updates..."
git pull origin main || git pull origin master

echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

echo ""
echo "🏗️ Installing frontend dependencies and building..."
cd ../frontend
npm install
npm run build

echo ""
echo "🔄 Restarting PM2 services..."
cd ..
pm2 restart all

echo ""
echo "🔁 Reloading NGINX..."
nginx -s reload 2>/dev/null || systemctl restart nginx

echo ""
echo "📊 Current Status:"
pm2 status

echo ""
echo "🧪 Health Check:"
curl -s http://localhost:5001/api/health | head -c 200

echo ""
echo "============================================"
echo "🎉 POWERSTREAM DEPLOY COMPLETE!"
echo "============================================"
EOF

echo ""
echo -e "${GREEN}✅ Deployment finished!${NC}"










