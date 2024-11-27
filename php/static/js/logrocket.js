// static/js/logrocket.js

// LogRocket Initialization
(function loadLogRocket() {
    const script = document.createElement('script');
    script.src = 'https://cdn.lrkt-in.com/LogRocket.min.js';
    script.crossOrigin = 'anonymous';

    script.onload = function () {
        if (window.LogRocket) {
            window.LogRocket.init('8mpvuw/top-heroes');
            //console.log('[LogRocket] Initialized successfully.');
        } else {
            console.error('[LogRocket] Initialization failed. LogRocket is not available.');
        }
    };

    script.onerror = function () {
        console.error('[LogRocket] Failed to load the LogRocket script.');
    };

    document.head.appendChild(script);
})();