// SuperSeymour Multi-CDN Bookmarklet
// Checks multiple sources for activation-poc.js with automatic fallback
// Version: 2025.10.04.2120 - Native dark mode support

javascript:(function(){
    // Check if already loaded
    if(window.SuperSeymour && window.SuperSeymour.toggle){
        window.SuperSeymour.toggle();
        return;
    }

    // Define CDN sources in priority order
    const sources = [
        // Primary: jsDelivr with specific commit (bypasses cache)
        'https://cdn.jsdelivr.net/gh/Founderstowne/SuperSeymour@ab1fe03/activation-poc.js',

        // Production server
        'https://superseymour.com/activation-poc.js',

        // GitHub Pages (if you set up github.io)
        'https://founderstowne.github.io/SuperSeymour/activation-poc.js',

        // Statically CDN (another GitHub mirror)
        'https://cdn.statically.io/gh/Founderstowne/SuperSeymour/main/activation-poc.js',

        // GitHack CDN (serves raw files from GitHub)
        'https://raw.githack.com/Founderstowne/SuperSeymour/main/activation-poc.js',

        // Backup: Local development server (for testing)
        'http://localhost:8888/activation-poc.js'
    ];

    let currentIndex = 0;

    function loadFromSource() {
        if(currentIndex >= sources.length) {
            alert('SuperSeymour: Unable to load from any CDN source. Please check your internet connection or contact support.');
            return;
        }

        const source = sources[currentIndex];
        const script = document.createElement('script');

        // Add timestamp to bypass cache
        script.src = source + '?v=' + Date.now();

        script.onload = function() {
            console.log('SuperSeymour loaded from:', source);
            // Store successful source for future optimizations
            if(window.localStorage) {
                try {
                    localStorage.setItem('ss_last_working_cdn', source);
                } catch(e) {}
            }
        };

        script.onerror = function() {
            console.warn('SuperSeymour: Failed to load from', source);
            currentIndex++;
            // Try next source
            loadFromSource();
        };

        document.head.appendChild(script);
    }

    // Check for last working CDN first (optimization)
    if(window.localStorage) {
        try {
            const lastWorking = localStorage.getItem('ss_last_working_cdn');
            if(lastWorking && sources.includes(lastWorking)) {
                // Move last working to front of array
                sources.splice(sources.indexOf(lastWorking), 1);
                sources.unshift(lastWorking);
            }
        } catch(e) {}
    }

    // Start loading
    loadFromSource();
})();