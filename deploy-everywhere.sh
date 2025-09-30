#!/bin/bash

# SuperSeymour Multi-Server Deployment Script
# Deploy to multiple backup servers simultaneously

echo "🛡️  SuperSeymour Resilient Deployment System"
echo "==========================================="
echo ""

# Color codes for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if activation-poc.js exists
if [ ! -f "activation-poc.js" ]; then
    echo -e "${RED}❌ Error: activation-poc.js not found${NC}"
    exit 1
fi

echo "📦 File to deploy: activation-poc.js"
echo "📏 File size: $(wc -c < activation-poc.js) bytes"
echo ""

# Track deployment status
DEPLOYED_TO=""
FAILED=""

# 1. GitHub Pages
echo -e "${YELLOW}1. GitHub Pages${NC}"
if git status >/dev/null 2>&1; then
    git add activation-poc.js
    git commit -m "Update SuperSeymour $(date +%Y.%m.%d.%H%M)" 2>/dev/null
    if git push origin main 2>/dev/null; then
        echo -e "${GREEN}   ✅ Deployed to GitHub Pages${NC}"
        DEPLOYED_TO="$DEPLOYED_TO\n   - https://YOUR_USERNAME.github.io/superseymour/"
    else
        echo -e "${RED}   ⚠️  Failed to push to GitHub${NC}"
        FAILED="$FAILED\n   - GitHub Pages"
    fi
else
    echo "   ⏭️  Skipping - not a git repository"
fi
echo ""

# 2. GitLab Pages (if remote exists)
echo -e "${YELLOW}2. GitLab Pages${NC}"
if git remote get-url gitlab >/dev/null 2>&1; then
    if git push gitlab main 2>/dev/null; then
        echo -e "${GREEN}   ✅ Deployed to GitLab Pages${NC}"
        DEPLOYED_TO="$DEPLOYED_TO\n   - https://YOUR_USERNAME.gitlab.io/superseymour/"
    else
        echo -e "${RED}   ⚠️  Failed to push to GitLab${NC}"
        FAILED="$FAILED\n   - GitLab Pages"
    fi
else
    echo "   ⏭️  Skipping - GitLab remote not configured"
    echo "   💡 Add with: git remote add gitlab https://gitlab.com/USERNAME/superseymour.git"
fi
echo ""

# 3. Surge.sh
echo -e "${YELLOW}3. Surge.sh${NC}"
if command -v surge >/dev/null 2>&1; then
    echo "activation-poc.js" | surge --project . --domain superseymour.surge.sh 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ Deployed to Surge.sh${NC}"
        DEPLOYED_TO="$DEPLOYED_TO\n   - https://superseymour.surge.sh/"
    else
        echo -e "${RED}   ⚠️  Failed to deploy to Surge${NC}"
        FAILED="$FAILED\n   - Surge.sh"
    fi
else
    echo "   ⏭️  Skipping - Surge not installed"
    echo "   💡 Install with: npm install -g surge"
fi
echo ""

# 4. IPFS (InterPlanetary File System)
echo -e "${YELLOW}4. IPFS (Distributed Web)${NC}"
if command -v ipfs >/dev/null 2>&1; then
    IPFS_HASH=$(ipfs add -q activation-poc.js 2>/dev/null)
    if [ $? -eq 0 ]; then
        ipfs pin add $IPFS_HASH >/dev/null 2>&1
        echo -e "${GREEN}   ✅ Deployed to IPFS${NC}"
        echo "      Hash: $IPFS_HASH"
        DEPLOYED_TO="$DEPLOYED_TO\n   - https://ipfs.io/ipfs/$IPFS_HASH"
    else
        echo -e "${RED}   ⚠️  Failed to add to IPFS${NC}"
        FAILED="$FAILED\n   - IPFS"
    fi
else
    echo "   ⏭️  Skipping - IPFS not installed"
    echo "   💡 Install from: https://ipfs.io/docs/install/"
fi
echo ""

# 5. Create a backup archive with timestamp
echo -e "${YELLOW}5. Local Backup${NC}"
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp activation-poc.js "$BACKUP_DIR/activation-poc_$TIMESTAMP.js"
echo -e "${GREEN}   ✅ Backup saved to $BACKUP_DIR/activation-poc_$TIMESTAMP.js${NC}"
echo ""

# Summary
echo "==========================================="
echo -e "${GREEN}🎯 DEPLOYMENT SUMMARY${NC}"
echo ""

if [ -n "$DEPLOYED_TO" ]; then
    echo -e "${GREEN}✅ Successfully deployed to:${NC}"
    echo -e "$DEPLOYED_TO"
    echo ""
fi

if [ -n "$FAILED" ]; then
    echo -e "${RED}❌ Failed deployments:${NC}"
    echo -e "$FAILED"
    echo ""
fi

# jsDelivr note
echo -e "${YELLOW}📌 Note: jsDelivr CDN${NC}"
echo "   Automatically mirrors from GitHub at:"
echo "   https://cdn.jsdelivr.net/gh/USERNAME/superseymour@main/activation-poc.js"
echo "   (No action needed - updates automatically)"
echo ""

# Generate stats
echo -e "${YELLOW}📊 Resilience Stats:${NC}"
TOTAL_SERVERS=7
ACTIVE_SERVERS=$(echo -e "$DEPLOYED_TO" | grep -c "https://")
echo "   Active backup servers: $ACTIVE_SERVERS/$TOTAL_SERVERS"
echo "   Redundancy level: $(( ACTIVE_SERVERS * 100 / TOTAL_SERVERS ))%"
echo ""

# Final message
if [ $ACTIVE_SERVERS -ge 3 ]; then
    echo -e "${GREEN}🛡️  Your SuperSeymour is highly resilient!${NC}"
elif [ $ACTIVE_SERVERS -ge 1 ]; then
    echo -e "${YELLOW}⚠️  Consider adding more backup servers for better resilience${NC}"
else
    echo -e "${RED}❌ No servers deployed. Please configure at least one.${NC}"
fi

echo ""
echo "🌈 Done! Your bookmarklet will automatically failover between servers."