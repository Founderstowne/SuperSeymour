// SuperSeymour Activation Sequence - Proof of Concept
// Version: 2.0.0 - Toggle functionality added
// Last updated: 2025-09-30 12:45 PM
// This shows what happens when the bookmarklet is clicked

(function() {
    'use strict';

    console.log('SuperSeymour v2.0.0 - Toggle functionality active');

    // Check if already initialized
    if (window.SuperSeymour && window.SuperSeymour.active) {
        window.SuperSeymour.toggle();
        return;
    }

    // Initialize SuperSeymour
    window.SuperSeymour = {
        active: false,
        currentMode: null,
        lastMode: 'reader',
        activeModes: new Set(), // Track which modes are active
        originalStyles: {}, // Store original styles for reverting
        settings: {
            position: 'bottom-right',
            theme: 'auto'
        }
    };

    // Create the magic entrance sequence
    function initializeSuperSeymour() {
        // Step 1: Control orb appears (100ms)
        setTimeout(() => createControlOrb(), 100);

        // Step 2: Quick scan animation (200ms) - just visual effect
        setTimeout(() => scanPage(), 200);

        // Step 3: Show rainbow edge on first activation (300ms)
        setTimeout(() => showRainbowEdge(), 300);

        // Don't auto-apply any transformations - wait for user to click

        window.SuperSeymour.active = true;
    }

    // Create subtle page dimmer
    function createPageDimmer() {
        const dimmer = document.createElement('div');
        dimmer.id = 'superseymour-dimmer';
        dimmer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0);
            z-index: 999995;
            pointer-events: none;
            transition: background 0.3s ease;
        `;
        document.body.appendChild(dimmer);

        // Animate to 10% opacity
        requestAnimationFrame(() => {
            dimmer.style.background = 'rgba(0, 0, 0, 0.1)';
        });
    }

    // Create the control orb with SVG logo
    function createControlOrb() {
        const orb = document.createElement('div');
        orb.id = 'superseymour-orb';
        orb.innerHTML = `
            <div class="ss-orb-inner">
                ${getSeymourLogo()}
                <div class="ss-orb-badge" style="display: none;">3</div>
            </div>
            <div class="ss-ripple"></div>
        `;

        orb.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            z-index: 2147483647;
            cursor: pointer;
            user-select: none;
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        // Set initial position
        window.SuperSeymour.orbPosition = 'bottom-right';

        // Add styles for inner elements
        const style = document.createElement('style');
        style.textContent = `
            .ss-orb-inner {
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0066cc, #0099ff);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 20px rgba(0, 102, 204, 0.4);
                position: relative;
                animation: ss-pulse 2s infinite;
                transition: box-shadow 0.3s ease;
            }

            .ss-orb-inner svg {
                width: 70%;
                height: 70%;
            }

            .ss-orb-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #00c853;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }

            .ss-ripple {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 153, 255, 0.3);
                opacity: 0;
                pointer-events: none;
            }

            .ss-ripple.active {
                animation: ss-ripple-effect 0.6s ease-out;
            }

            @keyframes ss-pulse {
                0%, 100% {
                    box-shadow: 0 4px 20px rgba(0, 102, 204, 0.4);
                }
                50% {
                    box-shadow: 0 4px 25px rgba(0, 102, 204, 0.5);
                }
            }

            @keyframes ss-ripple-effect {
                0% {
                    width: 60px;
                    height: 60px;
                    opacity: 1;
                }
                100% {
                    width: 120px;
                    height: 120px;
                    opacity: 0;
                }
            }

            /* Mobile adjustments */
            @media (max-width: 768px) {
                #superseymour-orb {
                    bottom: 20px !important;
                    right: 20px !important;
                    width: 50px !important;
                    height: 50px !important;
                }
            }

            /* Hover state - removed transform to prevent jumpy scaling */
            #superseymour-orb:hover .ss-orb-inner {
                box-shadow: 0 6px 35px rgba(0, 102, 204, 0.7);
            }

            /* Tooltip */
            .ss-tooltip {
                position: absolute;
                bottom: 70px;
                right: 0;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                white-space: nowrap;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
                pointer-events: none;
            }

            .ss-tooltip.show {
                opacity: 1;
                transform: translateY(0);
            }

            /* Radial menu */
            .ss-radial-menu {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }

            .ss-radial-menu.active {
                opacity: 1;
                pointer-events: all;
            }

            .ss-menu-item {
                position: absolute;
                width: 50px;
                height: 50px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .ss-menu-item:hover {
                transform: scale(1.2);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(orb);

        // Animate entrance
        requestAnimationFrame(() => {
            orb.style.opacity = '1';
            orb.style.transform = 'scale(1)';

            // Trigger ripple effect
            const ripple = orb.querySelector('.ss-ripple');
            ripple.classList.add('active');
            setTimeout(() => ripple.classList.remove('active'), 600);
        });

        // Add tooltip on first load
        const tooltip = document.createElement('div');
        tooltip.className = 'ss-tooltip';
        tooltip.textContent = 'SuperSeymour Ready - Click for magic';
        orb.appendChild(tooltip);

        setTimeout(() => {
            tooltip.classList.add('show');
            setTimeout(() => tooltip.classList.remove('show'), 3000);
        }, 1000);

        // Event handlers - simplified since dragging is handled in makeOrbDraggable
        let clickTimeout;

        orb.addEventListener('click', (e) => {
            e.stopPropagation();

            // Use a small timeout to distinguish from drag end
            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(() => {
                // Toggle menu - show if hidden, hide if visible
                const existingMenu = orb.querySelector('.ss-radial-menu');
                if (existingMenu) {
                    existingMenu.classList.remove('active');
                    setTimeout(() => existingMenu.remove(), 300);
                } else {
                    showRadialMenu(orb);
                }
            }, 50);
        });

        // Make orb draggable
        makeOrbDraggable(orb);
    }

    // Get the Seymour logo as inline SVG with full animations
    function getSeymourLogo() {
        return `
            <svg viewBox="0 0 55 65" style="width: 100%; height: 100%;">
                <defs>
                    <!-- Animated gradient for strokes -->
                    <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#00ffff;stop-opacity:1">
                            <animate attributeName="stop-color" values="#00ffff;#0099ff;#6633ff;#00ffff" dur="3s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="50%" style="stop-color:#0099ff;stop-opacity:1">
                            <animate attributeName="stop-color" values="#0099ff;#6633ff;#00ffff;#0099ff" dur="3s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" style="stop-color:#6633ff;stop-opacity:1">
                            <animate attributeName="stop-color" values="#6633ff;#00ffff;#0099ff;#6633ff" dur="3s" repeatCount="indefinite" />
                        </stop>
                    </linearGradient>

                    <!-- Glow filter -->
                    <filter id="glow" height="300%" width="300%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <!-- Background glow aura -->
                <ellipse cx="27.5" cy="32.5" rx="25" ry="30"
                         fill="none"
                         stroke="url(#glowGradient)"
                         stroke-width="0.5"
                         opacity="0.3"
                         filter="url(#glow)">
                    <animate attributeName="rx" values="25;28;25" dur="3s" repeatCount="indefinite"/>
                    <animate attributeName="ry" values="30;33;30" dur="3s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite"/>
                </ellipse>

                <g filter="url(#glow)">
                    <!-- Nose -->
                    <path d="M 27.5 5 C 27.5 5 18 25 18 35 C 18 37 18.5 38 20 38.5 C 21.5 39 23.5 38.5 26 37 C 28 36 30 34.5 32 33 C 30 40 30 45 32 50 C 34 55 38 60 42 62"
                          style="fill:none;stroke:url(#glowGradient);stroke-width:3;stroke-linecap:round;">
                        <animate attributeName="stroke-width" values="3;3.5;3" dur="2s" repeatCount="indefinite"/>
                    </path>

                    <!-- Mouth -->
                    <path d="M 7 50 Q 27.5 58 48 50"
                          style="fill:none;stroke:url(#glowGradient);stroke-width:3;stroke-linecap:round;">
                        <animate attributeName="stroke-width" values="3;3.5;3" dur="2s" begin="0.3s" repeatCount="indefinite"/>
                    </path>

                    <!-- Left eye -->
                    <path d="M 5 14 C 8 16 12 16 15 14"
                          style="fill:none;stroke:url(#glowGradient);stroke-width:3;stroke-linecap:round;">
                        <animate attributeName="stroke-width" values="3;3.5;3" dur="2s" begin="0.6s" repeatCount="indefinite"/>
                    </path>

                    <!-- Right eye -->
                    <path d="M 33 14 C 36 16 40 16 43 14"
                          style="fill:none;stroke:url(#glowGradient);stroke-width:3;stroke-linecap:round;">
                        <animate attributeName="stroke-width" values="3;3.5;3" dur="2s" begin="0.9s" repeatCount="indefinite"/>
                    </path>
                </g>

                <!-- Floating light particles -->
                <circle cx="10" cy="10" r="1" fill="#00ffff" opacity="0">
                    <animate attributeName="cy" values="10;8;10" dur="3s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite"/>
                </circle>

                <circle cx="45" cy="55" r="1" fill="#6633ff" opacity="0">
                    <animate attributeName="cy" values="55;53;55" dur="2.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0;0.8;0" dur="2.5s" repeatCount="indefinite"/>
                </circle>

                <!-- Center sparkle -->
                <circle cx="27.5" cy="32.5" r="1.5" fill="#ffffff" opacity="0.7">
                    <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
                </circle>
            </svg>
        `;
    }

    // Scan page animation
    function scanPage() {
        const scanner = document.createElement('div');
        scanner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, transparent, #0099ff, transparent);
            z-index: 2147483647;
            opacity: 0.8;
            animation: ss-scan 0.5s ease-out;
        `;

        const scanStyle = document.createElement('style');
        scanStyle.textContent = `
            @keyframes ss-scan {
                0% { transform: translateY(0); }
                100% { transform: translateY(100vh); }
            }
        `;
        document.head.appendChild(scanStyle);
        document.body.appendChild(scanner);

        setTimeout(() => scanner.remove(), 500);
    }

    // Siri-style rainbow edge animation
    function showRainbowEdge() {
        // Create the rainbow edge container
        const rainbowEdge = document.createElement('div');
        rainbowEdge.id = 'ss-rainbow-edge';
        rainbowEdge.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 2147483646;
        `;

        // Create the animated gradient border - make it thick and visible!
        const borderWidth = '12px';
        rainbowEdge.innerHTML = `
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: ${borderWidth};
                background: linear-gradient(90deg,
                    #ff0000, #ff00ff, #0000ff, #00ffff,
                    #00ff00, #ffff00, #ff7f00, #ff0000);
                background-size: 200% 100%;
                opacity: 0.9;
                animation: ss-rainbow-slide 2s linear infinite;
            "></div>
            <div style="
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                width: ${borderWidth};
                background: linear-gradient(180deg,
                    #ff0000, #ff00ff, #0000ff, #00ffff,
                    #00ff00, #ffff00, #ff7f00, #ff0000);
                background-size: 100% 200%;
                opacity: 0.9;
                animation: ss-rainbow-slide-vertical 2s linear infinite;
            "></div>
            <div style="
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: ${borderWidth};
                background: linear-gradient(270deg,
                    #ff0000, #ff00ff, #0000ff, #00ffff,
                    #00ff00, #ffff00, #ff7f00, #ff0000);
                background-size: 200% 100%;
                opacity: 0.9;
                animation: ss-rainbow-slide-reverse 2s linear infinite;
            "></div>
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                width: ${borderWidth};
                background: linear-gradient(0deg,
                    #ff0000, #ff00ff, #0000ff, #00ffff,
                    #00ff00, #ffff00, #ff7f00, #ff0000);
                background-size: 100% 200%;
                opacity: 0.9;
                animation: ss-rainbow-slide-vertical-reverse 2s linear infinite;
            "></div>
        `;

        // Add the animation styles if not already present
        if (!document.getElementById('ss-rainbow-styles')) {
            const style = document.createElement('style');
            style.id = 'ss-rainbow-styles';
            style.textContent = `
                @keyframes ss-rainbow-slide {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }

                @keyframes ss-rainbow-slide-reverse {
                    0% { background-position: 200% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes ss-rainbow-slide-vertical {
                    0% { background-position: 50% 0%; }
                    100% { background-position: 50% 200%; }
                }

                @keyframes ss-rainbow-slide-vertical-reverse {
                    0% { background-position: 50% 200%; }
                    100% { background-position: 50% 0%; }
                }

                @keyframes ss-rainbow-fade {
                    0% { opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }

                #ss-rainbow-edge {
                    animation: ss-rainbow-fade 2s ease-in-out;
                }

                /* Add intense glow effect */
                #ss-rainbow-edge > div {
                    box-shadow:
                        0 0 20px rgba(255, 0, 255, 0.8),
                        0 0 40px rgba(0, 255, 255, 0.6),
                        inset 0 0 20px rgba(255, 255, 0, 0.5);
                    filter: brightness(2) saturate(1.5);
                    backdrop-filter: blur(2px);
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(rainbowEdge);

        // Remove after animation completes
        setTimeout(() => {
            rainbowEdge.remove();
        }, 2000);
    }

    // Detect content type
    function detectContentType() {
        const host = window.location.hostname;
        const path = window.location.pathname;
        const content = document.body.innerText;

        // Store detection result
        window.SuperSeymour.detectedType = 'generic';

        // News/blog sites
        if (document.querySelector('article') ||
            document.querySelector('[class*="article"]') ||
            document.querySelector('[class*="post"]') ||
            content.includes('min read')) {
            window.SuperSeymour.detectedType = 'article';
        }

        // Recipe sites
        else if (content.includes('ingredients') && content.includes('instructions') ||
                 document.querySelector('[class*="recipe"]')) {
            window.SuperSeymour.detectedType = 'recipe';
        }

        // Video sites
        else if (host.includes('youtube') || host.includes('vimeo') ||
                 document.querySelector('video')) {
            window.SuperSeymour.detectedType = 'video';
        }

        // Social media
        else if (host.includes('twitter') || host.includes('facebook') ||
                 host.includes('instagram') || host.includes('linkedin')) {
            window.SuperSeymour.detectedType = 'social';
        }

        // Shopping
        else if (host.includes('amazon') || host.includes('ebay') ||
                 document.querySelector('[class*="price"]') ||
                 document.querySelector('[class*="cart"]')) {
            window.SuperSeymour.detectedType = 'shopping';
        }

        console.log('Detected content type:', window.SuperSeymour.detectedType);
    }

    // Apply smart transformation
    function applySmartTransformation() {
        const type = window.SuperSeymour.detectedType;

        // Show notification
        showNotification(`Detected: ${type}. Applying ${getModeName(type)} mode...`);

        switch(type) {
            case 'article':
                applyReaderMode();
                break;
            case 'recipe':
                extractRecipe();
                break;
            case 'video':
                enhanceVideo();
                break;
            case 'social':
                applyFocusMode();
                break;
            case 'shopping':
                enhanceShopping();
                break;
            default:
                showCommandPalette();
        }
    }

    // Get friendly mode name
    function getModeName(type) {
        const modeNames = {
            article: 'Reader',
            recipe: 'Recipe Extract',
            video: 'Video Enhancement',
            social: 'Focus',
            shopping: 'Smart Shopping',
            generic: 'Enhancement'
        };
        return modeNames[type] || 'Enhancement';
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #0066cc, #0099ff);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 999997;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(0, 102, 204, 0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Apply reader mode (simplified)
    function applyReaderMode() {
        console.log('Applying reader mode...');
        // Store original styles
        if (!window.SuperSeymour.originalStyles.reader) {
            window.SuperSeymour.originalStyles.reader = {
                // Store any original values that reader mode will change
                bodyWidth: document.body.style.width || '',
                bodyFont: document.body.style.fontFamily || ''
            };
        }

        // This would extract article content and reformat it
        // For now, just apply some reading-friendly styles
        const articles = document.querySelectorAll('article, [class*="article"], [class*="content"], main');
        if (articles.length > 0) {
            articles[0].style.maxWidth = '700px';
            articles[0].style.margin = '0 auto';
            articles[0].style.padding = '20px';
            articles[0].style.fontFamily = 'Georgia, serif';
            articles[0].style.fontSize = '18px';
            articles[0].style.lineHeight = '1.8';
            articles[0].classList.add('ss-reader-mode');
        }
    }

    // Revert reader mode
    function revertReaderMode() {
        console.log('Reverting reader mode...');
        const articles = document.querySelectorAll('.ss-reader-mode');
        articles.forEach(article => {
            article.style.maxWidth = '';
            article.style.margin = '';
            article.style.padding = '';
            article.style.fontFamily = '';
            article.style.fontSize = '';
            article.style.lineHeight = '';
            article.classList.remove('ss-reader-mode');
        });
    }

    // Extract recipe (simplified)
    function extractRecipe() {
        console.log('Extracting recipe...');
        // This would find and extract just the recipe
        window.SuperSeymour.currentMode = 'recipe';
    }

    // Enhance video (simplified)
    function enhanceVideo() {
        console.log('Enhancing video...');
        // Add speed controls, remove distractions
        window.SuperSeymour.currentMode = 'video';
    }

    // Apply focus mode (simplified)
    function applyFocusMode() {
        console.log('Applying focus mode...');
        // Hide distractions, start timer
        window.SuperSeymour.currentMode = 'focus';
    }

    // Enhance shopping (simplified)
    function enhanceShopping() {
        console.log('Enhancing shopping...');
        // Price tracking, review summary
        window.SuperSeymour.currentMode = 'shopping';
    }

    // Show command palette
    function showCommandPalette() {
        const palette = document.createElement('div');
        palette.id = 'ss-command-palette';
        palette.innerHTML = `
            <div class="ss-palette-inner">
                <input type="text" placeholder="Type a command or search..." autofocus>
                <div class="ss-commands">
                    <div class="ss-command" data-action="reader">📖 Reader Mode</div>
                    <div class="ss-command" data-action="dark">🌙 Dark Mode</div>
                    <div class="ss-command" data-action="focus">🎯 Focus Mode</div>
                    <div class="ss-command" data-action="speed">⚡ Speed Mode</div>
                    <div class="ss-command" data-action="zen">🧘 Zen Mode</div>
                </div>
            </div>
        `;

        palette.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            max-width: 90%;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
            z-index: 999998;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
            transition: all 0.3s ease;
        `;

        const paletteStyle = document.createElement('style');
        paletteStyle.textContent = `
            .ss-palette-inner {
                padding: 20px;
            }

            .ss-palette-inner input {
                width: 100%;
                padding: 12px;
                font-size: 16px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                outline: none;
                transition: border-color 0.3s ease;
            }

            .ss-palette-inner input:focus {
                border-color: #0099ff;
            }

            .ss-commands {
                margin-top: 10px;
            }

            .ss-command {
                padding: 12px;
                cursor: pointer;
                border-radius: 6px;
                transition: background 0.2s ease;
            }

            .ss-command:hover {
                background: #f0f0f0;
            }
        `;
        document.head.appendChild(paletteStyle);
        document.body.appendChild(palette);

        requestAnimationFrame(() => {
            palette.style.opacity = '1';
            palette.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // Focus input
        palette.querySelector('input').focus();

        // Handle command selection
        palette.querySelectorAll('.ss-command').forEach(cmd => {
            cmd.addEventListener('click', () => {
                const action = cmd.dataset.action;
                showNotification(`Activating ${action} mode...`);
                palette.remove();
            });
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                palette.remove();
            }
        });
    }

    // Handle menu item actions with toggle functionality
    function handleMenuAction(action) {
        const mode = action.toLowerCase();

        // Check if mode is already active
        if (window.SuperSeymour.activeModes.has(mode)) {
            // Mode is active, so deactivate it
            deactivateMode(mode);
            window.SuperSeymour.activeModes.delete(mode);
            showNotification(`${getIconForMode(mode)} ${action} mode deactivated`);
        } else {
            // Mode is not active, so activate it
            switch(mode) {
                case 'reader':
                    applyReaderMode();
                    break;
                case 'dark':
                    applyDarkMode();
                    break;
                case 'speed':
                    applySpeedMode();
                    break;
                case 'zen':
                    applyZenMode();
                    break;
                default:
                    console.log('Action:', action);
                    return;
            }
            window.SuperSeymour.activeModes.add(mode);
            showNotification(`${getIconForMode(mode)} ${action} mode activated`);
        }

        // Update visual indicators on menu items
        updateMenuItemStates();
    }

    // Get icon for mode
    function getIconForMode(mode) {
        const icons = {
            'reader': '📖',
            'dark': '🌙',
            'speed': '⚡',
            'zen': '🧘'
        };
        return icons[mode] || '✨';
    }

    // Deactivate a specific mode
    function deactivateMode(mode) {
        switch(mode) {
            case 'reader':
                revertReaderMode();
                break;
            case 'dark':
                revertDarkMode();
                break;
            case 'speed':
                revertSpeedMode();
                break;
            case 'zen':
                revertZenMode();
                break;
        }
    }

    // Update visual state of menu items
    function updateMenuItemStates() {
        const menu = document.querySelector('.ss-radial-menu');
        if (!menu) return;

        menu.querySelectorAll('.ss-menu-item').forEach(item => {
            const label = item.dataset.label.toLowerCase();
            if (window.SuperSeymour.activeModes.has(label)) {
                item.classList.add('active');
                item.style.background = 'linear-gradient(135deg, #0066cc, #0099ff)';
                item.style.color = 'white';
            } else {
                item.classList.remove('active');
                item.style.background = 'rgba(255, 255, 255, 0.95)';
                item.style.color = '';
            }
        });
    }

    // Apply dark mode
    function applyDarkMode() {
        // Store original filter
        if (!window.SuperSeymour.originalStyles.filter) {
            window.SuperSeymour.originalStyles.filter = document.documentElement.style.filter || '';
        }
        document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';

        // Also invert images and videos to revert them back
        const media = document.querySelectorAll('img, video, iframe, embed, object');
        media.forEach(el => {
            el.style.filter = 'invert(1) hue-rotate(180deg)';
            el.classList.add('ss-dark-mode-media');
        });
    }

    // Revert dark mode
    function revertDarkMode() {
        document.documentElement.style.filter = window.SuperSeymour.originalStyles.filter || '';

        // Revert media elements
        const media = document.querySelectorAll('.ss-dark-mode-media');
        media.forEach(el => {
            el.style.filter = '';
            el.classList.remove('ss-dark-mode-media');
        });
    }

    // Apply speed mode
    function applySpeedMode() {
        // Track hidden elements so we can restore them
        window.SuperSeymour.hiddenBySpeed = [];

        // Remove ads, trackers, etc.
        const annoyances = document.querySelectorAll('[class*="ad"], [id*="ad"], [class*="popup"], [class*="modal"], [class*="banner"], [class*="newsletter"], [class*="subscribe"]');
        annoyances.forEach(el => {
            if (el.style.display !== 'none') {
                window.SuperSeymour.hiddenBySpeed.push({
                    element: el,
                    originalDisplay: el.style.display || ''
                });
                el.style.display = 'none';
            }
        });
    }

    // Revert speed mode
    function revertSpeedMode() {
        if (window.SuperSeymour.hiddenBySpeed) {
            window.SuperSeymour.hiddenBySpeed.forEach(item => {
                item.element.style.display = item.originalDisplay;
            });
            window.SuperSeymour.hiddenBySpeed = [];
        }
    }

    // Apply zen mode
    function applyZenMode() {
        // Store original styles
        if (!window.SuperSeymour.originalStyles.zen) {
            window.SuperSeymour.originalStyles.zen = {
                maxWidth: document.body.style.maxWidth || '',
                margin: document.body.style.margin || '',
                padding: document.body.style.padding || '',
                background: document.body.style.background || ''
            };
        }

        // Simplified, minimal view
        document.body.style.maxWidth = '800px';
        document.body.style.margin = '0 auto';
        document.body.style.padding = '40px';
        document.body.style.background = 'white';

        // Also simplify font
        document.body.style.fontFamily = 'Georgia, serif';
        document.body.style.fontSize = '18px';
        document.body.style.lineHeight = '1.6';
    }

    // Revert zen mode
    function revertZenMode() {
        if (window.SuperSeymour.originalStyles.zen) {
            document.body.style.maxWidth = window.SuperSeymour.originalStyles.zen.maxWidth;
            document.body.style.margin = window.SuperSeymour.originalStyles.zen.margin;
            document.body.style.padding = window.SuperSeymour.originalStyles.zen.padding;
            document.body.style.background = window.SuperSeymour.originalStyles.zen.background;

            // Reset font styles
            document.body.style.fontFamily = '';
            document.body.style.fontSize = '';
            document.body.style.lineHeight = '';
        }
    }

    // Toggle last mode
    function toggleLastMode() {
        const orb = document.querySelector('#superseymour-orb');
        const ripple = orb.querySelector('.ss-ripple');
        ripple.classList.add('active');
        setTimeout(() => ripple.classList.remove('active'), 600);

        if (window.SuperSeymour.currentMode) {
            // Toggle off
            showNotification('Deactivating ' + window.SuperSeymour.currentMode + ' mode');
            window.SuperSeymour.lastMode = window.SuperSeymour.currentMode;
            window.SuperSeymour.currentMode = null;
        } else {
            // Toggle on
            showNotification('Reactivating ' + window.SuperSeymour.lastMode + ' mode');
            window.SuperSeymour.currentMode = window.SuperSeymour.lastMode;
        }
    }

    // Show radial menu
    function showRadialMenu(orb) {
        // Remove any existing menu first
        const existingMenu = orb.querySelector('.ss-radial-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'ss-radial-menu';

        // Determine actual orb position based on current styles
        const orbRect = orb.getBoundingClientRect();
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        let orbPosition;
        const isLeft = orbRect.left < screenW / 2;
        const isTop = orbRect.top < screenH / 2;

        if (isTop && isLeft) {
            orbPosition = 'top-left';
        } else if (isTop && !isLeft) {
            orbPosition = 'top-right';
        } else if (!isTop && isLeft) {
            orbPosition = 'bottom-left';
        } else {
            orbPosition = 'bottom-right';
        }

        // Update stored position
        window.SuperSeymour.orbPosition = orbPosition;
        console.log('Menu opening at position:', orbPosition); // Debug log

        // Define items
        const allItems = [
            { icon: '📖', label: 'Reader' },
            { icon: '🌙', label: 'Dark' },
            { icon: '⚡', label: 'Speed' },
            { icon: '🧘', label: 'Zen' }
        ];

        // Calculate positions with nice overlapping arc pattern
        let menuHTML = '';
        const radius = 70; // Fixed radius for all items
        const angleSpread = 25; // Degrees between items for tight overlap

        allItems.forEach((item, index) => {
            let angle, x, y;

            switch(orbPosition) {
                case 'top-left':
                    // Fan out down and to the right
                    angle = 30 + (index * angleSpread); // Start at 30°, increase
                    break;
                case 'top-right':
                    // Fan out down and to the left
                    angle = 150 - (index * angleSpread); // Start at 150°, decrease
                    break;
                case 'bottom-left':
                    // Fan out up and to the right
                    angle = -30 - (index * angleSpread); // Start at -30°, decrease
                    break;
                case 'bottom-right':
                default:
                    // Fan out up and to the left (like in your screenshot)
                    angle = -150 + (index * angleSpread); // Start at -150°, increase
                    break;
            }

            // Convert to radians and calculate position
            const radians = (angle * Math.PI) / 180;
            x = Math.cos(radians) * radius;
            y = Math.sin(radians) * radius;

            menuHTML += `
                <div class="ss-menu-item"
                     style="left: ${x}px; top: ${y}px; z-index: ${100 - index}; animation-delay: ${index * 50}ms;"
                     data-label="${item.label}"
                     data-icon="${item.icon}">
                    ${item.icon}
                </div>
            `;
        });

        menu.innerHTML = menuHTML;
        orb.appendChild(menu);

        // Update visual state of items based on active modes
        updateMenuItemStates();

        // Add click handlers to menu items
        menu.querySelectorAll('.ss-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event from bubbling to orb
                const label = item.dataset.label;

                // Handle the menu item action (includes notification)
                handleMenuAction(label);

                // Don't close the menu here - let user close it by clicking orb
            });
        });

        // Add centered position styles if not already present
        if (!document.getElementById('ss-radial-styles')) {
            const radialStyles = document.createElement('style');
            radialStyles.id = 'ss-radial-styles';
            radialStyles.textContent = `
                .ss-radial-menu {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                }

                .ss-radial-menu.active {
                    pointer-events: all;
                }

                .ss-radial-menu .ss-menu-item {
                    position: absolute;
                    width: 45px;
                    height: 45px;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    opacity: 0;
                    transform: translate(-50%, -50%);
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    pointer-events: all;
                }

                .ss-radial-menu.active .ss-menu-item {
                    animation: ss-fade-in 0.3s ease forwards;
                }

                .ss-radial-menu .ss-menu-item:hover {
                    transform: translate(-50%, -50%) scale(1.2);
                    box-shadow: 0 4px 20px rgba(0, 102, 204, 0.3);
                    background: white;
                    z-index: 200 !important;
                }

                @keyframes ss-fade-in {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
            `;
            document.head.appendChild(radialStyles);
        }

        requestAnimationFrame(() => {
            menu.classList.add('active');
        });

        // Close menu when clicking outside (but not on menu items or orb)
        setTimeout(() => {
            const closeMenu = (e) => {
                // Check if click is outside both orb and menu
                if (!orb.contains(e.target) && !menu.contains(e.target) && menu.parentElement) {
                    menu.classList.remove('active');
                    setTimeout(() => {
                        if (menu.parentElement) {
                            menu.remove();
                        }
                    }, 300);
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 100);
    }

    // Make orb draggable
    function makeOrbDraggable(orb) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        let hasDragged = false;

        const handleMouseMove = (e) => {
            if (!startX || !startY) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // Start dragging after moving 5px
            if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
                isDragging = true;
                hasDragged = true;
                orb.style.transition = 'none';

                // Hide any existing menu when dragging starts
                const existingMenu = orb.querySelector('.ss-radial-menu');
                if (existingMenu) {
                    existingMenu.classList.remove('active');
                    setTimeout(() => existingMenu.remove(), 200);
                }
            }

            if (isDragging) {
                orb.style.left = (initialX + dx) + 'px';
                orb.style.top = (initialY + dy) + 'px';
                orb.style.bottom = 'auto';
                orb.style.right = 'auto';
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                orb.style.transition = '';
                snapToEdge(orb);

                // Show menu after snapping to corner
                setTimeout(() => {
                    if (hasDragged) {
                        showRadialMenu(orb);
                    }
                }, 350); // Wait for snap animation to complete
            }

            // Clean up
            startX = null;
            startY = null;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        orb.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click only
                startX = e.clientX;
                startY = e.clientY;
                initialX = orb.offsetLeft;
                initialY = orb.offsetTop;
                hasDragged = false;

                // Add document listeners for this drag session
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            }
        });
    }

    // Snap orb to nearest corner
    function snapToEdge(orb) {
        const rect = orb.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        // Calculate distance to each corner
        const corners = {
            'top-left': Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2)),
            'top-right': Math.sqrt(Math.pow(screenW - centerX, 2) + Math.pow(centerY, 2)),
            'bottom-left': Math.sqrt(Math.pow(centerX, 2) + Math.pow(screenH - centerY, 2)),
            'bottom-right': Math.sqrt(Math.pow(screenW - centerX, 2) + Math.pow(screenH - centerY, 2))
        };

        // Find closest corner
        const closestCorner = Object.keys(corners).reduce((a, b) =>
            corners[a] < corners[b] ? a : b
        );

        // Store the current position BEFORE animating
        window.SuperSeymour.orbPosition = closestCorner;
        console.log('Orb snapped to:', closestCorner); // Debug log

        // Snap to corner with smooth animation
        orb.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

        const offset = window.innerWidth <= 768 ? '20px' : '30px'; // Mobile vs Desktop

        switch(closestCorner) {
            case 'top-left':
                orb.style.top = offset;
                orb.style.left = offset;
                orb.style.bottom = 'auto';
                orb.style.right = 'auto';
                break;
            case 'top-right':
                orb.style.top = offset;
                orb.style.right = offset;
                orb.style.bottom = 'auto';
                orb.style.left = 'auto';
                break;
            case 'bottom-left':
                orb.style.bottom = offset;
                orb.style.left = offset;
                orb.style.top = 'auto';
                orb.style.right = 'auto';
                break;
            case 'bottom-right':
                orb.style.bottom = offset;
                orb.style.right = offset;
                orb.style.top = 'auto';
                orb.style.left = 'auto';
                break;
        }
    }

    // Toggle SuperSeymour
    window.SuperSeymour.toggle = function() {
        const orb = document.querySelector('#superseymour-orb');

        if (window.SuperSeymour.active) {
            // Deactivate
            if (orb) {
                orb.style.opacity = '0';
                orb.style.transform = 'scale(0)';

                setTimeout(() => {
                    orb.remove();
                }, 300);
            }

            window.SuperSeymour.active = false;
        } else {
            // Reactivate
            initializeSuperSeymour();
        }
    };

    // Start the magic!
    initializeSuperSeymour();

})();
