// SuperSeymour Privacy Destroyer
// Making surveillance capitalism extinct, one site at a time
// "Your business model is our hobby" - SuperSeymour

(function() {
  'use strict';

  window.SeymourPrivacy = {
    // Statistics
    stats: {
      adsBlocked: 0,
      cookiesEaten: 0,
      trackersKilled: 0,
      fingerprintsRandomized: 0,
      revenueDestroyed: 0 // Estimated in cents
    },

    // === AD REVENUE DESTROYER ===
    adDestroyer: {
      // Comprehensive ad selectors
      selectors: [
        // Generic ad containers
        '[class*="ad-"]', '[class*="ads-"]', '[class*="advertisement"]',
        '[id*="ad-"]', '[id*="ads-"]', '[id*="advertisement"]',
        '[class*="banner"]', '[class*="sponsor"]', '[class*="promo"]',

        // Google Ads
        '.adsbygoogle', 'ins.adsbygoogle', '[data-ad-client]',

        // Social media embeds (they track too)
        '.fb-post', '.twitter-tweet', '.instagram-media',

        // Video ads
        '.video-ads', '.ytp-ad-module', '[class*="preroll"]',

        // Specific platforms
        '[class*="outbrain"]', '[class*="taboola"]', '[class*="revcontent"]',

        // Newsletter popups
        '[class*="newsletter"]', '[class*="subscribe-modal"]', '[class*="email-capture"]',

        // Cookie banners
        '[class*="cookie-banner"]', '[class*="gdpr"]', '[class*="consent"]',

        // Paywalls
        '[class*="paywall"]', '[class*="subscription-wall"]'
      ],

      // Nuclear option - destroy all iframes (most ads)
      nukeIframes() {
        document.querySelectorAll('iframe').forEach(iframe => {
          if (!iframe.src.includes(window.location.hostname)) {
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px;
              font-family: -apple-system, sans-serif;
            `;
            placeholder.innerHTML = `
              <strong>🎯 Ad Destroyed</strong><br>
              <small>Revenue denied: ~$0.02</small>
            `;
            iframe.parentNode.replaceChild(placeholder, iframe);

            window.SeymourPrivacy.stats.adsBlocked++;
            window.SeymourPrivacy.stats.revenueDestroyed += 2; // 2 cents average CPM
          }
        });
      },

      // Destroy all ads
      execute() {
        // Initial destruction
        this.destroyAds();

        // Set up mutation observer to catch dynamically loaded ads
        const observer = new MutationObserver(() => {
          this.destroyAds();
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        // Save observer for cleanup
        this.observer = observer;

        // Nuke iframes
        this.nukeIframes();

        // Block ad scripts from loading
        this.blockAdScripts();
      },

      destroyAds() {
        const allSelectors = this.selectors.join(', ');
        document.querySelectorAll(allSelectors).forEach(element => {
          if (element.offsetParent !== null) { // Is visible
            element.style.display = 'none !important';
            element.style.visibility = 'hidden !important';
            element.style.height = '0 !important';
            element.style.overflow = 'hidden !important';

            window.SeymourPrivacy.stats.adsBlocked++;
            window.SeymourPrivacy.stats.revenueDestroyed += 1; // 1 cent per ad
          }
        });
      },

      blockAdScripts() {
        // Intercept and block ad network requests
        const blockPatterns = [
          'doubleclick', 'googlesyndication', 'google-analytics',
          'googletagmanager', 'facebook', 'amazon-adsystem',
          'outbrain', 'taboola', 'revcontent', 'adsafeprotected',
          'scorecardresearch', 'quantserve', 'adsrvr', 'adnxs'
        ];

        // Override fetch to block ad requests
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          const url = args[0];
          if (blockPatterns.some(pattern => url.includes(pattern))) {
            window.SeymourPrivacy.stats.trackersKilled++;
            return Promise.reject(new Error('SuperSeymour: Blocked by Ad Destroyer'));
          }
          return originalFetch.apply(this, args);
        };
      },

      destroy() {
        if (this.observer) {
          this.observer.disconnect();
        }
      }
    },

    // === COOKIE MONSTER ===
    cookieMonster: {
      originalCookie: Object.getOwnPropertyDescriptor(Document.prototype, 'cookie'),

      execute() {
        // Eat all existing cookies
        this.eatAllCookies();

        // Prevent new cookies from being set
        Object.defineProperty(document, 'cookie', {
          get: function() {
            return '';
          },
          set: function(value) {
            window.SeymourPrivacy.stats.cookiesEaten++;
            console.log('🍪 Cookie Monster ate:', value.split('=')[0]);
            return true; // Pretend it worked
          }
        });

        // Block localStorage tracking
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {
          // Allow SuperSeymour data
          if (key.startsWith('seymour')) {
            return originalSetItem.call(this, key, value);
          }

          // Block tracking data
          if (key.includes('track') || key.includes('analytics') ||
              key.includes('_ga') || key.includes('_fb')) {
            window.SeymourPrivacy.stats.cookiesEaten++;
            console.log('🍪 Cookie Monster blocked localStorage:', key);
            return;
          }

          return originalSetItem.call(this, key, value);
        };

        // Clear all tracking data
        this.clearAllTracking();
      },

      eatAllCookies() {
        // Get all cookies
        const cookies = document.cookie.split(';');

        // Delete each cookie
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

          // Delete cookie for all possible paths and domains
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;

          window.SeymourPrivacy.stats.cookiesEaten++;
        });
      },

      clearAllTracking() {
        // Clear localStorage (except SuperSeymour data)
        Object.keys(localStorage).forEach(key => {
          if (!key.startsWith('seymour')) {
            localStorage.removeItem(key);
          }
        });

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear IndexedDB (except SuperSeymour)
        if (window.indexedDB) {
          indexedDB.databases().then(databases => {
            databases.forEach(db => {
              if (db.name !== 'SuperSeymour') {
                indexedDB.deleteDatabase(db.name);
              }
            });
          });
        }
      },

      destroy() {
        // Restore original cookie behavior
        if (this.originalCookie) {
          Object.defineProperty(document, 'cookie', this.originalCookie);
        }
      }
    },

    // === FINGERPRINT RANDOMIZER ===
    fingerprintRandomizer: {
      execute() {
        // Randomize Canvas fingerprint
        this.randomizeCanvas();

        // Randomize WebGL fingerprint
        this.randomizeWebGL();

        // Randomize audio fingerprint
        this.randomizeAudio();

        // Randomize fonts
        this.randomizeFonts();

        // Randomize screen properties
        this.randomizeScreen();

        // Randomize navigator properties
        this.randomizeNavigator();

        window.SeymourPrivacy.stats.fingerprintsRandomized++;
      },

      randomizeCanvas() {
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function(...args) {
          const ctx = this.getContext('2d');
          if (ctx) {
            // Add random noise to canvas
            const imageData = ctx.getImageData(0, 0, this.width, this.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
              imageData.data[i] = (imageData.data[i] + Math.random() * 10) % 255;
            }
            ctx.putImageData(imageData, 0, 0);
          }
          return originalToDataURL.apply(this, args);
        };
      },

      randomizeWebGL() {
        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
          // Randomize certain parameters
          const noise = () => Math.random() * 0.1 - 0.05;

          if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
            return 'SuperSeymour Graphics';
          }
          if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
            return `SuperSeymour Renderer ${Math.floor(Math.random() * 1000)}`;
          }

          return getParameter.call(this, parameter);
        };
      },

      randomizeAudio() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const originalCreateOscillator = AudioContext.prototype.createOscillator;
          AudioContext.prototype.createOscillator = function() {
            const oscillator = originalCreateOscillator.call(this);
            const originalConnect = oscillator.connect;
            oscillator.connect = function(...args) {
              // Add slight frequency variation
              oscillator.frequency.value *= (1 + Math.random() * 0.01);
              return originalConnect.apply(this, args);
            };
            return oscillator;
          };
        }
      },

      randomizeFonts() {
        Object.defineProperty(window, 'FontFace', {
          get: function() {
            // Return random subset of fonts
            const allFonts = ['Arial', 'Helvetica', 'Times', 'Courier', 'Verdana', 'Georgia'];
            const randomFonts = allFonts.sort(() => Math.random() - 0.5).slice(0, 3);
            return randomFonts;
          }
        });
      },

      randomizeScreen() {
        const randomOffset = () => Math.floor(Math.random() * 10) - 5;

        Object.defineProperty(window.screen, 'width', {
          get: function() { return 1920 + randomOffset(); }
        });

        Object.defineProperty(window.screen, 'height', {
          get: function() { return 1080 + randomOffset(); }
        });

        Object.defineProperty(window.screen, 'colorDepth', {
          get: function() { return 24 + Math.floor(Math.random() * 2) * 8; }
        });
      },

      randomizeNavigator() {
        // Random user agents
        const userAgents = [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ];

        Object.defineProperty(window.navigator, 'userAgent', {
          get: function() {
            return userAgents[Math.floor(Math.random() * userAgents.length)];
          }
        });

        Object.defineProperty(window.navigator, 'platform', {
          get: function() {
            const platforms = ['Win32', 'MacIntel', 'Linux x86_64'];
            return platforms[Math.floor(Math.random() * platforms.length)];
          }
        });

        Object.defineProperty(window.navigator, 'hardwareConcurrency', {
          get: function() { return 4 + Math.floor(Math.random() * 4) * 2; }
        });
      },

      destroy() {
        // Fingerprinting changes are permanent for this session
      }
    },

    // === MAIN CONTROLLER ===

    // Show stats dashboard
    showStats() {
      const dashboard = document.createElement('div');
      dashboard.id = 'seymour-privacy-stats';
      dashboard.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 2147483647;
        min-width: 250px;
        font-family: -apple-system, sans-serif;
      `;

      dashboard.innerHTML = `
        <h3 style="margin: 0 0 15px; font-size: 18px;">🛡️ Privacy Shield Active</h3>
        <div style="font-size: 14px; line-height: 1.6;">
          <div>🎯 Ads Destroyed: <strong>${this.stats.adsBlocked}</strong></div>
          <div>🍪 Cookies Eaten: <strong>${this.stats.cookiesEaten}</strong></div>
          <div>🚫 Trackers Killed: <strong>${this.stats.trackersKilled}</strong></div>
          <div>🎭 Fingerprints Randomized: <strong>${this.stats.fingerprintsRandomized}</strong></div>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3);">
            💰 Revenue Destroyed: <strong>$${(this.stats.revenueDestroyed / 100).toFixed(2)}</strong>
          </div>
        </div>
        <button onclick="this.parentElement.remove()"
                style="margin-top: 15px; background: rgba(255,255,255,0.2);
                       border: 1px solid white; color: white; padding: 8px;
                       border-radius: 8px; cursor: pointer; width: 100%;">
          Close Stats
        </button>
      `;

      document.body.appendChild(dashboard);

      // Auto-update stats
      this.statsInterval = setInterval(() => {
        if (dashboard.parentElement) {
          dashboard.querySelector('div').innerHTML = `
            <div>🎯 Ads Destroyed: <strong>${this.stats.adsBlocked}</strong></div>
            <div>🍪 Cookies Eaten: <strong>${this.stats.cookiesEaten}</strong></div>
            <div>🚫 Trackers Killed: <strong>${this.stats.trackersKilled}</strong></div>
            <div>🎭 Fingerprints Randomized: <strong>${this.stats.fingerprintsRandomized}</strong></div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3);">
              💰 Revenue Destroyed: <strong>$${(this.stats.revenueDestroyed / 100).toFixed(2)}</strong>
            </div>
          `;
        } else {
          clearInterval(this.statsInterval);
        }
      }, 1000);
    },

    // Activate all privacy features
    activateAll() {
      this.adDestroyer.execute();
      this.cookieMonster.execute();
      this.fingerprintRandomizer.execute();
      this.showStats();

      // Show notification
      if (window.SeymourCore && window.SeymourCore.showNotification) {
        window.SeymourCore.showNotification('🛡️ Full Privacy Mode Activated!');
      }
    },

    // Deactivate all
    deactivateAll() {
      this.adDestroyer.destroy();
      this.cookieMonster.destroy();
      this.fingerprintRandomizer.destroy();

      const stats = document.getElementById('seymour-privacy-stats');
      if (stats) stats.remove();

      if (this.statsInterval) {
        clearInterval(this.statsInterval);
      }
    }
  };

  // Add to SeymourCore transformations
  if (window.SeymourCore && window.SeymourCore.transformations) {
    // Full privacy mode
    window.SeymourCore.transformations.privacyShield = {
      name: 'Privacy Shield',
      description: 'Destroy ads, eat cookies, randomize fingerprint',
      icon: '🛡️',
      execute() {
        window.SeymourPrivacy.activateAll();
      },
      destroy() {
        window.SeymourPrivacy.deactivateAll();
      }
    };

    // Individual controls
    window.SeymourCore.transformations.adDestroyer = {
      name: 'Ad Destroyer',
      description: 'Eliminate all ads and tracking',
      icon: '🎯',
      execute() {
        window.SeymourPrivacy.adDestroyer.execute();
        window.SeymourPrivacy.showStats();
      },
      destroy() {
        window.SeymourPrivacy.adDestroyer.destroy();
      }
    };

    window.SeymourCore.transformations.cookieMonster = {
      name: 'Cookie Monster',
      description: 'Eat all tracking cookies',
      icon: '🍪',
      execute() {
        window.SeymourPrivacy.cookieMonster.execute();
        if (window.SeymourCore) {
          window.SeymourCore.showNotification('🍪 Cookie Monster is hungry!');
        }
      },
      destroy() {
        window.SeymourPrivacy.cookieMonster.destroy();
      }
    };
  }

})();