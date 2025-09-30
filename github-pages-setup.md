# SuperSeymour GitHub Pages Setup

## Quick Setup (5 minutes)

### 1. Create GitHub Repository
- Go to https://github.com/new
- Name: `superseymour` (or whatever you want)
- Make it **Public** (required for GitHub Pages)
- Don't initialize with README

### 2. Push Your Code
```bash
cd /Users/markusallen/Code/Founderstowne/SuperSeymour
git init
git add activation-poc.js
git commit -m "SuperSeymour activation code"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/superseymour.git
git push -u origin main
```

### 3. Enable GitHub Pages
- Go to your repo's Settings → Pages
- Source: Deploy from a branch
- Branch: main
- Folder: / (root)
- Click Save

### 4. Your Files Are Now Live!
After ~1 minute, your file will be available at:
```
https://YOUR_USERNAME.github.io/superseymour/activation-poc.js
```

## The Tiny Bookmarklet

Now your bookmarklet is just ~200 bytes instead of 82KB:

```javascript
javascript:(function(){
    if(window.SuperSeymourActive)return;
    var s=document.createElement('script');
    s.src='https://YOUR_USERNAME.github.io/superseymour/activation-poc.js?v='+Date.now();
    s.onload=()=>window.SuperSeymourActive=true;
    document.head.appendChild(s);
})();
```

## Updating SuperSeymour

Just push changes to GitHub:
```bash
# Edit activation-poc.js locally
git add activation-poc.js
git commit -m "Updated features"
git push
```

Changes appear within ~1-2 minutes!

## Pro Tips

1. **Version Control**: Your code is now backed up on GitHub
2. **Share Easily**: Send anyone the bookmarklet link
3. **CDN Speed**: GitHub Pages uses Fastly CDN - it's FAST
4. **Free Forever**: GitHub Pages is free for public repos
5. **Custom Domain**: You can even use your own domain later

## Why This Is Perfect

✅ Tiny bookmarklet (200 bytes vs 82KB)
✅ Update anywhere just by pushing to git
✅ Works offline once cached
✅ Professional hosting (GitHub's infrastructure)
✅ Version history built-in
✅ Mom-test approved - just drag bookmark once