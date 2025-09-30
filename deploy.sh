#!/bin/bash

# SuperSeymour Deployment Script
# Usage: ./deploy.sh SERVER_IP [USERNAME]

SERVER_IP=${1:-}
USERNAME=${2:-root}
WEB_ROOT="/var/www/html"

if [ -z "$SERVER_IP" ]; then
    echo "Usage: ./deploy.sh SERVER_IP [USERNAME]"
    echo "Example: ./deploy.sh 142.93.XXX.XXX root"
    exit 1
fi

echo "🚀 Deploying SuperSeymour to $USERNAME@$SERVER_IP"
echo "================================================"

# Create images directory on server
echo "📁 Creating directories on server..."
ssh $USERNAME@$SERVER_IP "mkdir -p $WEB_ROOT/images"

# Upload main files
echo "📤 Uploading index.html..."
scp index.html $USERNAME@$SERVER_IP:$WEB_ROOT/

echo "📤 Uploading logo..."
scp images/Seymour-logo-stroke.svg $USERNAME@$SERVER_IP:$WEB_ROOT/images/

# Set proper permissions
echo "🔒 Setting permissions..."
ssh $USERNAME@$SERVER_IP "chmod 644 $WEB_ROOT/index.html $WEB_ROOT/images/Seymour-logo-stroke.svg"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Visit https://superseymour.com to see your site"
echo "📌 Test the bookmarklet by dragging it to your bookmarks bar"
echo ""
echo "Files deployed:"
echo "  - index.html"
echo "  - images/Seymour-logo-stroke.svg"