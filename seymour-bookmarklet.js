// SuperSeymour - The Bookmarklet That Changes Everything
// This is the loader - the magic happens after this runs

javascript:(function(){
  'use strict';

  const SEYMOUR_VERSION = '2025.09.28.1930';
  const SEYMOUR_HOST = 'https://superseymour.com';

  // Check if SuperSeymour is already loaded
  if (window.SuperSeymour && window.SuperSeymour.version === SEYMOUR_VERSION) {
    window.SuperSeymour.toggle();
    return;
  }

  // Create the SuperSeymour namespace
  window.SuperSeymour = {
    version: SEYMOUR_VERSION,
    host: SEYMOUR_HOST,
    features: {},

    // Initialize from IndexedDB cache or network
    async init() {
      try {
        // Try loading from IndexedDB first
        const cached = await this.loadFromCache();
        if (cached && cached.version === SEYMOUR_VERSION) {
          this.execute(cached.code);
        } else {
          // Fetch fresh from network
          const fresh = await this.loadFromNetwork();
          await this.saveToCache(fresh);
          this.execute(fresh.code);
        }
      } catch (error) {
        console.error('SuperSeymour initialization failed:', error);
        this.showError();
      }
    },

    // Load from IndexedDB
    async loadFromCache() {
      return new Promise((resolve) => {
        const request = indexedDB.open('SuperSeymour', 1);

        request.onerror = () => resolve(null);

        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['code'], 'readonly');
          const store = transaction.objectStore('code');
          const getRequest = store.get('main');

          getRequest.onsuccess = () => resolve(getRequest.result);
          getRequest.onerror = () => resolve(null);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('code')) {
            db.createObjectStore('code', { keyPath: 'id' });
          }
        };
      });
    },

    // Load from network
    async loadFromNetwork() {
      const response = await fetch(`${SEYMOUR_HOST}/api/bookmarklet/core`);
      if (!response.ok) throw new Error('Failed to load SuperSeymour');
      return await response.json();
    },

    // Save to IndexedDB
    async saveToCache(data) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('SuperSeymour', 1);

        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['code'], 'readwrite');
          const store = transaction.objectStore('code');

          store.put({
            id: 'main',
            version: SEYMOUR_VERSION,
            code: data.code,
            timestamp: Date.now()
          });

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
      });
    },

    // Execute the main SuperSeymour code
    execute(code) {
      try {
        // Create sandboxed execution context
        const func = new Function(code);
        func.call(window);

        // Show success indicator
        this.showSuccess();
      } catch (error) {
        console.error('SuperSeymour execution failed:', error);
        this.showError();
      }
    },

    // Toggle SuperSeymour UI
    toggle() {
      const ui = document.getElementById('seymour-ui');
      if (ui) {
        ui.style.display = ui.style.display === 'none' ? 'block' : 'none';
      }
    },

    // Show loading indicator
    showLoading() {
      const indicator = document.createElement('div');
      indicator.id = 'seymour-loading';
      indicator.innerHTML = '⚡ Loading SuperSeymour...';
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 30px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 2147483647;
        animation: pulse 1s infinite;
      `;

      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `;

      document.head.appendChild(style);
      document.body.appendChild(indicator);

      return indicator;
    },

    // Show success message
    showSuccess() {
      const loading = document.getElementById('seymour-loading');
      if (loading) {
        loading.innerHTML = '✨ SuperSeymour Ready!';
        loading.style.background = 'linear-gradient(135deg, #00c851 0%, #00ff00 100%)';
        setTimeout(() => loading.remove(), 2000);
      }
    },

    // Show error message
    showError() {
      const loading = document.getElementById('seymour-loading');
      if (loading) {
        loading.innerHTML = '⚠️ Failed to load SuperSeymour';
        loading.style.background = 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)';
        setTimeout(() => loading.remove(), 3000);
      }
    }
  };

  // Start the magic
  window.SuperSeymour.showLoading();
  window.SuperSeymour.init();

})();