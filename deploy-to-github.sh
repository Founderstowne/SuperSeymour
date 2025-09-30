#!/bin/bash

# SuperSeymour GitHub Pages Deployment Script
# This script helps you push updates to GitHub Pages

echo "🌈 SuperSeymour GitHub Deployment"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git branch -M main

    echo ""
    echo "📝 Please enter your GitHub repository URL:"
    echo "   Example: https://github.com/YOUR_USERNAME/superseymour.git"
    read -p "Repository URL: " repo_url

    git remote add origin "$repo_url"
    echo "✅ Git repository initialized!"
else
    echo "✅ Git repository already initialized"
fi

# Check for changes
if [[ -n $(git status -s) ]]; then
    echo ""
    echo "📦 Files to deploy:"
    git status -s

    echo ""
    read -p "Enter commit message: " commit_msg

    # Add and commit
    git add activation-poc.js
    git add github-bookmarklet-installer.html
    git add github-pages-setup.md

    git commit -m "$commit_msg"

    # Push to GitHub
    echo ""
    echo "🚀 Pushing to GitHub Pages..."
    git push -u origin main

    echo ""
    echo "✨ Deployment complete!"
    echo ""
    echo "Your SuperSeymour will be live at:"
    echo "👉 https://YOUR_USERNAME.github.io/superseymour/activation-poc.js"
    echo ""
    echo "Note: It may take 1-2 minutes for changes to appear."
else
    echo "✅ No changes to deploy. Everything is up to date!"
fi

echo ""
echo "🌈 Happy building!"