#!/bin/bash

echo "🌈 SuperSeymour Safe Push to GitHub"
echo "==================================="

# Files we want to push
FILES=(
    "activation-poc.js"
    "founderstowne-installer.html"
    "github-bookmarklet-installer.html"
    "resilient-bookmarklet-installer.html"
    "github-pages-setup.md"
    "deploy-everywhere.sh"
)

echo "📦 Preparing clean push with essential files only..."

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "Created temp directory: $TEMP_DIR"

# Copy only safe files
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$TEMP_DIR/"
        echo "✅ Copied: $file"
    else
        echo "⚠️  Skipped (not found): $file"
    fi
done

# Initialize new git repo in temp dir
cd "$TEMP_DIR"
git init
git remote add origin https://github.com/Founderstowne/SuperSeymour.git

# Add and commit
git add .
git commit -m "SuperSeymour deployment - Clean version without sensitive data"

echo ""
echo "📝 Repository prepared. To push:"
echo "1. cd $TEMP_DIR"
echo "2. git push origin main --force"
echo ""
echo "⚠️  This will overwrite the GitHub repo with clean files only."
echo "Make sure you have push access to Founderstowne/SuperSeymour"