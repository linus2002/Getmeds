/**
 * GetMEDS Global Component Loader
 * Fetches navbar.html and footer.html and injects them into every page.
 * Works with Python's http.server (no build tool needed).
 */
(function () {
    function loadComponent(placeholderId, componentPath) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return;

        // Resolve path relative to site root so it works on any sub-path
        const base = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

        // Prevent caching during development
        const noCachePath = componentPath + '?v=' + new Date().getTime();

        fetch(noCachePath)
            .then(function (res) {
                if (!res.ok) throw new Error('Could not load ' + componentPath);
                return res.text();
            })
            .then(function (html) {
                placeholder.outerHTML = html;
            })
            .catch(function (err) {
                console.warn('[GetMEDS Components]', err);
            });
    }

    // Run as soon as the DOM is interactive
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        loadComponent('navbar-placeholder', 'components/navbar.html');
        loadComponent('footer-placeholder', 'components/footer.html');

        // Automatically inject auth modal into body if it doesn't have a placeholder
        const authContainer = document.createElement('div');
        authContainer.id = 'auth-modal-container';
        document.body.appendChild(authContainer);

        fetch('components/auth_modals.html?v=' + new Date().getTime())
            .then(res => res.text())
            .then(html => {
                authContainer.innerHTML = html;
                // Re-execute scripts from the fetched HTML
                const scripts = authContainer.querySelectorAll('script');
                scripts.forEach(oldScript => {
                    const newScript = document.createElement('script');
                    newScript.text = oldScript.text;
                    document.head.appendChild(newScript).parentNode.removeChild(newScript);
                });
            })
            .catch(err => console.warn('[GetMEDS Components] Auth Modal failed:', err));
    }
})();
