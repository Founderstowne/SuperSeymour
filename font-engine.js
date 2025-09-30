// SuperSeymour Font Engine
// Store and serve webfonts from IndexedDB
// Transform any website's typography instantly

(function() {
  'use strict';

  window.SeymourFonts = {
    // Available font collections
    collections: {
      'elegant': {
        name: 'Elegant Reading',
        primary: 'Libre Baskerville',
        secondary: 'Gelasio',
        mono: 'Courier Prime',
        description: 'Classic, sophisticated typography'
      },
      'modern': {
        name: 'Modern Clean',
        primary: 'Inter',
        secondary: 'Montserrat',
        mono: 'Courier Prime',
        description: 'Clean, minimal, professional'
      },
      'playful': {
        name: 'Playful Fun',
        primary: 'Fredoka',
        secondary: 'Patrick Hand',
        mono: 'Courier Prime',
        description: 'Friendly, approachable, fun'
      },
      'futuristic': {
        name: 'Cyber Future',
        primary: 'Orbitron',
        secondary: 'Inter',
        mono: 'Courier Prime',
        description: 'Tech, space, future'
      }
    },

    // Font data cache
    fontCache: new Map(),

    // Initialize font engine
    async init() {
      // Check if fonts are cached in IndexedDB
      const cached = await this.loadFromCache();
      if (cached) {
        console.log('SeymourFonts: Loaded from cache');
        this.fontCache = new Map(cached);
      } else {
        console.log('SeymourFonts: Ready to load fonts on demand');
      }
    },

    // Load fonts from IndexedDB
    async loadFromCache() {
      return new Promise((resolve) => {
        const request = indexedDB.open('SuperSeymour', 1);

        request.onerror = () => resolve(null);

        request.onsuccess = (event) => {
          const db = event.target.result;

          if (!db.objectStoreNames.contains('fonts')) {
            resolve(null);
            return;
          }

          const transaction = db.transaction(['fonts'], 'readonly');
          const store = transaction.objectStore('fonts');
          const getRequest = store.getAll();

          getRequest.onsuccess = () => {
            const fonts = getRequest.result;
            if (fonts && fonts.length > 0) {
              const cache = new Map();
              fonts.forEach(font => {
                cache.set(font.name, font.data);
              });
              resolve(cache);
            } else {
              resolve(null);
            }
          };
          getRequest.onerror = () => resolve(null);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('fonts')) {
            db.createObjectStore('fonts', { keyPath: 'name' });
          }
        };
      });
    },

    // Save font to IndexedDB
    async saveToCache(fontName, fontData) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('SuperSeymour', 1);

        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['fonts'], 'readwrite');
          const store = transaction.objectStore('fonts');

          store.put({
            name: fontName,
            data: fontData,
            timestamp: Date.now()
          });

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
      });
    },

    // Load font from URL and convert to base64
    async loadFont(url, fontName) {
      try {
        // Check cache first
        if (this.fontCache.has(fontName)) {
          return this.fontCache.get(fontName);
        }

        // Fetch font file
        const response = await fetch(url);
        const blob = await response.blob();

        // Convert to base64
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result;
            this.fontCache.set(fontName, base64);
            this.saveToCache(fontName, base64);
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Failed to load font:', error);
        return null;
      }
    },

    // Apply font collection to page
    async applyCollection(collectionName) {
      const collection = this.collections[collectionName];
      if (!collection) return;

      // Create style element
      const styleId = 'seymour-fonts-' + collectionName;
      let style = document.getElementById(styleId);

      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }

      // Build font-face rules (using fallback URLs for now)
      // In production, these would be loaded from your server
      let css = `
        /* SuperSeymour Font Collection: ${collection.name} */

        @font-face {
          font-family: 'Seymour-Primary';
          src: local('${collection.primary}'),
               url('https://fonts.gstatic.com/s/librebaskerville/v7/kmKnZrc3Hgbbcjq75U4uslyuy4kn0qNZaxMaC82U.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }

        @font-face {
          font-family: 'Seymour-Secondary';
          src: local('${collection.secondary}'),
               url('https://fonts.gstatic.com/s/montserrat/v15/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }

        @font-face {
          font-family: 'Seymour-Mono';
          src: local('${collection.mono}'),
               url('https://fonts.gstatic.com/s/courierprime/v2/u-450q2lgwslOqpF_6gQ8kELWwZjW-_-tvg.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }

        /* Apply fonts to elements */
        body, p, div, span, li, td, th {
          font-family: 'Seymour-Primary', Georgia, serif !important;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: 'Seymour-Secondary', Helvetica, sans-serif !important;
          letter-spacing: -0.02em !important;
        }

        code, pre, .code, .monospace {
          font-family: 'Seymour-Mono', 'Courier New', monospace !important;
        }

        /* Improve readability */
        body {
          line-height: 1.6 !important;
          text-rendering: optimizeLegibility !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }

        p {
          line-height: 1.7 !important;
          margin-bottom: 1.2em !important;
        }

        /* Better spacing */
        h1 { font-size: 2.5em !important; margin: 0.67em 0 !important; }
        h2 { font-size: 2em !important; margin: 0.75em 0 !important; }
        h3 { font-size: 1.5em !important; margin: 0.83em 0 !important; }
      `;

      style.innerHTML = css;

      // Show notification
      if (window.SeymourCore && window.SeymourCore.showNotification) {
        window.SeymourCore.showNotification(`Typography: ${collection.name} ✨`);
      }
    },

    // Remove all font transformations
    removeAll() {
      Object.keys(this.collections).forEach(name => {
        const styleId = 'seymour-fonts-' + name;
        const style = document.getElementById(styleId);
        if (style) style.remove();
      });
    },

    // Create font showcase
    createShowcase() {
      const showcase = document.createElement('div');
      showcase.id = 'seymour-font-showcase';
      showcase.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        padding: 30px;
        z-index: 9999999;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
      `;

      let showcaseHTML = `
        <h2 style="color: #764ba2; margin: 0 0 20px;">SuperSeymour Typography</h2>
        <p style="color: #666; margin-bottom: 20px;">Transform any website's typography instantly</p>
      `;

      Object.entries(this.collections).forEach(([key, collection]) => {
        showcaseHTML += `
          <div style="margin: 15px 0; padding: 15px; border: 1px solid #eee; border-radius: 10px;">
            <h3 style="margin: 0 0 5px; color: #333;">${collection.name}</h3>
            <p style="margin: 0 0 10px; color: #666; font-size: 14px;">${collection.description}</p>
            <button onclick="window.SeymourFonts.applyCollection('${key}')"
                    style="padding: 8px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                           color: white; border: none; border-radius: 8px; cursor: pointer;
                           font-weight: 600;">
              Apply This Style
            </button>
          </div>
        `;
      });

      showcaseHTML += `
        <button onclick="window.SeymourFonts.removeAll(); this.parentElement.remove();"
                style="margin-top: 20px; padding: 10px 20px; background: #f0f0f0;
                       border: none; border-radius: 8px; cursor: pointer; width: 100%;">
          Reset to Original
        </button>
      `;

      showcase.innerHTML = showcaseHTML;
      document.body.appendChild(showcase);
    }
  };

  // Add font transformation to SeymourCore if it exists
  if (window.SeymourCore && window.SeymourCore.transformations) {
    window.SeymourCore.transformations.typography = {
      name: 'Typography Magic',
      description: 'Transform fonts to beautiful typography',
      icon: '🎨',
      execute() {
        window.SeymourFonts.createShowcase();
      },
      destroy() {
        const showcase = document.getElementById('seymour-font-showcase');
        if (showcase) showcase.remove();
        window.SeymourFonts.removeAll();
      }
    };
  }

  // Initialize font engine
  window.SeymourFonts.init();

})();