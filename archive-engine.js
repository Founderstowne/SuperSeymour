// SuperSeymour Archive Engine
// Liberation through preservation
// Make the web permanently free

(function() {
  'use strict';

  window.SeymourArchive = {
    // Archive service endpoints
    services: {
      'archive.ph': 'https://archive.ph/',
      'archive.today': 'https://archive.today/',
      'archive.is': 'https://archive.is/',
      'wayback': 'https://web.archive.org/web/'
    },

    // Known paywall domains
    paywallDomains: [
      'nytimes.com', 'wsj.com', 'ft.com', 'economist.com',
      'washingtonpost.com', 'bloomberg.com', 'newyorker.com',
      'theatlantic.com', 'businessinsider.com', 'medium.com',
      'seekingalpha.com', 'nature.com', 'sciencedirect.com',
      'ieee.org', 'jstor.org', 'technologyreview.com'
    ],

    // Paywall detection patterns
    paywallPatterns: [
      'subscribe to read',
      'subscription required',
      'become a member',
      'article limit',
      'continue reading',
      'full access',
      'premium content',
      'exclusive content',
      'sign up to read',
      'create an account',
      'paywall',
      'metered',
      'subscriber-only'
    ],

    // Cache for archived pages
    archiveCache: new Map(),

    // Initialize archive engine
    async init() {
      // Load cached archives from IndexedDB
      const cached = await this.loadFromCache();
      if (cached) {
        this.archiveCache = new Map(cached);
        console.log(`SeymourArchive: Loaded ${this.archiveCache.size} cached archives`);
      }

      // Auto-detect paywalls on page load
      this.detectPaywall();
    },

    // Detect if current page has a paywall
    detectPaywall() {
      const url = window.location.href;
      const domain = window.location.hostname;
      const bodyText = document.body.innerText.toLowerCase();

      // Check if domain is known to have paywalls
      const isPaywallDomain = this.paywallDomains.some(d => domain.includes(d));

      // Check for paywall patterns in page text
      const hasPaywallPattern = this.paywallPatterns.some(pattern =>
        bodyText.includes(pattern.toLowerCase())
      );

      // Check for blur/fade effects often used in paywalls
      const hasBlurredContent = Array.from(document.querySelectorAll('*')).some(el => {
        const style = window.getComputedStyle(el);
        return style.filter && style.filter.includes('blur');
      });

      if (isPaywallDomain || hasPaywallPattern || hasBlurredContent) {
        this.showPaywallDetected();
        return true;
      }

      return false;
    },

    // Show paywall detected notification with archive option
    showPaywallDetected() {
      const notification = document.createElement('div');
      notification.id = 'seymour-paywall-detected';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 2147483647;
        max-width: 300px;
        animation: slideIn 0.3s ease;
      `;

      notification.innerHTML = `
        <h4 style="margin: 0 0 10px; font-size: 16px;">🚫 Paywall Detected!</h4>
        <p style="margin: 0 0 15px; font-size: 14px; opacity: 0.95;">
          SuperSeymour can liberate this content
        </p>
        <button onclick="window.SeymourArchive.liberatePage()"
                style="background: white; color: #ee5a24; border: none;
                       padding: 10px 20px; border-radius: 8px; font-weight: bold;
                       cursor: pointer; width: 100%; font-size: 14px;">
          🔓 Liberate This Page
        </button>
        <button onclick="this.parentElement.remove()"
                style="background: transparent; color: white; border: 1px solid white;
                       padding: 8px; border-radius: 8px; cursor: pointer;
                       width: 100%; margin-top: 8px; font-size: 12px;">
          Dismiss
        </button>
      `;

      document.body.appendChild(notification);

      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => notification.remove(), 300);
        }
      }, 10000);
    },

    // Liberate the current page through archive
    async liberatePage(url = window.location.href) {
      // Check cache first
      const cached = await this.getFromCache(url);
      if (cached) {
        this.displayArchived(cached);
        return;
      }

      // Show loading indicator
      this.showLoading('Liberating content...');

      // Try archive.ph first
      const archiveUrl = `${this.services['archive.ph']}${url}`;

      // Create iframe to load archived version
      const iframe = document.createElement('iframe');
      iframe.id = 'seymour-archive-frame';
      iframe.src = archiveUrl;
      iframe.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        z-index: 2147483646;
        background: white;
      `;

      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕ Close Archive';
      closeBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #764ba2;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 30px;
        font-weight: bold;
        cursor: pointer;
        z-index: 2147483647;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      `;
      closeBtn.onclick = () => {
        iframe.remove();
        closeBtn.remove();
      };

      document.body.appendChild(iframe);
      document.body.appendChild(closeBtn);

      // Hide loading
      this.hideLoading();

      // Save to cache
      this.saveToCache(url, archiveUrl);

      this.showNotification('Content liberated! 🔓');
    },

    // Create Time Machine interface
    createTimeMachine() {
      const modal = document.createElement('div');
      modal.id = 'seymour-time-machine';
      modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        padding: 30px;
        z-index: 2147483647;
        max-width: 500px;
        width: 90%;
      `;

      modal.innerHTML = `
        <h2 style="color: #764ba2; margin: 0 0 20px;">⏰ Web Time Machine</h2>

        <input type="url" id="time-machine-url" placeholder="Enter URL to explore"
               value="${window.location.href}"
               style="width: 100%; padding: 12px; border: 2px solid #eee;
                      border-radius: 10px; font-size: 14px; margin-bottom: 15px;">

        <div style="margin: 20px 0;">
          <h4 style="margin: 0 0 10px; color: #666;">Quick Archives:</h4>

          <button onclick="window.SeymourArchive.openArchive('archive.ph')"
                  style="display: inline-block; margin: 5px; padding: 10px 20px;
                         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                         color: white; border: none; border-radius: 8px;
                         cursor: pointer; font-weight: 600;">
            Archive.ph
          </button>

          <button onclick="window.SeymourArchive.openArchive('wayback')"
                  style="display: inline-block; margin: 5px; padding: 10px 20px;
                         background: linear-gradient(135deg, #00c851 0%, #00ff00 100%);
                         color: white; border: none; border-radius: 8px;
                         cursor: pointer; font-weight: 600;">
            Wayback Machine
          </button>

          <button onclick="window.SeymourArchive.searchAllArchives()"
                  style="display: inline-block; margin: 5px; padding: 10px 20px;
                         background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                         color: white; border: none; border-radius: 8px;
                         cursor: pointer; font-weight: 600;">
            Search All Archives
          </button>
        </div>

        <div style="margin: 20px 0; padding: 15px; background: #f8f8f8; border-radius: 10px;">
          <h4 style="margin: 0 0 10px; color: #666;">Recent Archives:</h4>
          <div id="recent-archives" style="font-size: 14px; color: #666;">
            ${this.getRecentArchives()}
          </div>
        </div>

        <button onclick="this.parentElement.remove()"
                style="width: 100%; padding: 12px; background: #f0f0f0;
                       border: none; border-radius: 10px; cursor: pointer;
                       color: #666; font-weight: 600;">
          Close
        </button>
      `;

      document.body.appendChild(modal);
    },

    // Open archive in specific service
    openArchive(service) {
      const urlInput = document.getElementById('time-machine-url');
      const url = urlInput ? urlInput.value : window.location.href;

      if (!url) {
        this.showNotification('Please enter a URL');
        return;
      }

      const archiveUrl = `${this.services[service]}${url}`;
      window.open(archiveUrl, '_blank');

      this.saveToCache(url, archiveUrl);
      this.showNotification(`Opening in ${service} 🚀`);
    },

    // Search all archive services
    searchAllArchives() {
      const urlInput = document.getElementById('time-machine-url');
      const url = urlInput ? urlInput.value : window.location.href;

      if (!url) {
        this.showNotification('Please enter a URL');
        return;
      }

      // Open in multiple tabs
      Object.entries(this.services).forEach(([name, baseUrl]) => {
        setTimeout(() => {
          window.open(`${baseUrl}${url}`, '_blank');
        }, 100);
      });

      this.showNotification('Searching all archives! 🔍');
    },

    // Get recent archives from cache
    getRecentArchives() {
      if (this.archiveCache.size === 0) {
        return '<p style="margin: 0;">No recent archives yet</p>';
      }

      const recent = Array.from(this.archiveCache.entries()).slice(-5).reverse();
      return recent.map(([url, archived]) => {
        const domain = new URL(url).hostname;
        return `
          <div style="margin: 5px 0;">
            <a href="${archived}" target="_blank"
               style="color: #764ba2; text-decoration: none;">
              📄 ${domain}
            </a>
          </div>
        `;
      }).join('');
    },

    // Load archives from IndexedDB
    async loadFromCache() {
      return new Promise((resolve) => {
        const request = indexedDB.open('SuperSeymour', 1);

        request.onerror = () => resolve(null);

        request.onsuccess = (event) => {
          const db = event.target.result;

          if (!db.objectStoreNames.contains('archives')) {
            resolve(null);
            return;
          }

          const transaction = db.transaction(['archives'], 'readonly');
          const store = transaction.objectStore('archives');
          const getRequest = store.getAll();

          getRequest.onsuccess = () => {
            const archives = getRequest.result;
            if (archives && archives.length > 0) {
              const cache = new Map();
              archives.forEach(archive => {
                cache.set(archive.url, archive.archived);
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
          if (!db.objectStoreNames.contains('archives')) {
            db.createObjectStore('archives', { keyPath: 'url' });
          }
        };
      });
    },

    // Save archive to IndexedDB
    async saveToCache(url, archivedUrl) {
      this.archiveCache.set(url, archivedUrl);

      return new Promise((resolve, reject) => {
        const request = indexedDB.open('SuperSeymour', 1);

        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['archives'], 'readwrite');
          const store = transaction.objectStore('archives');

          store.put({
            url: url,
            archived: archivedUrl,
            timestamp: Date.now()
          });

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
      });
    },

    // Get from cache
    async getFromCache(url) {
      return this.archiveCache.get(url);
    },

    // Show loading indicator
    showLoading(message = 'Loading...') {
      const loading = document.createElement('div');
      loading.id = 'seymour-loading-archive';
      loading.innerHTML = message;
      loading.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 18px;
        z-index: 2147483648;
      `;
      document.body.appendChild(loading);
    },

    // Hide loading indicator
    hideLoading() {
      const loading = document.getElementById('seymour-loading-archive');
      if (loading) loading.remove();
    },

    // Show notification
    showNotification(message) {
      if (window.SeymourCore && window.SeymourCore.showNotification) {
        window.SeymourCore.showNotification(message);
      } else {
        console.log('SeymourArchive:', message);
      }
    }
  };

  // Add Archive transformation to SeymourCore if it exists
  if (window.SeymourCore && window.SeymourCore.transformations) {
    window.SeymourCore.transformations.archive = {
      name: 'Archive Liberation',
      description: 'Bypass paywalls and preserve content',
      icon: '🔓',
      execute() {
        // If paywall detected, liberate immediately
        if (window.SeymourArchive.detectPaywall()) {
          window.SeymourArchive.liberatePage();
        } else {
          // Otherwise show Time Machine
          window.SeymourArchive.createTimeMachine();
        }
      },
      destroy() {
        const elements = [
          'seymour-archive-frame',
          'seymour-time-machine',
          'seymour-paywall-detected',
          'seymour-loading-archive'
        ];
        elements.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.remove();
        });
      }
    };

    // Also add instant liberate option
    window.SeymourCore.transformations.liberate = {
      name: 'Liberate Now',
      description: 'Instantly bypass paywall',
      icon: '💥',
      execute() {
        window.SeymourArchive.liberatePage();
      },
      destroy() {
        const frame = document.getElementById('seymour-archive-frame');
        if (frame) frame.remove();
      }
    };
  }

  // Initialize archive engine
  window.SeymourArchive.init();

})();