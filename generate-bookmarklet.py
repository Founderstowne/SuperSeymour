#!/usr/bin/env python3

import json
import urllib.parse

# Read the activation-poc.js file
with open('activation-poc.js', 'r') as f:
    js_code = f.read()

# Create the bookmarklet URL
bookmarklet = 'javascript:' + urllib.parse.quote(js_code, safe='')

# Create the HTML with embedded bookmarklet
html_content = f'''<!DOCTYPE html>
<html>
<head>
    <title>SuperSeymour - Complete Local Bookmarklet</title>
    <style>
        body {{
            font-family: -apple-system, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }}
        .container {{
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }}
        h1 {{
            color: #333;
            margin-bottom: 10px;
        }}
        .bookmarklet {{
            display: inline-block;
            padding: 20px 40px;
            background: linear-gradient(135deg, #0066cc, #0099ff);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.2rem;
            margin: 30px 0;
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: move;
        }}
        .bookmarklet:hover {{
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0,102,204,0.4);
        }}
        .info {{
            background: #f0f8ff;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border-left: 4px solid #0066cc;
        }}
        .features {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }}
        .feature {{
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }}
        .feature-icon {{
            font-size: 2rem;
            margin-bottom: 10px;
        }}
        code {{
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }}
        .success {{
            background: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }}
        .stats {{
            background: #e8f4fd;
            border-left: 4px solid #0066cc;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>⚡ SuperSeymour - Complete Edition</h1>
        <p style="color: #666; font-size: 1.1rem;">The full activation-poc.js embedded as a bookmarklet. No server required!</p>

        <div class="success">
            <strong>✅ Successfully Generated!</strong><br>
            The bookmarklet below contains the complete SuperSeymour code.
        </div>

        <div class="stats">
            <strong>📊 Bookmarklet Stats:</strong><br>
            • Original code size: {len(js_code):,} bytes ({len(js_code)//1024} KB)<br>
            • Bookmarklet size: {len(bookmarklet):,} bytes ({len(bookmarklet)//1024} KB)<br>
            • Features: Animated orb, draggable UI, radial menu, 4 transformation modes
        </div>

        <center>
            <a href="{bookmarklet}" class="bookmarklet">
                ⚡ SuperSeymour
            </a>
            <p style="color: #666;">↑ Drag this button to your bookmarks bar</p>
        </center>

        <div class="info">
            <h3>📚 Installation Instructions</h3>
            <ol>
                <li><strong>Show your bookmarks bar:</strong> Press <code>Cmd+Shift+B</code> (Mac) or <code>Ctrl+Shift+B</code> (PC)</li>
                <li><strong>Drag the blue button</strong> above to your bookmarks bar</li>
                <li><strong>Click the bookmark</strong> on any website to activate SuperSeymour</li>
                <li><strong>Click the glowing orb</strong> to see the radial menu</li>
            </ol>
        </div>

        <h3>✨ What You Get</h3>
        <div class="features">
            <div class="feature">
                <div class="feature-icon">🎨</div>
                <strong>Animated Seymour Logo</strong><br>
                Beautiful SVG with glow effects
            </div>
            <div class="feature">
                <div class="feature-icon">🎯</div>
                <strong>Draggable Orb</strong><br>
                Drag to any corner
            </div>
            <div class="feature">
                <div class="feature-icon">🌀</div>
                <strong>Radial Menu</strong><br>
                Smart positioning based on corner
            </div>
            <div class="feature">
                <div class="feature-icon">📖</div>
                <strong>Reader Mode</strong><br>
                Extract and beautify articles
            </div>
            <div class="feature">
                <div class="feature-icon">🌙</div>
                <strong>Dark Mode</strong><br>
                Intelligent color inversion
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <strong>Speed Mode</strong><br>
                Remove ads and annoyances
            </div>
            <div class="feature">
                <div class="feature-icon">🧘</div>
                <strong>Zen Mode</strong><br>
                Minimal, focused view
            </div>
            <div class="feature">
                <div class="feature-icon">🔒</div>
                <strong>100% Private</strong><br>
                No server, no tracking
            </div>
        </div>

        <div class="info">
            <strong>💡 Pro Tips:</strong>
            <ul>
                <li>The orb automatically snaps to the nearest corner when dragged</li>
                <li>The radial menu adjusts based on which corner the orb is in</li>
                <li>Click the orb again to close the menu</li>
                <li>The bookmarklet works on ANY website</li>
            </ul>
        </div>
    </div>
</body>
</html>'''

# Write the complete HTML file
with open('bookmarklet-complete.html', 'w') as f:
    f.write(html_content)

print("✅ Generated bookmarklet-complete.html")
print(f"📊 Bookmarklet size: {len(bookmarklet)//1024} KB")
print("🎯 Open bookmarklet-complete.html in your browser to use it!")