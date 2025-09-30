// SuperSeymour API Key Manager - Browser Password Manager Integration
// This clever approach uses the browser's built-in password manager to securely store API keys

(function() {
    'use strict';

    class SuperSeymourAPIManager {
        constructor() {
            this.STORAGE_KEY = 'ss_api_config';
            this.keys = {};
            this.initialized = false;
        }

        // Initialize the API key manager
        async init() {
            // Check if we already have keys in memory
            if (this.initialized) return this.keys;

            // Try to trigger autofill
            const autofilledKeys = await this.checkForAutofill();
            if (autofilledKeys) {
                this.keys = autofilledKeys;
                this.initialized = true;
                return this.keys;
            }

            // Show the key management UI
            return this.showKeyManager();
        }

        // Create the API key management interface
        showKeyManager() {
            // Remove any existing manager
            const existing = document.getElementById('ss-api-manager');
            if (existing) existing.remove();

            // Create the UI
            const manager = document.createElement('div');
            manager.id = 'ss-api-manager';
            manager.innerHTML = `
                <style>
                    #ss-api-manager {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: white;
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        z-index: 2147483647;
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                        max-width: 500px;
                        width: 90%;
                    }

                    #ss-api-manager h2 {
                        margin: 0 0 20px 0;
                        color: #333;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    #ss-api-manager .icon {
                        font-size: 28px;
                    }

                    #ss-api-form {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }

                    #ss-api-form .input-group {
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                    }

                    #ss-api-form label {
                        font-size: 12px;
                        color: #666;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    #ss-api-form input[type="password"],
                    #ss-api-form input[type="text"] {
                        padding: 12px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 14px;
                        font-family: monospace;
                        transition: border-color 0.3s;
                    }

                    #ss-api-form input:focus {
                        outline: none;
                        border-color: #667eea;
                    }

                    #ss-api-form input[type="text"][readonly] {
                        display: none;
                    }

                    .button-group {
                        display: flex;
                        gap: 10px;
                        margin-top: 10px;
                    }

                    #ss-api-form button {
                        flex: 1;
                        padding: 12px;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s;
                    }

                    #ss-api-form button:hover {
                        transform: translateY(-2px);
                    }

                    #ss-save-btn {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }

                    #ss-cancel-btn {
                        background: #f0f0f0;
                        color: #666;
                    }

                    #ss-skip-btn {
                        background: transparent;
                        color: #999;
                        text-decoration: underline;
                        padding: 5px;
                    }

                    .info-box {
                        background: #e3f2fd;
                        border-left: 4px solid #2196f3;
                        padding: 12px;
                        border-radius: 4px;
                        font-size: 13px;
                        color: #555;
                        margin-bottom: 15px;
                    }

                    .success-message {
                        background: #d4edda;
                        color: #155724;
                        padding: 12px;
                        border-radius: 8px;
                        margin-top: 15px;
                        display: none;
                    }

                    .show-key-toggle {
                        position: absolute;
                        right: 12px;
                        top: 50%;
                        transform: translateY(-50%);
                        cursor: pointer;
                        user-select: none;
                    }

                    .input-wrapper {
                        position: relative;
                    }
                </style>

                <h2><span class="icon">🔐</span> SuperSeymour API Keys</h2>

                <div class="info-box">
                    💡 Your browser will offer to save these as passwords. This is the most secure way to store API keys locally!
                </div>

                <form id="ss-api-form" autocomplete="on">
                    <!-- Hidden username field for password manager -->
                    <input type="text"
                           name="username"
                           value="superseymour_api_keys"
                           autocomplete="username"
                           readonly
                           style="display: none;">

                    <!-- OpenAI API Key -->
                    <div class="input-group">
                        <label for="ss-openai-key">OpenAI API Key</label>
                        <div class="input-wrapper">
                            <input type="password"
                                   id="ss-openai-key"
                                   name="openai_api_key"
                                   placeholder="sk-proj-..."
                                   autocomplete="current-password"
                                   data-lpignore="true">
                            <span class="show-key-toggle" onclick="toggleVisibility('ss-openai-key')">👁️</span>
                        </div>
                    </div>

                    <!-- Anthropic API Key -->
                    <div class="input-group">
                        <label for="ss-anthropic-key">Anthropic API Key (Claude)</label>
                        <div class="input-wrapper">
                            <input type="password"
                                   id="ss-anthropic-key"
                                   name="anthropic_api_key"
                                   placeholder="sk-ant-..."
                                   autocomplete="new-password">
                            <span class="show-key-toggle" onclick="toggleVisibility('ss-anthropic-key')">👁️</span>
                        </div>
                    </div>

                    <!-- Google API Key -->
                    <div class="input-group">
                        <label for="ss-google-key">Google AI API Key (Optional)</label>
                        <div class="input-wrapper">
                            <input type="password"
                                   id="ss-google-key"
                                   name="google_api_key"
                                   placeholder="AIza..."
                                   autocomplete="new-password">
                            <span class="show-key-toggle" onclick="toggleVisibility('ss-google-key')">👁️</span>
                        </div>
                    </div>

                    <div class="button-group">
                        <button type="submit" id="ss-save-btn">Save Keys</button>
                        <button type="button" id="ss-cancel-btn">Cancel</button>
                    </div>

                    <button type="button" id="ss-skip-btn">Skip for now</button>

                    <div class="success-message" id="ss-success">
                        ✅ Keys saved! Your browser should remember them.
                    </div>
                </form>
            `;

            document.body.appendChild(manager);

            // Set up event handlers
            this.attachEventHandlers();

            return new Promise((resolve) => {
                this.resolvePromise = resolve;
            });
        }

        // Attach event handlers to the form
        attachEventHandlers() {
            const form = document.getElementById('ss-api-form');
            const cancelBtn = document.getElementById('ss-cancel-btn');
            const skipBtn = document.getElementById('ss-skip-btn');

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSave();
            });

            cancelBtn.addEventListener('click', () => {
                this.close();
            });

            skipBtn.addEventListener('click', () => {
                this.close();
            });

            // Toggle password visibility
            window.toggleVisibility = (fieldId) => {
                const field = document.getElementById(fieldId);
                const toggle = field.nextElementSibling;

                if (field.type === 'password') {
                    field.type = 'text';
                    toggle.textContent = '🙈';
                } else {
                    field.type = 'password';
                    toggle.textContent = '👁️';
                }
            };
        }

        // Handle form submission
        handleSave() {
            const openaiKey = document.getElementById('ss-openai-key').value;
            const anthropicKey = document.getElementById('ss-anthropic-key').value;
            const googleKey = document.getElementById('ss-google-key').value;

            // Store in memory
            this.keys = {
                openai: openaiKey,
                anthropic: anthropicKey,
                google: googleKey
            };

            // Also store a flag in localStorage (not the keys themselves!)
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                configured: true,
                timestamp: Date.now(),
                // Don't store actual keys, just metadata
                hasOpenAI: !!openaiKey,
                hasAnthropic: !!anthropicKey,
                hasGoogle: !!googleKey
            }));

            // Show success message
            const successMsg = document.getElementById('ss-success');
            successMsg.style.display = 'block';

            // Browser should now prompt to save password
            // The form submission will trigger the password manager

            // Close after delay
            setTimeout(() => {
                this.close(this.keys);
            }, 2000);

            this.initialized = true;
        }

        // Check if browser has autofilled the keys
        async checkForAutofill() {
            // Create a hidden form to trigger autofill
            const testForm = document.createElement('form');
            testForm.style.position = 'absolute';
            testForm.style.left = '-9999px';
            testForm.innerHTML = `
                <input type="text" name="username" value="superseymour_api_keys" autocomplete="username">
                <input type="password" id="ss-test-openai" name="openai_api_key" autocomplete="current-password">
                <input type="password" id="ss-test-anthropic" name="anthropic_api_key" autocomplete="new-password">
            `;

            document.body.appendChild(testForm);

            // Wait a bit for autofill to trigger
            await new Promise(resolve => setTimeout(resolve, 500));

            const openaiField = document.getElementById('ss-test-openai');
            const anthropicField = document.getElementById('ss-test-anthropic');

            let keys = null;
            if (openaiField && openaiField.value) {
                keys = {
                    openai: openaiField.value,
                    anthropic: anthropicField ? anthropicField.value : ''
                };
                console.log('🔐 API keys loaded from browser password manager');
            }

            // Clean up
            testForm.remove();

            return keys;
        }

        // Close the manager
        close(keys = null) {
            const manager = document.getElementById('ss-api-manager');
            if (manager) {
                manager.remove();
            }

            if (this.resolvePromise) {
                this.resolvePromise(keys || this.keys);
            }
        }

        // Make an API call with stored keys
        async callOpenAI(prompt, options = {}) {
            if (!this.keys.openai) {
                throw new Error('OpenAI API key not configured');
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.keys.openai}`
                },
                body: JSON.stringify({
                    model: options.model || 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    ...options
                })
            });

            return response.json();
        }

        // Make an API call to Claude
        async callClaude(prompt, options = {}) {
            if (!this.keys.anthropic) {
                throw new Error('Anthropic API key not configured');
            }

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.keys.anthropic,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: options.model || 'claude-3-opus-20240229',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: options.max_tokens || 1000
                })
            });

            return response.json();
        }

        // Check if keys are configured
        hasKeys() {
            const config = localStorage.getItem(this.STORAGE_KEY);
            if (config) {
                const parsed = JSON.parse(config);
                return parsed.configured === true;
            }
            return false;
        }

        // Clear stored configuration (not the passwords themselves)
        clearConfig() {
            localStorage.removeItem(this.STORAGE_KEY);
            this.keys = {};
            this.initialized = false;
            console.log('🔐 API key configuration cleared. Browser may still remember passwords.');
        }
    }

    // Export to window
    window.SuperSeymourAPI = new SuperSeymourAPIManager();

    // Auto-init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Check if keys might be available
            if (window.SuperSeymourAPI.hasKeys()) {
                console.log('🔐 SuperSeymour API keys may be available via browser password manager');
            }
        });
    }

})();

// Usage example:
/*
// Initialize and get API keys
const keys = await SuperSeymourAPI.init();

// Make API calls
const response = await SuperSeymourAPI.callOpenAI('Hello, how are you?');
console.log(response);

// Check if configured
if (SuperSeymourAPI.hasKeys()) {
    console.log('API keys are configured');
}
*/