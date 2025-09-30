// SuperSeymour Bookmarklet Generator - Pure Rust, Zero Dependencies
// Founderstowne Academy - Building tools that empower

use std::fs;
use std::io::Write;
use std::path::Path;

fn main() {
    println!("⚡ SuperSeymour Bookmarklet Generator");
    println!("=====================================");

    // Read the activation-poc.js file
    let js_path = Path::new("activation-poc.js");
    let js_code = match fs::read_to_string(js_path) {
        Ok(content) => content,
        Err(e) => {
            eprintln!("❌ Failed to read activation-poc.js: {}", e);
            std::process::exit(1);
        }
    };

    println!("✅ Loaded activation-poc.js: {} bytes", js_code.len());

    // URL encode the JavaScript for bookmarklet
    let encoded = url_encode(&js_code);
    let bookmarklet = format!("javascript:{}", encoded);

    println!("📦 Bookmarklet size: {} KB", bookmarklet.len() / 1024);

    // Generate the HTML page
    let html = generate_html(&bookmarklet, js_code.len(), bookmarklet.len());

    // Write the HTML file
    let output_path = Path::new("bookmarklet-rust.html");
    match fs::File::create(output_path) {
        Ok(mut file) => {
            if let Err(e) = file.write_all(html.as_bytes()) {
                eprintln!("❌ Failed to write HTML file: {}", e);
                std::process::exit(1);
            }
        }
        Err(e) => {
            eprintln!("❌ Failed to create HTML file: {}", e);
            std::process::exit(1);
        }
    }

    println!("✨ Generated bookmarklet-rust.html");
    println!("🚀 Open the file in your browser and drag the button to bookmarks!");
    println!("\n📊 Stats:");
    println!("   Original JS: {} KB", js_code.len() / 1024);
    println!("   Bookmarklet: {} KB", bookmarklet.len() / 1024);
    println!("   Compression: {}%", (bookmarklet.len() * 100) / js_code.len());
}

// URL encode implementation without external dependencies
fn url_encode(input: &str) -> String {
    let mut result = String::with_capacity(input.len() * 3);

    for byte in input.bytes() {
        match byte {
            // Unreserved characters (RFC 3986)
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                result.push(byte as char);
            }
            // Everything else gets percent-encoded
            _ => {
                result.push_str(&format!("%{:02X}", byte));
            }
        }
    }

    result
}

fn generate_html(bookmarklet: &str, original_size: usize, encoded_size: usize) -> String {
    format!(r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuperSeymour - Rust-Generated Bookmarklet 🦀</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }}

        .container {{
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 900px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }}

        h1 {{
            color: #333;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }}

        .rust-badge {{
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }}

        .subtitle {{
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1rem;
        }}

        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }}

        .stat-card {{
            background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }}

        .stat-value {{
            font-size: 2rem;
            font-weight: bold;
            color: #0066cc;
        }}

        .stat-label {{
            color: #666;
            margin-top: 5px;
        }}

        .bookmarklet-container {{
            background: linear-gradient(135deg, #0066cc, #0099ff);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
        }}

        .bookmarklet-container::before {{
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
        }}

        @keyframes pulse {{
            0%, 100% {{ transform: scale(1); }}
            50% {{ transform: scale(1.1); }}
        }}

        .bookmarklet {{
            display: inline-block;
            padding: 20px 50px;
            background: white;
            color: #0066cc;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 700;
            font-size: 1.3rem;
            transition: all 0.3s ease;
            cursor: move;
            position: relative;
            z-index: 1;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }}

        .bookmarklet:hover {{
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }}

        .bookmarklet:active {{
            transform: translateY(-1px);
        }}

        .drag-hint {{
            color: white;
            margin-top: 20px;
            font-size: 1.1rem;
            opacity: 0.9;
        }}

        .info-box {{
            background: #e8f4fd;
            border-left: 4px solid #0066cc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }}

        .feature-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }}

        .feature {{
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            transition: transform 0.2s;
        }}

        .feature:hover {{
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }}

        .feature-icon {{
            font-size: 2rem;
            margin-bottom: 10px;
        }}

        .success-banner {{
            background: linear-gradient(135deg, #00c851, #00ff00);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
        }}

        code {{
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
        }}

        .rust-footer {{
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #666;
        }}

        .rust-logo {{
            font-size: 2rem;
            color: #ff6b6b;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>
            ⚡ SuperSeymour
            <span class="rust-badge">🦀 Rust Edition</span>
        </h1>
        <p class="subtitle">100% Pure Rust. Zero Dependencies. Maximum Freedom.</p>

        <div class="success-banner">
            ✅ Bookmarklet Generated Successfully with Rust!
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">{}</div>
                <div class="stat-label">Original Size (KB)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{}</div>
                <div class="stat-label">Encoded Size (KB)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">0</div>
                <div class="stat-label">Dependencies</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">∞</div>
                <div class="stat-label">Freedom</div>
            </div>
        </div>

        <div class="bookmarklet-container">
            <a href="{}" class="bookmarklet">
                ⚡ SuperSeymour
            </a>
            <div class="drag-hint">
                ↑ Drag this button to your bookmarks bar
            </div>
        </div>

        <div class="info-box">
            <h3>🚀 Installation Instructions</h3>
            <ol>
                <li>Show your bookmarks bar: <code>Cmd+Shift+B</code> (Mac) or <code>Ctrl+Shift+B</code> (PC)</li>
                <li>Drag the ⚡ SuperSeymour button to your bookmarks bar</li>
                <li>Click the bookmark on any website to activate</li>
                <li>Click the glowing orb to see the radial menu</li>
            </ol>
        </div>

        <h3>✨ Features Included</h3>
        <div class="feature-grid">
            <div class="feature">
                <div class="feature-icon">🎨</div>
                <strong>Animated Orb</strong>
            </div>
            <div class="feature">
                <div class="feature-icon">🎯</div>
                <strong>Draggable UI</strong>
            </div>
            <div class="feature">
                <div class="feature-icon">🌀</div>
                <strong>Radial Menu</strong>
            </div>
            <div class="feature">
                <div class="feature-icon">📖</div>
                <strong>Reader Mode</strong>
            </div>
            <div class="feature">
                <div class="feature-icon">🌙</div>
                <strong>Dark Mode</strong>
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <strong>Speed Mode</strong>
            </div>
            <div class="feature">
                <div class="feature-icon">🧘</div>
                <strong>Zen Mode</strong>
            </div>
            <div class="feature">
                <div class="feature-icon">🔒</div>
                <strong>100% Private</strong>
            </div>
        </div>

        <div class="info-box" style="background: #fff3cd; border-color: #ffc107;">
            <strong>🦀 Why Rust?</strong><br>
            This bookmarklet generator is built with pure Rust - no Python, no Node.js, no external dependencies.
            Just blazingly fast, memory-safe code that respects your freedom.
            <br><br>
            <em>Founderstowne Philosophy: If it can't be done in Rust, reconsider if we need it.</em>
        </div>

        <div class="rust-footer">
            <div class="rust-logo">🦀</div>
            <p>Built with Rust • Zero Dependencies • Maximum Paranoia</p>
            <p style="margin-top: 10px; font-size: 0.9rem;">
                Generated: {} | Founderstowne Academy
            </p>
        </div>
    </div>
</body>
</html>"#,
        original_size / 1024,
        encoded_size / 1024,
        bookmarklet,
        chrono_free_timestamp()
    )
}

// Get current timestamp without using chrono
fn chrono_free_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();

    let total_seconds = duration.as_secs();
    let days_since_epoch = total_seconds / 86400;

    // Rough approximation - good enough for our purposes
    let year = 1970 + (days_since_epoch / 365);
    let remaining_days = days_since_epoch % 365;
    let month = (remaining_days / 30) + 1;
    let day = (remaining_days % 30) + 1;

    format!("{:04}.{:02}.{:02}", year, month, day)
}