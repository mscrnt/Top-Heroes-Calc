// static/js/matomo.js

/**
 * Stand-alone Matomo (formerly Piwik) loader, WITH expanded features.
 * Relies on window.MATOMO_CONFIG = { page: "slug", title: "Page Title" }.
 * Hard-coded MATOMO_URL and SITE_ID, just like your original snippet.
 */

var _paq = window._paq = window._paq || [];

// ─── 1) Add the basic Matomo calls (URL, Site ID, link tracking) ────────────
_paq.push(['setTrackerUrl', '//metrics.mscrnt.com/matomo.php']);
_paq.push(['setSiteId',    '1']);
_paq.push(['enableLinkTracking']);

// ─── 2) If MATOMO_CONFIG exists, push custom URL + document title ───────────
if (window.MATOMO_CONFIG && window.MATOMO_CONFIG.page && window.MATOMO_CONFIG.title) {
  // Report pageAs “?page=<slug>”
  _paq.push(['setCustomUrl', '?page=' + encodeURIComponent(window.MATOMO_CONFIG.page)]);
  // Use the human-readable title
  _paq.push(['setDocumentTitle', window.MATOMO_CONFIG.title]);
}

// ─── 3) Now finally: track the page view ────────────────────────────────────
_paq.push(['trackPageView']);

// ─── 4) Load matomo.js asynchronously ───────────────────────────────────────
(function() {
  var u="//metrics.mscrnt.com/";
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();

// ─── 5) Expose helper methods for theme/menu events ─────────────────────────
window.MatomoHelper = {
  /**
   * Call this to record “Theme Toggle” events in Matomo.
   *   nextMode should be either "dark" or "light".
   * In Matomo, this appears as:
   *   Category = "Theme", Action = "Toggle", Name = nextMode
   */
  recordThemeToggle: function(nextMode) {
    if (!nextMode) return;
    _paq.push(['trackEvent', 'Theme', 'Toggle', nextMode]);
  },

  /**
   * Call this to record “Menu Open/Close” events in Matomo.
   *   action should be either "Open" or "Close".
   * In Matomo, this appears as:
   *   Category = "Menu", Action = action, Name = "hamburger"
   */
  recordMenu: function(action) {
    if (!action) return;
    _paq.push(['trackEvent', 'Menu', action, 'hamburger']);
  }
};
