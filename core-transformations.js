// SuperSeymour Core Transformations
// This is what gets loaded and cached in IndexedDB
// Pure magic, no telemetry, no bullshit

(function() {
  'use strict';

  // If already initialized, skip
  if (window.SeymourCore) return;

  window.SeymourCore = {
    // Active transformations
    active: new Set(),

    // All available transformations
    transformations: {
      // LIQUID GLASS KILLER - Our flagship feature
      liquidGlassKiller: {
        name: 'Liquid Glass Killer',
        description: 'Remove all blur and transparency effects',
        icon: '🎯',
        execute() {
          const style = document.createElement('style');
          style.id = 'seymour-liquid-glass-killer';
          style.innerHTML = `
            * {
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
            }

            /* Fix semi-transparent backgrounds */
            div, section, article, header, footer, nav, aside {
              background-color: var(--seymour-bg, #ffffff) !important;
            }

            /* Dark mode aware */
            @media (prefers-color-scheme: dark) {
              :root { --seymour-bg: #1a1a1a; }
            }

            /* Remove all glass effects */
            .glass, .blur, .frosted, [class*="glass"], [class*="blur"] {
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
              background: var(--seymour-bg) !important;
            }
          `;
          document.head.appendChild(style);
          this.showNotification('Liquid Glass destroyed! 🎯');
        },
        destroy() {
          const style = document.getElementById('seymour-liquid-glass-killer');
          if (style) style.remove();
        }
      },

      // READER MODE - Strip everything but content
      readerMode: {
        name: 'Reader Mode',
        description: 'Focus on content, remove all distractions',
        icon: '📖',
        execute() {
          // Hide common distraction elements
          const selectors = [
            '.ads', '.ad', '#ads', '[class*="advertisement"]',
            '.sidebar', '.popup', '.modal', '.cookie',
            'nav', 'header', 'footer', '.comments',
            '.social', '.share', '.newsletter'
          ];

          const style = document.createElement('style');
          style.id = 'seymour-reader-mode';
          style.innerHTML = `
            ${selectors.join(', ')} {
              display: none !important;
            }

            /* Improve readability */
            body {
              max-width: 700px !important;
              margin: 40px auto !important;
              padding: 20px !important;
              line-height: 1.6 !important;
              font-size: 18px !important;
              font-family: Georgia, serif !important;
            }

            p, li { margin-bottom: 1em !important; }
            h1, h2, h3 { margin-top: 1.5em !important; }

            /* High contrast */
            body {
              background: #fefefe !important;
              color: #333 !important;
            }

            a { color: #0066cc !important; }
          `;
          document.head.appendChild(style);
          this.showNotification('Reader Mode activated 📖');
        },
        destroy() {
          const style = document.getElementById('seymour-reader-mode');
          if (style) style.remove();
        }
      },

      // ZEN MODE - Ultimate minimalism
      zenMode: {
        name: 'Zen Mode',
        description: 'Extreme minimalism for focus',
        icon: '🧘',
        execute() {
          const style = document.createElement('style');
          style.id = 'seymour-zen-mode';
          style.innerHTML = `
            * {
              animation: none !important;
              transition: none !important;
            }

            body {
              background: #f6f6f6 !important;
              color: #2c2c2c !important;
            }

            /* Remove all borders and shadows */
            * {
              border: none !important;
              box-shadow: none !important;
              text-shadow: none !important;
            }

            /* Simplify everything */
            img, video, iframe { opacity: 0.3 !important; }
            img:hover, video:hover { opacity: 1 !important; }

            /* Mute colors */
            * { filter: saturate(0.3) !important; }
          `;
          document.head.appendChild(style);
          this.showNotification('Zen Mode: Maximum calm 🧘');
        },
        destroy() {
          const style = document.getElementById('seymour-zen-mode');
          if (style) style.remove();
        }
      },

      // SPEED MODE - Remove all tracking and bloat
      speedMode: {
        name: 'Speed Mode',
        description: 'Block trackers and speed up pages',
        icon: '⚡',
        execute() {
          // Block common tracking scripts
          const blockPatterns = [
            'google-analytics', 'googletagmanager', 'facebook',
            'doubleclick', 'amazon-adsystem', 'googlesyndication'
          ];

          // Intercept and block
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.src && blockPatterns.some(p => node.src.includes(p))) {
                  node.remove();
                  console.log('SuperSeymour blocked:', node.src);
                }
              });
            });
          });

          observer.observe(document.documentElement, {
            childList: true,
            subtree: true
          });

          // Store observer for cleanup
          this.speedObserver = observer;
          this.showNotification('Speed Mode: Trackers blocked ⚡');
        },
        destroy() {
          if (this.speedObserver) {
            this.speedObserver.disconnect();
            this.speedObserver = null;
          }
        }
      },

      // SURPRISE MODE - Random delightful transformation
      surpriseMode: {
        name: 'Surprise Me',
        description: 'A random delightful transformation',
        icon: '🎲',
        execute() {
          const surprises = [
            () => {
              // Matrix rain effect
              const canvas = document.createElement('canvas');
              canvas.id = 'seymour-matrix';
              canvas.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none;
                z-index: 999999;
                opacity: 0.1;
              `;
              document.body.appendChild(canvas);

              const ctx = canvas.getContext('2d');
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;

              const chars = 'SEYMOUROS01'.split('');
              const fontSize = 14;
              const columns = canvas.width / fontSize;
              const drops = Array(Math.floor(columns)).fill(1);

              function draw() {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#0F0';
                ctx.font = fontSize + 'px monospace';

                for (let i = 0; i < drops.length; i++) {
                  const text = chars[Math.floor(Math.random() * chars.length)];
                  ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                  if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                  }
                  drops[i]++;
                }
              }

              this.matrixInterval = setInterval(draw, 35);
              this.showNotification('Welcome to the Matrix 💊');
            },

            () => {
              // Retro terminal theme
              const style = document.createElement('style');
              style.id = 'seymour-retro';
              style.innerHTML = `
                body {
                  background: #000 !important;
                  color: #0f0 !important;
                  font-family: 'Courier New', monospace !important;
                }

                * {
                  color: #0f0 !important;
                  text-shadow: 0 0 5px #0f0 !important;
                }

                ::selection {
                  background: #0f0 !important;
                  color: #000 !important;
                }

                /* Scanlines */
                body::before {
                  content: "";
                  position: fixed;
                  top: 0; left: 0;
                  width: 100%; height: 100%;
                  background: repeating-linear-gradient(
                    0deg,
                    rgba(0,255,0,0.03),
                    rgba(0,255,0,0.03) 1px,
                    transparent 1px,
                    transparent 2px
                  );
                  pointer-events: none;
                  z-index: 999999;
                }
              `;
              document.head.appendChild(style);
              this.showNotification('Terminal Mode activated 💻');
            },

            () => {
              // Party mode - everything dances
              const style = document.createElement('style');
              style.id = 'seymour-party';
              style.innerHTML = `
                @keyframes party {
                  0%, 100% { transform: rotate(0deg) scale(1); }
                  25% { transform: rotate(-3deg) scale(1.05); }
                  50% { transform: rotate(3deg) scale(0.95); }
                  75% { transform: rotate(-1deg) scale(1.02); }
                }

                p, div, section, article {
                  animation: party 2s infinite !important;
                }

                body {
                  background: linear-gradient(
                    45deg,
                    #ff006e,
                    #8338ec,
                    #3a86ff,
                    #06c,
                    #50c878
                  ) !important;
                  background-size: 400% 400% !important;
                  animation: gradient 3s ease infinite !important;
                }

                @keyframes gradient {
                  0%, 100% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                }
              `;
              document.head.appendChild(style);
              this.showNotification('Party Mode! 🎉');
            }
          ];

          // Pick random surprise
          const surprise = surprises[Math.floor(Math.random() * surprises.length)];
          surprise.call(this);
        },
        destroy() {
          // Clean up any surprise mode elements
          ['seymour-matrix', 'seymour-retro', 'seymour-party'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
          });

          if (this.matrixInterval) {
            clearInterval(this.matrixInterval);
            this.matrixInterval = null;
          }
        }
      }
    },

    // Show notification
    showNotification(message) {
      const notification = document.createElement('div');
      notification.innerHTML = message;
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
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
        animation: slideIn 0.3s ease;
      `;

      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    },

    // Apply transformation
    apply(name) {
      const transform = this.transformations[name];
      if (!transform) return;

      if (this.active.has(name)) {
        // Toggle off
        transform.destroy.call(this);
        this.active.delete(name);
      } else {
        // Toggle on
        transform.execute.call(this);
        this.active.add(name);
      }
    }
  };

  // Create the SuperSeymour UI
  function createUI() {
    const ui = document.createElement('div');
    ui.id = 'seymour-ui';
    ui.style.cssText = `
      position: fixed;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      background: white;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 20px;
      z-index: 2147483646;
      max-width: 250px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;

    ui.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #764ba2;">SuperSeymour</h3>
      <div id="seymour-features"></div>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
        <small style="color: #999;">
          Free forever from<br>
          <a href="https://founderstowne.com" target="_blank" style="color: #764ba2;">
            Founderstowne Academy
          </a>
        </small>
      </div>
    `;

    document.body.appendChild(ui);

    // Add transformation buttons
    const featuresContainer = document.getElementById('seymour-features');
    Object.entries(window.SeymourCore.transformations).forEach(([key, transform]) => {
      const button = document.createElement('button');
      button.innerHTML = `${transform.icon} ${transform.name}`;
      button.title = transform.description;
      button.style.cssText = `
        display: block;
        width: 100%;
        padding: 10px;
        margin: 5px 0;
        border: 1px solid #eee;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        text-align: left;
        transition: all 0.3s;
      `;

      button.onclick = () => {
        window.SeymourCore.apply(key);
        button.style.background = window.SeymourCore.active.has(key)
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'white';
        button.style.color = window.SeymourCore.active.has(key) ? 'white' : 'black';
      };

      featuresContainer.appendChild(button);
    });

    // Make UI draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    const dragStart = (e) => {
      if (e.target.tagName !== 'H3') return;

      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target === ui.querySelector('h3')) {
        isDragging = true;
      }
    };

    const dragEnd = () => {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    };

    const drag = (e) => {
      if (!isDragging) return;

      e.preventDefault();

      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      }

      xOffset = currentX;
      yOffset = currentY;

      ui.style.transform = `translate(${currentX}px, ${currentY}px)`;
    };

    ui.addEventListener('touchstart', dragStart, false);
    ui.addEventListener('touchend', dragEnd, false);
    ui.addEventListener('touchmove', drag, false);
    ui.addEventListener('mousedown', dragStart, false);
    ui.addEventListener('mouseup', dragEnd, false);
    ui.addEventListener('mousemove', drag, false);
  }

  // Initialize UI
  createUI();
  window.SeymourCore.showNotification('SuperSeymour loaded! ✨');

})();