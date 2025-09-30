// SuperSeymour Installer Generator - Pure Rust Solution
// Properly encodes JavaScript for embedding in HTML

use std::fs;
use std::io::Write;

fn main() {
    println!("🚀 SuperSeymour Installer Generator (Rust Edition)");
    println!("==================================================");

    // Read the activation code
    let activation_code = match fs::read_to_string("activation-poc.js") {
        Ok(code) => code,
        Err(e) => {
            eprintln!("❌ Failed to read activation-poc.js: {}", e);
            std::process::exit(1);
        }
    };

    println!("✅ Loaded activation-poc.js: {} bytes", activation_code.len());

    // Convert to base64 for safe embedding
    let encoded = base64_encode(&activation_code);
    println!("📦 Encoded size: {} bytes", encoded.len());

    // Generate the HTML with embedded base64 code
    let html = generate_installer_html(&encoded);

    // Write the installer HTML
    match fs::File::create("superseymour-installer-rust.html") {
        Ok(mut file) => {
