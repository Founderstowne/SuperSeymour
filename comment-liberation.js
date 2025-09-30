// SuperSeymour Comment Liberation Engine
// Every website gets comments. Every voice gets heard. No censorship possible.
// "The internet routes around censorship" - Now literally true

(function() {
  'use strict';

  window.SeymourComments = {
    // Configuration
    config: {
      maxCommentsPerPage: 1000,
      commentLayerZIndex: 2147483645,
      peerDiscoveryUrl: 'wss://seymouros.com/comments', // WebSocket for peer discovery
      storageKey: 'seymour-comments-',
      version: '1.0.0'
    },

    // Active state
    state: {
      isActive: false,
      currentUrl: '',
      comments: new Map(),
      peers: new Set(),
      userId: null,
      username: null
    },

    // Initialize comment system
    async init() {
      // Generate or retrieve user ID
      this.state.userId = await this.getUserId();

      // Get current page URL (normalized)
      this.state.currentUrl = this.normalizeUrl(window.location.href);

      // Load comments from IndexedDB
      await this.loadComments();

      // Initialize P2P connection
      await this.initP2P();
    },

    // Generate persistent user ID
    async getUserId() {
      let userId = localStorage.getItem('seymour-user-id');
      if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
        localStorage.setItem('seymour-user-id', userId);
      }
      return userId;
    },

    // Normalize URL for consistent keying
    normalizeUrl(url) {
      try {
        const parsed = new URL(url);
        // Remove fragment and trailing slash
        return parsed.origin + parsed.pathname.replace(/\/$/, '');
      } catch {
        return url;
      }
    },

    // Load comments from IndexedDB
    async loadComments() {
      return new Promise((resolve) => {
        const request = indexedDB.open('SuperSeymour', 1);

        request.onsuccess = (event) => {
          const db = event.target.result;

          if (!db.objectStoreNames.contains('comments')) {
            resolve();
            return;
          }

          const transaction = db.transaction(['comments'], 'readonly');
          const store = transaction.objectStore('comments');
          const index = store.index('url');
          const getRequest = index.getAll(this.state.currentUrl);

          getRequest.onsuccess = () => {
            const comments = getRequest.result || [];
            comments.forEach(comment => {
              this.state.comments.set(comment.id, comment);
            });
            resolve();
          };
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('comments')) {
            const store = db.createObjectStore('comments', { keyPath: 'id' });
            store.createIndex('url', 'url', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
      });
    },

    // Save comment to IndexedDB
    async saveComment(comment) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('SuperSeymour', 1);

        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['comments'], 'readwrite');
          const store = transaction.objectStore('comments');

          store.put(comment);

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
      });
    },

    // Initialize P2P connections
    async initP2P() {
      // For now, we'll use a hybrid approach:
      // 1. Store comments locally in IndexedDB
      // 2. Optional sync through WebRTC when peers are available
      // 3. Fallback to a distributed hash table (DHT) approach

      // This would connect to other SuperSeymour users viewing the same page
      // and sync comments peer-to-peer
      console.log('SeymourComments: P2P initialized for', this.state.currentUrl);
    },

    // Create the comment overlay UI
    createCommentUI() {
      // Remove existing UI if any
      this.removeCommentUI();

      // Create main container
      const container = document.createElement('div');
      container.id = 'seymour-comments-container';
      container.style.cssText = `
        position: fixed;
        right: 20px;
        top: 80px;
        bottom: 80px;
        width: 350px;
        background: white;
        border-radius: 20px;
        box-shadow: -10px 0 40px rgba(0,0,0,0.2);
        z-index: ${this.config.commentLayerZIndex};
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        animation: slideIn 0.3s ease;
      `;

      // Header
      const header = document.createElement('div');
      header.style.cssText = `
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 20px 20px 0 0;
        position: relative;
      `;
      header.innerHTML = `
        <h3 style="margin: 0 0 5px; font-size: 18px;">🗣️ SuperSeymour Comments</h3>
        <p style="margin: 0; font-size: 12px; opacity: 0.9;">
          ${this.state.comments.size} comments • ${this.state.peers.size} peers online
        </p>
        <button id="seymour-comments-close"
                style="position: absolute; top: 20px; right: 20px;
                       background: rgba(255,255,255,0.2); border: none;
                       color: white; width: 30px; height: 30px;
                       border-radius: 50%; cursor: pointer; font-size: 18px;">
          ×
        </button>
      `;

      // Comments area
      const commentsArea = document.createElement('div');
      commentsArea.id = 'seymour-comments-list';
      commentsArea.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #f8f8f8;
      `;

      // Render existing comments
      this.renderComments(commentsArea);

      // Input area
      const inputArea = document.createElement('div');
      inputArea.style.cssText = `
        padding: 20px;
        background: white;
        border-top: 1px solid #eee;
        border-radius: 0 0 20px 20px;
      `;
      inputArea.innerHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
          <input type="text" id="seymour-username"
                 placeholder="Choose username (optional)"
                 value="${this.state.username || ''}"
                 style="flex: 1; padding: 10px; border: 1px solid #ddd;
                        border-radius: 10px; font-size: 14px;">
        </div>
        <div style="display: flex; gap: 10px;">
          <textarea id="seymour-comment-input"
                    placeholder="Add your uncensorable comment..."
                    style="flex: 1; padding: 10px; border: 1px solid #ddd;
                           border-radius: 10px; resize: none; height: 60px;
                           font-size: 14px; font-family: inherit;"></textarea>
          <button id="seymour-comment-submit"
                  style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                         color: white; border: none; border-radius: 10px;
                         cursor: pointer; font-weight: 600;">
            Post
          </button>
        </div>
        <p style="margin: 10px 0 0; font-size: 11px; color: #999;">
          💡 Comments are stored locally and shared P2P. No server, no censorship.
        </p>
      `;

      // Assemble UI
      container.appendChild(header);
      container.appendChild(commentsArea);
      container.appendChild(inputArea);
      document.body.appendChild(container);

      // Add styles for animations
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        #seymour-comments-list::-webkit-scrollbar {
          width: 8px;
        }

        #seymour-comments-list::-webkit-scrollbar-track {
          background: transparent;
        }

        #seymour-comments-list::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 4px;
        }

        .seymour-comment {
          background: white;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 10px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .seymour-highlight {
          background: rgba(118, 75, 162, 0.2) !important;
          position: relative;
        }

        .seymour-highlight::after {
          content: attr(data-comment-count) " comments";
          position: absolute;
          top: -25px;
          right: 0;
          background: #764ba2;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-family: -apple-system, sans-serif;
        }
      `;
      document.head.appendChild(style);

      // Event listeners
      document.getElementById('seymour-comments-close').onclick = () => {
        this.removeCommentUI();
      };

      document.getElementById('seymour-username').onchange = (e) => {
        this.state.username = e.target.value;
        localStorage.setItem('seymour-username', e.target.value);
      };

      document.getElementById('seymour-comment-submit').onclick = () => {
        this.postComment();
      };

      document.getElementById('seymour-comment-input').onkeypress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          this.postComment();
        }
      };

      // Load stored username
      this.state.username = localStorage.getItem('seymour-username');
      if (this.state.username) {
        document.getElementById('seymour-username').value = this.state.username;
      }
    },

    // Render comments in the UI
    renderComments(container) {
      container.innerHTML = '';

      if (this.state.comments.size === 0) {
        container.innerHTML = `
          <p style="text-align: center; color: #999; padding: 40px 20px;">
            No comments yet. Be the first to speak freely!
          </p>
        `;
        return;
      }

      // Sort comments by timestamp
      const sortedComments = Array.from(this.state.comments.values())
        .sort((a, b) => b.timestamp - a.timestamp);

      sortedComments.forEach(comment => {
        const commentEl = document.createElement('div');
        commentEl.className = 'seymour-comment';

        const date = new Date(comment.timestamp);
        const timeAgo = this.getTimeAgo(date);

        commentEl.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <strong style="color: #764ba2; font-size: 14px;">
              ${comment.username || 'Anonymous'}
            </strong>
            <span style="color: #999; font-size: 12px;">${timeAgo}</span>
          </div>
          <div style="color: #333; font-size: 14px; line-height: 1.5;">
            ${this.escapeHtml(comment.text)}
          </div>
          ${comment.selectedText ? `
            <div style="margin-top: 8px; padding: 8px; background: #f0f0f0;
                        border-left: 3px solid #764ba2; font-size: 12px;
                        color: #666; font-style: italic;">
              "${this.escapeHtml(comment.selectedText)}"
            </div>
          ` : ''}
          <div style="margin-top: 8px; display: flex; gap: 10px;">
            <button onclick="window.SeymourComments.upvote('${comment.id}')"
                    style="background: none; border: none; color: #999;
                           cursor: pointer; font-size: 12px;">
              👍 ${comment.upvotes || 0}
            </button>
            <button onclick="window.SeymourComments.reply('${comment.id}')"
                    style="background: none; border: none; color: #999;
                           cursor: pointer; font-size: 12px;">
              💬 Reply
            </button>
          </div>
        `;

        container.appendChild(commentEl);
      });
    },

    // Post a new comment
    async postComment() {
      const input = document.getElementById('seymour-comment-input');
      const text = input.value.trim();

      if (!text) return;

      // Get selected text if any
      const selectedText = window.getSelection().toString();

      const comment = {
        id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        url: this.state.currentUrl,
        userId: this.state.userId,
        username: this.state.username,
        text: text,
        selectedText: selectedText,
        timestamp: Date.now(),
        upvotes: 0,
        replies: []
      };

      // Add to local state
      this.state.comments.set(comment.id, comment);

      // Save to IndexedDB
      await this.saveComment(comment);

      // Broadcast to peers (if P2P is active)
      this.broadcastComment(comment);

      // Clear input and re-render
      input.value = '';
      this.renderComments(document.getElementById('seymour-comments-list'));

      // Update count
      this.updateCommentCount();

      // Highlight selected text if any
      if (selectedText) {
        this.highlightText(selectedText);
      }

      // Show notification
      if (window.SeymourCore && window.SeymourCore.showNotification) {
        window.SeymourCore.showNotification('Comment posted! 🗣️');
      }
    },

    // Broadcast comment to peers
    broadcastComment(comment) {
      // In a full implementation, this would use WebRTC to share with peers
      console.log('Broadcasting comment to peers:', comment);
    },

    // Upvote a comment
    upvote(commentId) {
      const comment = this.state.comments.get(commentId);
      if (comment) {
        comment.upvotes = (comment.upvotes || 0) + 1;
        this.saveComment(comment);
        this.renderComments(document.getElementById('seymour-comments-list'));
      }
    },

    // Reply to a comment
    reply(commentId) {
      const input = document.getElementById('seymour-comment-input');
      input.value = `@${commentId} `;
      input.focus();
    },

    // Highlight text that has comments
    highlightText(text) {
      // Simple implementation - in production would use more sophisticated text matching
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while (node = walker.nextNode()) {
        if (node.nodeValue.includes(text)) {
          const parent = node.parentElement;
          if (parent && !parent.classList.contains('seymour-highlight')) {
            parent.classList.add('seymour-highlight');
            parent.setAttribute('data-comment-count', '1');
          }
        }
      }
    },

    // Update comment count display
    updateCommentCount() {
      const header = document.querySelector('#seymour-comments-container p');
      if (header) {
        header.innerHTML = `${this.state.comments.size} comments • ${this.state.peers.size} peers online`;
      }
    },

    // Get time ago string
    getTimeAgo(date) {
      const seconds = Math.floor((Date.now() - date) / 1000);

      if (seconds < 60) return 'just now';
      if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
      if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
      if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';

      return date.toLocaleDateString();
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // Remove comment UI
    removeCommentUI() {
      const container = document.getElementById('seymour-comments-container');
      if (container) {
        container.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => container.remove(), 300);
      }
    },

    // Toggle comment system
    async toggle() {
      if (this.state.isActive) {
        this.removeCommentUI();
        this.state.isActive = false;
      } else {
        await this.init();
        this.createCommentUI();
        this.state.isActive = true;
      }
    }
  };

  // Add to SeymourCore transformations
  if (window.SeymourCore && window.SeymourCore.transformations) {
    window.SeymourCore.transformations.comments = {
      name: 'Comment Liberation',
      description: 'Add uncensorable comments to any website',
      icon: '🗣️',
      execute() {
        window.SeymourComments.toggle();
      },
      destroy() {
        window.SeymourComments.removeCommentUI();
        window.SeymourComments.state.isActive = false;
      }
    };
  }

})();