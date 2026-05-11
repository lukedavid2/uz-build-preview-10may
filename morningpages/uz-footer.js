/**
 * ════════════════════════════════════════════════════════════════════
 * Undercover Zest Suite — Footer  (uz-footer.js)
 * ════════════════════════════════════════════════════════════════════
 *
 * Self-contained, zero-dependency footer for the Undercover Zest
 * creative writing tool suite. Injects a consistent footer with
 * donation button, credit, and contact link at the bottom of any page.
 * No build step, no external CSS, no framework required.
 *
 * ── WHAT IT INJECTS ──────────────────────────────────────────────
 *
 *  1. <footer class="uz-site-footer">  — full footer HTML
 *  2. <style> in <head>                — all classes prefixed uz- to avoid collisions
 *  3. Ko-fi floating widget script     — donation overlay chat widget
 *
 * ── FOOTER VARIANTS ──────────────────────────────────────────────
 *
 *  The footer supports two layout variants, auto-detected by app:
 *
 *  "full"    — Block layout with donation button, credit line,
 *              and contact link. Used by most apps.
 *              (Homepage, Undercover Zest, Morning Pages,
 *               SenseSpark, CollisionLab)
 *
 *  "compact" — Single-line flex layout with credit, contact,
 *              and coffee link separated by middots.
 *              Used by RhymeForge.
 *
 * ── DARK MODE ────────────────────────────────────────────────────
 *
 *  All apps in the suite use dark themes, so the footer defaults
 *  to dark mode styling. Light mode is available via the
 *  body.light-mode class or @media (prefers-color-scheme: light).
 *
 * ── HOW TO ADD TO A PAGE ─────────────────────────────────────────
 *
 *  Place at the bottom of <body>, after your app's root element
 *  and AFTER uz-nav.js (if used):
 *
 *    <body>
 *      <div id="root"></div>
 *      <!-- your app scripts -->
 *      <script src="uz-nav.js"></script>
 *      <script src="uz-footer.js"></script>
 *    </body>
 *
 *  The script auto-detects the active app from the URL pathname.
 *
 * ── CUSTOMISATION ────────────────────────────────────────────────
 *
 *  Override these CSS custom properties on :root or body:
 *
 *    --uz-footer-bg       (default: dark gradient)
 *    --uz-footer-border   (default: #c8a04a)
 *    --uz-footer-text     (default: #999)
 *    --uz-footer-accent   (default: #d4a853)
 *
 * ── Z-INDEX ──────────────────────────────────────────────────────
 *
 *  Ko-fi widget: z-index 10002 (above nav's 9999)
 *
 * ════════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // ── App definitions (mirrors uz-nav.js) ──────────────────────────
  var APPS = [
    { key: 'homepage',  match: ['/homepage', '/homepage/'] },
    { key: 'zest',      match: ['/index.html', '/'] },
    { key: 'rhyme',     match: ['/rhymeforge'] },
    { key: 'collision', match: ['/collisionlab'] },
    { key: 'morning',   match: ['/morningpages'] },
    { key: 'sense',     match: ['/sensespark'] },
  ];

  // ── Detect active page ────────────────────────────────────────────
  var path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  var activeApp = 'zest'; // default
  APPS.forEach(function (a) {
    a.match.forEach(function (m) {
      if (path === m || path.indexOf(m + '/') === 0 || path.indexOf(m + '/index') === 0) {
        activeApp = a.key;
      }
    });
  });

  // ── Determine footer variant ──────────────────────────────────────
  // RhymeForge uses a compact single-line footer; all others use full
  var variant = (activeApp === 'rhyme') ? 'compact' : 'full';

  // ── Build footer HTML ─────────────────────────────────────────────
  var footerHTML;

  if (variant === 'compact') {
    // ── Compact: single-line flex layout (RhymeForge style) ─────────
    footerHTML =
      '<footer class="uz-site-footer uz-footer--compact">' +
        '<div class="uz-footer-inline">' +
          '<span class="uz-footer-credit">Made with \uD83C\uDF4B by Luke</span>' +
          '<span class="uz-footer-sep">&middot;</span>' +
          '<a href="mailto:tidbit-people.1u@icloud.com" class="uz-footer-link">Suggestions?</a>' +
          '<span class="uz-footer-sep">&middot;</span>' +
          '<a href="https://ko-fi.com/undercoverzest" target="_blank" rel="noopener noreferrer" class="uz-footer-link uz-footer-coffee">&#9749; Buy me a coffee</a>' +
        '</div>' +
      '</footer>';
  } else {
    // ── Full: block layout with donation button ─────────────────────
    footerHTML =
      '<footer class="uz-site-footer uz-footer--full">' +
        '<div class="uz-footer-content">' +
          '<div class="uz-support-section">' +
            '<p class="uz-support-desc">Built for songwriters, powered by coffee. If you love this tool, please feel free to donate below!</p>' +
            '<div class="uz-donation-buttons">' +
              '<a href="https://ko-fi.com/undercoverzest" class="uz-donation-btn" target="_blank" rel="noopener noreferrer">' +
                '☕ Buy me a coffee' +
              '</a>' +
            '</div>' +
          '</div>' +
          '<div class="uz-footer-credit">' +
            'Made with \uD83C\uDF4B by Luke' +
          '</div>' +
          '<div class="uz-footer-contact">' +
            'We love hearing from you if you have any suggestions, or love: <a href="mailto:tidbit-people.1u@icloud.com">Contact me</a>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  // ── Inject footer before closing </body> ──────────────────────────
  var container = document.createElement('div');
  container.innerHTML = footerHTML;
  var footerEl = container.firstChild;
  document.body.appendChild(footerEl);

  // ── Inject Ko-fi floating widget (skip on Morning Pages — it overlaps the sidebar) ──
  var isMorningPages = activeApp === 'morning' ||
    window.location.href.toLowerCase().indexOf('morningpages') !== -1 ||
    window.location.href.toLowerCase().indexOf('morning-pages') !== -1 ||
    window.location.href.toLowerCase().indexOf('morning_pages') !== -1;
  if (isMorningPages) {
    // Morning Pages opts out of the floating Ko-fi widget
  } else {
  var kofiScript = document.createElement('script');
  kofiScript.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
  kofiScript.onload = function () {
    if (typeof kofiWidgetOverlay !== 'undefined') {
      kofiWidgetOverlay.draw('undercoverzest', {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Buy me a coffee',
        'floating-chat.donateButton.background-color': '#c8a04a',
        'floating-chat.donateButton.text-color': '#fff'
      });
      // Ensure Ko-fi widget sits above nav and has no white background
      setTimeout(function () {
        var kofiEls = document.querySelectorAll('[class*="floatingchat"], [id*="kofi"]');
        kofiEls.forEach(function (el) {
          el.style.zIndex = '10002';
          el.style.overflow = 'visible';
          el.style.background = 'transparent';
        });
      }, 2000);
    }
  };
  document.body.appendChild(kofiScript);
  } // end Ko-fi skip check

  // ── Inject CSS ────────────────────────────────────────────────────
  var css = [
    '/* ════════ UZ FOOTER (uz-footer.js) ════════ */',
    '',
    '/* ── Full variant (default) ── */',
    '.uz-footer--full {',
    '  background: linear-gradient(135deg, #1a1d24 0%, #22262e 100%);',
    '  border-top: 2px solid #c8a04a;',
    '  padding: 24px 40px;',
    '  margin-top: 40px;',
    '  text-align: center;',
    '  font-family: "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;',
    '}',
    '.uz-footer--full .uz-footer-content {',
    '  max-width: 600px;',
    '  margin: 0 auto;',
    '}',
    '.uz-footer--full .uz-donation-buttons {',
    '  display: flex;',
    '  gap: 12px;',
    '  justify-content: center;',
    '  flex-wrap: wrap;',
    '  margin-bottom: 12px;',
    '}',
    '.uz-footer--full .uz-donation-btn {',
    '  display: inline-block;',
    '  text-decoration: none;',
    '  background: linear-gradient(135deg, #c8a04a 0%, #a07830 100%);',
    '  color: #fff;',
    '  border: 2px solid transparent;',
    '  padding: 10px 22px;',
    '  border-radius: 8px;',
    '  cursor: pointer;',
    '  font-size: 14px;',
    '  font-weight: 700;',
    '  font-family: "Outfit", sans-serif;',
    '  transition: all 0.15s ease;',
    '  box-shadow: 0 4px 12px rgba(200, 160, 74, 0.3);',
    '}',
    '.uz-footer--full .uz-donation-btn:hover {',
    '  transform: translateY(-2px);',
    '  background: linear-gradient(135deg, #dbb455, #b88a3a);',
    '  box-shadow: 0 6px 16px rgba(200, 160, 74, 0.5);',
    '  color: #fff;',
    '  text-decoration: none;',
    '}',
    '.uz-footer--full .uz-donation-btn:visited { color: #111; }',
    '.uz-footer--full .uz-support-desc {',
    '  font-size: 13px;',
    '  color: #999;',
    '  margin-bottom: 12px;',
    '  font-family: "Outfit", sans-serif;',
    '}',
    '.uz-footer--full .uz-footer-credit {',
    '  font-size: 13px;',
    '  color: #777;',
    '  margin-top: 12px;',
    '}',
    '.uz-footer--full .uz-footer-contact {',
    '  font-size: 12px;',
    '  color: #777;',
    '  margin-top: 10px;',
    '  font-family: "Outfit", sans-serif;',
    '}',
    '.uz-footer--full .uz-footer-contact a {',
    '  color: #d4a853;',
    '  text-decoration: none;',
    '  font-weight: 600;',
    '}',
    '.uz-footer--full .uz-footer-contact a:hover {',
    '  text-decoration: underline;',
    '}',
    '',
    '/* ── Compact variant (RhymeForge) ── */',
    '.uz-footer--compact {',
    '  margin: 0;',
    '  padding: 0;',
    '  border: none;',
    '  background: transparent;',
    '  font-family: inherit;',
    '}',
    '.uz-footer--compact .uz-footer-inline {',
    '  max-width: 1100px;',
    '  margin: 3rem auto 1.5rem;',
    '  padding: 1.2rem 2rem 0;',
    '  border-top: 1px solid var(--border, rgba(255,255,255,0.1));',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 0.5rem;',
    '  flex-wrap: wrap;',
    '  font-size: 0.78rem;',
    '  color: var(--text-muted, #888);',
    '}',
    '.uz-footer--compact .uz-footer-credit {',
    '  opacity: 0.7;',
    '}',
    '.uz-footer--compact .uz-footer-sep {',
    '  opacity: 0.3;',
    '}',
    '.uz-footer--compact .uz-footer-link {',
    '  color: var(--text-muted, #888);',
    '  text-decoration: none;',
    '  transition: color 0.2s ease;',
    '}',
    '.uz-footer--compact .uz-footer-link:hover {',
    '  color: var(--accent, #d4a853);',
    '}',
    '.uz-footer--compact .uz-footer-coffee {',
    '  color: var(--accent-dim, #c8a04a);',
    '}',
    '.uz-footer--compact .uz-footer-coffee:hover {',
    '  color: var(--accent, #d4a853);',
    '}',
    '',
    '/* ── Light mode overrides (for uz-footer.html or light apps) ── */',
    'body.light-mode .uz-footer--full {',
    '  background: linear-gradient(135deg, #faf8f4 0%, #f0ece4 100%);',
    '  border-top-color: #c8a04a;',
    '}',
    'body.light-mode .uz-footer--full .uz-support-desc { color: #666; }',
    'body.light-mode .uz-footer--full .uz-footer-credit { color: #888; }',
    'body.light-mode .uz-footer--full .uz-footer-contact { color: #999; }',
    'body.light-mode .uz-footer--full .uz-footer-contact a { color: #c8a04a; }',
    'body.light-mode .uz-footer--full .uz-donation-btn {',
    '  background: linear-gradient(135deg, #c8a04a, #a07830);',
    '  color: #fff;',
    '  border-color: transparent;',
    '}',
    'body.light-mode .uz-footer--full .uz-donation-btn:hover {',
    '  box-shadow: 0 6px 16px rgba(200, 160, 74, 0.5);',
    '}',
    'body.light-mode .uz-footer--full .uz-donation-btn:visited { color: #fff; }',
    '',
    '/* ── Light mode via prefers-color-scheme ── */',
    '@media (prefers-color-scheme: light) {',
    '  .uz-footer--full {',
    '    background: linear-gradient(135deg, #faf8f4 0%, #f0ece4 100%);',
    '  }',
    '  .uz-footer--full .uz-support-desc { color: #666; }',
    '  .uz-footer--full .uz-footer-credit { color: #888; }',
    '  .uz-footer--full .uz-footer-contact { color: #999; }',
    '  .uz-footer--full .uz-footer-contact a { color: #c8a04a; }',
    '  .uz-footer--full .uz-donation-btn { color: #fff; }',
    '  .uz-footer--full .uz-donation-btn:visited { color: #fff; }',
    '}',
    '',
    '/* ── Responsive ── */',
    '@media (max-width: 768px) {',
    '  .uz-footer--full { padding: 20px 12px; }',
    '  .uz-footer--full .uz-donation-buttons { gap: 8px; }',
    '  .uz-footer--full .uz-donation-btn { padding: 8px 18px; font-size: 13px; }',
    '  .uz-footer--compact .uz-footer-inline { padding: 1rem 1rem 0; margin: 2rem auto 1rem; }',
    '}',
    '@media (max-width: 480px) {',
    '  .uz-footer--full { padding: 16px 8px; margin-top: 30px; }',
    '  .uz-footer--full .uz-donation-buttons { gap: 6px; }',
    '  .uz-footer--full .uz-donation-btn { padding: 8px 14px; font-size: 12px; }',
    '}',
    '',
    '/* ── Ko-fi widget z-index & appearance fix ── */',
    '.floatingchat-container-wrap {',
    '  z-index: 10002 !important;',
    '  overflow: visible !important;',
    '}',
    '.floatingchat-container-wrap-mo498 {',
    '  z-index: 10002 !important;',
    '}',
    '.floatingchat-container-wrap iframe,',
    '.floatingchat-container-wrap-mo498 iframe {',
    '  border-radius: 12px !important;',
    '}',
    '#kofi-widget-overlay-mo498 {',
    '  z-index: 10002 !important;',
    '}',
    '/* Hide the white background area below Ko-fi widget */',
    '.floatingchat-container-wrap .floatingchat-container,',
    '.floatingchat-container-mo498,',
    '[id*="kofi"],',
    '[class*="floatingchat"] {',
    '  background: transparent !important;',
    '  box-shadow: none !important;',
    '}',
    '/* Ensure Ko-fi wrapper iframe has no white surround */',
    '[class*="floatingchat"] iframe {',
    '  background: transparent !important;',
    '  border: none !important;',
    '}',
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

})();
