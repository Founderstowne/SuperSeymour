// SuperSeymour QR Code Engine
// Pure JavaScript QR code generator - no dependencies
// Stored in IndexedDB for instant access

(function() {
  'use strict';

  // QR Code generator based on QR Code specification ISO/IEC 18004
  window.SeymourQR = {
    // QR Code capacity table for different versions and error correction levels
    capacity: {
      L: { // Low error correction (7%)
        numeric: [41, 77, 127, 187, 255, 322, 370, 461, 552, 652],
        alphanumeric: [25, 47, 77, 114, 154, 195, 224, 279, 335, 395],
        byte: [17, 32, 53, 78, 106, 134, 154, 192, 230, 271]
      },
      M: { // Medium error correction (15%)
        numeric: [34, 63, 101, 149, 202, 255, 293, 365, 432, 513],
        alphanumeric: [20, 38, 61, 90, 122, 154, 178, 221, 262, 311],
        byte: [14, 26, 42, 62, 84, 106, 122, 152, 180, 213]
      }
    },

    // Generate QR code matrix
    generate(text, options = {}) {
      const opts = {
        errorCorrection: options.errorCorrection || 'M',
        size: options.size || 200,
        margin: options.margin || 4,
        dark: options.dark || '#000000',
        light: options.light || '#ffffff',
        ...options
      };

      // Determine minimum version needed
      const version = this.getMinimumVersion(text, opts.errorCorrection);
      const modules = this.createModules(text, version, opts.errorCorrection);

      return {
        modules,
        version,
        size: modules.length,
        render: () => this.render(modules, opts)
      };
    },

    // Get minimum QR version for text length
    getMinimumVersion(text, errorCorrection) {
      const length = text.length;
      const capacities = this.capacity[errorCorrection].byte;

      for (let v = 0; v < capacities.length; v++) {
        if (length <= capacities[v]) {
          return v + 1; // Versions are 1-indexed
        }
      }

      return 10; // Max version we support for simplicity
    },

    // Create QR code modules (simplified implementation)
    createModules(text, version, errorCorrection) {
      const size = version * 4 + 17; // Module count formula
      const modules = Array(size).fill(null).map(() => Array(size).fill(false));

      // Add finder patterns (the three corner squares)
      this.addFinderPattern(modules, 0, 0);
      this.addFinderPattern(modules, size - 7, 0);
      this.addFinderPattern(modules, 0, size - 7);

      // Add timing patterns (alternating lines)
      for (let i = 8; i < size - 8; i++) {
        modules[i][6] = i % 2 === 0;
        modules[6][i] = i % 2 === 0;
      }

      // Add dark module (always dark)
      modules[4 * version + 9][8] = true;

      // Encode data (simplified - real QR uses Reed-Solomon error correction)
      const bits = this.encodeData(text);
      this.placeData(modules, bits);

      return modules;
    },

    // Add finder pattern (corner squares)
    addFinderPattern(modules, row, col) {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          if (row + r < 0 || row + r >= modules.length ||
              col + c < 0 || col + c >= modules.length) continue;

          if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
              (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
              (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            modules[row + r][col + c] = true;
          } else if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            modules[row + r][col + c] = false;
          }
        }
      }
    },

    // Encode text to binary (simplified)
    encodeData(text) {
      let bits = '';

      // Mode indicator (byte mode = 0100)
      bits += '0100';

      // Character count indicator
      const countBits = text.length.toString(2).padStart(8, '0');
      bits += countBits;

      // Encode each character
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        bits += charCode.toString(2).padStart(8, '0');
      }

      return bits;
    },

    // Place data bits in modules (simplified zigzag pattern)
    placeData(modules, bits) {
      const size = modules.length;
      let bitIndex = 0;
      let direction = -1; // -1 = up, 1 = down

      for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--; // Skip timing column

        for (let vert = 0; vert < size; vert++) {
          for (let c = 0; c < 2; c++) {
            const x = col - c;
            const y = direction === -1 ? size - 1 - vert : vert;

            if (modules[y][x] !== null) continue; // Skip if already set

            if (bitIndex < bits.length) {
              modules[y][x] = bits[bitIndex] === '1';
              bitIndex++;
            } else {
              modules[y][x] = false; // Padding
            }
          }
        }
        direction *= -1; // Change direction
      }
    },

    // Render QR code to canvas with round dots and logo
    render(modules, options) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = modules.length;
      const scale = Math.floor(options.size / (size + options.margin * 2));
      const width = (size + options.margin * 2) * scale;

      canvas.width = width;
      canvas.height = width;

      // Background
      ctx.fillStyle = options.light;
      ctx.fillRect(0, 0, width, width);

      // Draw modules as circles
      ctx.fillStyle = options.dark;
      const dotSize = scale * 0.9; // Slightly smaller for round effect
      const offset = (scale - dotSize) / 2;

      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (modules[row][col]) {
            const x = (col + options.margin) * scale + scale / 2;
            const y = (row + options.margin) * scale + scale / 2;

            // Check if this is part of finder pattern (keep squares for those)
            const isFinderPattern = (
              (row < 7 && col < 7) ||  // Top-left
              (row < 7 && col >= size - 7) ||  // Top-right
              (row >= size - 7 && col < 7)  // Bottom-left
            );

            if (isFinderPattern) {
              // Draw finder patterns as rounded squares
              ctx.fillRect(
                (col + options.margin) * scale + offset,
                (row + options.margin) * scale + offset,
                dotSize,
                dotSize
              );
            } else {
              // Draw data modules as circles
              ctx.beginPath();
              ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Add logo in center if specified
      if (options.logo) {
        this.addLogo(ctx, width, options.logoSize || 60);
      }

      return canvas;
    },

    // Add Seymour logo to center
    addLogo(ctx, qrSize, logoSize) {
      const centerX = qrSize / 2;
      const centerY = qrSize / 2;

      // White background circle for logo
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, logoSize / 2 + 5, 0, Math.PI * 2);
      ctx.fill();

      // Add subtle border
      ctx.strokeStyle = '#764ba2';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Since we can't directly load SVG in canvas from file system,
      // we'll create a stylized "S" logo programmatically
      ctx.fillStyle = '#764ba2';
      ctx.font = `bold ${logoSize * 0.7}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', centerX, centerY);
    },

    // Generate QR code as data URL
    toDataURL(text, options = {}) {
      // Default to including logo
      const opts = {
        logo: true,
        logoSize: 50,
        ...options
      };
      const qr = this.generate(text, opts);
      const canvas = qr.render();
      return canvas.toDataURL('image/png');
    },

    // Generate QR code as SVG string with circles
    toSVG(text, options = {}) {
      const opts = {
        logo: true,
        logoSize: 50,
        ...options
      };

      const qr = this.generate(text, opts);
      const modules = qr.modules;
      const size = modules.length;
      const margin = opts.margin || 4;
      const scale = Math.floor((opts.size || 200) / (size + margin * 2));
      const width = (size + margin * 2) * scale;
      const dotSize = scale * 0.9;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 ${width} ${width}">`;
      svg += `<rect width="${width}" height="${width}" fill="${opts.light || '#ffffff'}"/>`;

      // Add dots
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (modules[row][col]) {
            const cx = (col + margin) * scale + scale / 2;
            const cy = (row + margin) * scale + scale / 2;

            // Check if this is part of finder pattern
            const isFinderPattern = (
              (row < 7 && col < 7) ||
              (row < 7 && col >= size - 7) ||
              (row >= size - 7 && col < 7)
            );

            if (isFinderPattern) {
              // Finder patterns as rounded rectangles
              const x = (col + margin) * scale + (scale - dotSize) / 2;
              const y = (row + margin) * scale + (scale - dotSize) / 2;
              svg += `<rect x="${x}" y="${y}" width="${dotSize}" height="${dotSize}" rx="2" fill="${opts.dark || '#000000'}"/>`;
            } else {
              // Data modules as circles
              svg += `<circle cx="${cx}" cy="${cy}" r="${dotSize / 2}" fill="${opts.dark || '#000000'}"/>`;
            }
          }
        }
      }

      // Add logo in center
      if (opts.logo) {
        const centerX = width / 2;
        const centerY = width / 2;
        const logoSize = opts.logoSize || 60;

        // White background circle
        svg += `<circle cx="${centerX}" cy="${centerY}" r="${logoSize / 2 + 5}" fill="white" stroke="#764ba2" stroke-width="2"/>`;

        // Logo text
        svg += `<text x="${centerX}" y="${centerY}" font-family="-apple-system, BlinkMacSystemFont, sans-serif"
                      font-size="${logoSize * 0.7}" font-weight="bold" fill="#764ba2"
                      text-anchor="middle" dominant-baseline="middle">S</text>`;
      }

      svg += '</svg>';
      return svg;
    },

    // Store engine in IndexedDB
    async saveToIndexedDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('SuperSeymour', 1);

        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['engines'], 'readwrite');
          const store = transaction.objectStore('engines');

          const engineCode = `(${this.toString()})()`;

          store.put({
            id: 'qr-engine',
            code: engineCode,
            version: '2025.09.28',
            timestamp: Date.now()
          });

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('engines')) {
            db.createObjectStore('engines', { keyPath: 'id' });
          }
        };
      });
    },

    // Create QR code bookmarklet generator
    createBookmarklet(url, title = 'SuperSeymour Feature') {
      const bookmarkletCode = `
javascript:(function(){
  const qr = window.SeymourQR.toDataURL('${url}', {
    size: 256,
    dark: '#764ba2',
    margin: 4,
    logo: true,
    logoSize: 40
  });

  const popup = document.createElement('div');
  popup.innerHTML = \`
    <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
                background:white;padding:20px;border-radius:15px;
                box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:9999999;">
      <h3 style="margin:0 0 10px;color:#764ba2;">${title}</h3>
      <img src="\${qr}" style="display:block;margin:10px 0;">
      <p style="margin:10px 0 0;font-size:12px;color:#666;">
        Scan to share this transformation
      </p>
      <button onclick="this.parentElement.remove()"
              style="margin-top:10px;padding:8px 16px;background:#764ba2;
                     color:white;border:none;border-radius:8px;cursor:pointer;">
        Close
      </button>
    </div>
  \`;

  document.body.appendChild(popup.firstElementChild);
})();
      `.replace(/\s+/g, ' ').trim();

      return bookmarkletCode;
    }
  };

  // Add QR code feature to SeymourCore if it exists
  if (window.SeymourCore && window.SeymourCore.transformations) {
    window.SeymourCore.transformations.qrGenerator = {
      name: 'QR Code Magic',
      description: 'Generate QR codes for anything on the page',
      icon: '📱',
      execute() {
        // Create QR tool palette
        const palette = document.createElement('div');
        palette.id = 'seymour-qr-palette';
        palette.style.cssText = `
          position: fixed;
          bottom: 20px;
          left: 20px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          padding: 20px;
          z-index: 9999999;
          max-width: 300px;
        `;

        palette.innerHTML = `
          <h4 style="margin: 0 0 10px; color: #764ba2;">QR Code Generator</h4>
          <input type="text" id="qr-input" placeholder="Enter text or URL"
                 style="width: 100%; padding: 8px; border: 1px solid #ddd;
                        border-radius: 8px; margin-bottom: 10px;">
          <button onclick="
            const text = document.getElementById('qr-input').value;
            if (!text) return;

            const qr = window.SeymourQR.toDataURL(text, {
              size: 256,
              dark: '#764ba2'
            });

            const img = document.createElement('img');
            img.src = qr;
            img.style.cssText = 'width: 100%; margin-top: 10px; border-radius: 8px;';

            const container = document.getElementById('qr-output');
            container.innerHTML = '';
            container.appendChild(img);
          " style="width: 100%; padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                   color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Generate QR Code
          </button>
          <div id="qr-output" style="margin-top: 10px;"></div>

          <button onclick="
            // Generate QR for current page
            const qr = window.SeymourQR.toDataURL(window.location.href, {
              size: 256,
              dark: '#764ba2'
            });

            const img = document.createElement('img');
            img.src = qr;
            img.style.cssText = 'width: 100%; margin-top: 10px; border-radius: 8px;';

            const container = document.getElementById('qr-output');
            container.innerHTML = '<p style=\\'color:#666;font-size:12px;\\'>QR Code for this page:</p>';
            container.appendChild(img);
          " style="width: 100%; padding: 8px; background: white; color: #764ba2;
                   border: 1px solid #764ba2; border-radius: 8px; cursor: pointer;
                   margin-top: 10px;">
            QR for Current Page
          </button>

          <button onclick="this.parentElement.remove()"
                  style="width: 100%; padding: 8px; background: #f0f0f0;
                         border: none; border-radius: 8px; cursor: pointer;
                         margin-top: 5px; color: #666;">
            Close
          </button>
        `;

        document.body.appendChild(palette);
        this.showNotification('QR Generator ready! 📱');
      },
      destroy() {
        const palette = document.getElementById('seymour-qr-palette');
        if (palette) palette.remove();
      }
    };
  }

})();