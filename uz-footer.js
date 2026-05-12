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
 *                                       PLUS the suite-wide mobile-fixes pack
 *                                       (added 2026-05-12, see MOBILE FIXES section)
 *  3. Ko-fi floating widget script     — donation overlay chat widget
 *                                       (now deferred until welcome/intro modals dismiss)
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
          '<span class="uz-footer-credit">Made with 🍋 by Luke</span>' +
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
            'Made with 🍋 by Luke' +
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

  // ────────────────────────────────────────────────────────────────
  // ── Ko-fi widget loader (deferred until any intro/welcome modal closes)
  //    (changed 2026-05-12 — fixes the bug where the floating Ko-fi
  //     button covered the welcome-modal "Got it!" CTA on iPhone.)
  // ────────────────────────────────────────────────────────────────
  var isMorningPages = activeApp === 'morning' ||
    window.location.href.toLowerCase().indexOf('morningpages') !== -1 ||
    window.location.href.toLowerCase().indexOf('morning-pages') !== -1 ||
    window.location.href.toLowerCase().indexOf('morning_pages') !== -1;

  if (!isMorningPages) {
    var kofiInjected = false;
    function injectKofi() {
      if (kofiInjected) return;
      kofiInjected = true;
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
          // Ensure Ko-fi widget sits above nav and has no white background.
          // Note: still below the welcome-modal-overlay (10010) — see mobile-fixes CSS.
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
    }

    // Find any visible "welcome / intro" modal. We treat the following
    // as gates: UZ root #welcomeModal, plus any element whose id/class
    // contains "welcome", "intro", or whose role is "dialog" AND is
    // currently visible.
    function getActiveIntroModal() {
      var candidates = document.querySelectorAll(
        '#welcomeModal:not(.hidden),' +
        '[id*="welcome" i][class*="modal" i]:not(.hidden),' +
        '[id*="intro" i][class*="modal" i]:not(.hidden),' +
        '[class*="welcome-modal" i]:not(.hidden),' +
        '[class*="intro-modal" i]:not(.hidden)'
      );
      for (var i = 0; i < candidates.length; i++) {
        var el = candidates[i];
        var cs = window.getComputedStyle(el);
        if (cs.display !== 'none' && cs.visibility !== 'hidden' &&
            el.offsetWidth > 100 && el.offsetHeight > 100) {
          return el;
        }
      }
      return null;
    }

    function waitForModalDismissThenInject() {
      var modal = getActiveIntroModal();
      if (!modal) {
        injectKofi();
        return;
      }
      // Watch for the modal becoming hidden, OR for it being removed,
      // OR for "Got it"/close button to be clicked.
      var settled = false;
      function maybeInject() {
        if (settled) return;
        var cs = window.getComputedStyle(modal);
        if (!document.body.contains(modal) ||
            modal.classList.contains('hidden') ||
            cs.display === 'none' ||
            cs.visibility === 'hidden') {
          settled = true;
          mo.disconnect();
          injectKofi();
        }
      }
      var mo = new MutationObserver(maybeInject);
      mo.observe(modal, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
      mo.observe(document.body, { childList: true, subtree: false });
      // Safety net: also poll once a second
      var pollId = setInterval(function () {
        maybeInject();
        if (settled) clearInterval(pollId);
      }, 1000);
      // Absolute fallback — if the user just leaves the modal up for
      // 60 seconds, go ahead and inject anyway so the donation widget
      // isn't lost forever.
      setTimeout(function () {
        settled = true;
        mo.disconnect();
        clearInterval(pollId);
        injectKofi();
      }, 60000);
    }

    // Kick off after a microtask so any inline-script (like UZ root's
    // welcome modal init at the bottom of index.html) has run first.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', waitForModalDismissThenInject, { once: true });
    } else {
      setTimeout(waitForModalDismissThenInject, 0);
    }
  } // end !isMorningPages

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
    '',
    '/* ════════════════════════════════════════════════════════════',
    '   MOBILE FIXES (added 2026-05-12)',
    '   Suite-wide mobile/iOS-Safari fixes — see',
    '   mobile-optimization-recommendations.md for full audit.',
    '   ════════════════════════════════════════════════════════════ */',
    '',
    '/* — Dynamic-viewport helper variable for iOS Safari.',
    '     100vh on iOS overshoots when the URL bar is visible.',
    '     We expose --uz-vh so any rule can opt in. */',
    ':root { --uz-vh: 100vh; }',
    '@supports (height: 100dvh) { :root { --uz-vh: 100dvh; } }',
    '',
    '/* — iOS auto-zoom on focus: forced to 16px on any text-entry',
    '     element, EVERY page in the suite. The audit found 12+',
    '     offenders (13-15px). Don\'t apply to checkbox/radio/range.',
    '     Uses !important inside a mobile-only media query so it',
    '     beats class-specific rules (e.g. .lp-freewrite-area 13px)',
    '     while preserving desktop typography. */',
    '@media (max-width: 768px) {',
    '  input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]),',
    '  textarea,',
    '  select {',
    '    font-size: max(16px, 1rem) !important;',
    '  }',
    '}',
    '',
    '/* — Tap-highlight: use brand-gold tint instead of default gray box. */',
    'html { -webkit-tap-highlight-color: rgba(212, 168, 83, 0.25); }',
    '',
    '/* ─ Welcome / intro modals — make scrollable on phones ─ */',
    '/* UZ root inline-styled welcome modal (specificity needs to beat',
    '   the inline <style> rules in index.html). We also raise the',
    '   overlay z-index above the Ko-fi widget (10002) so the modal',
    '   always wins the stacking war while it is open. */',
    '.welcome-modal-overlay { z-index: 10010 !important; }',
    '.welcome-modal-card {',
    '  max-height: calc(var(--uz-vh) - 32px) !important;',
    '  overflow-y: auto !important;',
    '  -webkit-overflow-scrolling: touch;',
    '  padding-bottom: calc(28px + env(safe-area-inset-bottom, 0px)) !important;',
    '}',
    '/* Hide the Ko-fi widget while the welcome modal is open as a',
    '   second line of defence (Safari 15.4+; older Safari falls back',
    '   to the z-index rule above). */',
    'body:has(#welcomeModal:not(.hidden)) [class*="floatingchat"],',
    'body:has(#welcomeModal:not(.hidden)) [id^="kofi-"] {',
    '  display: none !important;',
    '}',
    '',
    '/* ─ Lyrics panel: go full-screen on mobile ─ */',
    '/* At <=640px the size-half/third/quarter widths (50/33/25 vw)',
    '   leave too little room — the close button and size pills',
    '   overflow past the panel right edge, and the UZ chord workspace',
    '   shrinks below usable width. Force full-width. */',
    '@media (max-width: 640px) {',
    '  .lyrics-panel.open,',
    '  .lyrics-panel.size-half,',
    '  .lyrics-panel.size-third,',
    '  .lyrics-panel.size-quarter {',
    '    width: 100vw !important;',
    '  }',
    '  .lyrics-panel { height: calc(var(--uz-vh) - var(--uz-rail-h, 52px)) !important; }',
    '  /* Hide size pills on phones — they have no meaning at 100vw */',
    '  .lyrics-panel .lp-size-btn { display: none !important; }',
    '  /* Bump close × to a proper 44x44 tap target */',
    '  .lyrics-panel .lp-close-btn {',
    '    min-width: 44px;',
    '    min-height: 44px;',
    '    font-size: 22px;',
    '    display: inline-flex;',
    '    align-items: center;',
    '    justify-content: center;',
    '    padding: 0;',
    '  }',
    '  /* Hide the vertical "Lyrics" handle once the panel is full-width */',
    '  body.lyrics-panel-open .lyrics-panel-tab { display: none !important; }',
    '  /* And make sure the panel body scrolls its own content */',
    '  .lyrics-panel .lp-body,',
    '  .lyrics-panel .lp-pane {',
    '    overflow-y: auto;',
    '    -webkit-overflow-scrolling: touch;',
    '  }',
    '  /* Section buttons row inside the lyrics panel: scroll horizontally */',
    '  .lp-section-btns {',
    '    overflow-x: auto;',
    '    -webkit-overflow-scrolling: touch;',
    '    flex-wrap: nowrap;',
    '    scrollbar-width: none;',
    '  }',
    '  .lp-section-btns::-webkit-scrollbar { display: none; }',
    '}',
    '',
    '/* ─ Chord-line repeat buttons: scroll strip on phones ─ */',
    '/* The Line row (☰ Line 1 × 1 2 3 4 ∞ Tab) does not fit when the',
    '   workspace is constrained. Make the controls a horizontal scroll',
    '   strip below 480px or whenever lyrics panel is open. */',
    '@media (max-width: 480px) {',
    '  .line-card .line-controls,',
    '  .progression-line .line-controls,',
    '  .line-row .repeat-controls,',
    '  .repeat-controls {',
    '    overflow-x: auto;',
    '    -webkit-overflow-scrolling: touch;',
    '    flex-wrap: nowrap !important;',
    '    scrollbar-width: none;',
    '  }',
    '  .line-card .line-controls::-webkit-scrollbar,',
    '  .progression-line .line-controls::-webkit-scrollbar,',
    '  .repeat-controls::-webkit-scrollbar { display: none; }',
    '  /* Bump repeat-btn tap target on touch devices */',
    '  .repeat-btn {',
    '    min-width: 32px !important;',
    '    min-height: 32px !important;',
    '    font-size: 12px !important;',
    '  }',
    '  .tab-toggle-btn {',
    '    min-height: 32px !important;',
    '    padding-block: 4px !important;',
    '  }',
    '}',
    '',
    '/* ─ Touch-target sweep ─ */',
    '@media (pointer: coarse) {',
    '  /* Generic floor for buttons that aren\'t in a dense grid (chord-grid,',
    '     fretboard, etc. opt out by being more specific elsewhere). */',
    '  .chord-detail-close,',
    '  .chord-picker-close,',
    '  .key-finder-close,',
    '  .playback-close,',
    '  .file-close,',
    '  .scale-popup .close-btn,',
    '  #lyricsPanelClose,',
    '  .lp-close-btn,',
    '  .uz-dock-close {',
    '    min-width: 44px;',
    '    min-height: 44px;',
    '    display: inline-flex;',
    '    align-items: center;',
    '    justify-content: center;',
    '  }',
    '  .chord-highlight-help-btn {',
    '    min-width: 32px;',
    '    min-height: 32px;',
    '  }',
    '  /* Top nav rail: each item gets ≥44px of hit area */',
    '  .uz-rail-item, .uz-rail-home { min-width: 44px; padding-inline: 9px; }',
    '  /* LYRICS / RHYMES tabs inside the lyrics panel */',
    '  .lp-tab { min-height: 44px; padding-block: 10px; }',
    '}',
    '',
    '/* ─ Key-picker chips: re-flow to 6-up grid on phones ─ */',
    '@media (max-width: 480px) {',
    '  .key-buttons-row {',
    '    display: grid !important;',
    '    grid-template-columns: repeat(6, minmax(0, 1fr));',
    '    gap: 8px;',
    '  }',
    '  .key-buttons-row > * {',
    '    min-width: 44px;',
    '    min-height: 44px;',
    '    width: 100% !important;',
    '    height: auto !important;',
    '    font-size: 14px;',
    '  }',
    '}',
    '',
    '/* ─ RhymeForge standalone: quick-action button row ─ */',
    '/* "Random Word", "Songwriter\'s Guide", "Info" clip text at 393vw.',
    '   Allow wrapping and bump min height. */',
    '@media (max-width: 480px) {',
    '  .quick-actions,',
    '  .rf-quick-actions,',
    '  [class*="quick-actions"] {',
    '    flex-wrap: wrap !important;',
    '    row-gap: 8px;',
    '  }',
    '  .quick-actions > button,',
    '  .rf-quick-actions > button,',
    '  [class*="quick-actions"] > button {',
    '    flex: 1 1 calc(50% - 4px);',
    '    min-height: 44px;',
    '    white-space: normal;',
    '    text-align: center;',
    '  }',
    '  /* Songwriter\'s Guide panel — keep within viewport */',
    '  #guidePanel,',
    '  .guide-panel,',
    '  .info-panel,',
    '  #infoPanel {',
    '    max-width: 100vw;',
    '    width: min(720px, 100vw) !important;',
    '    box-sizing: border-box;',
    '    padding-inline: clamp(16px, 4vw, 32px) !important;',
    '  }',
    '}',
    '',
    '/* ─ CollisionLab tab strip — horizontal scroll, no clipping ─ */',
    '/* The Today / Open Lab / Field Guide / Lab Notebook strip clips the',
    '   last tab. Reuse the scroll-strip pattern. We target both possible',
    '   tab containers since CollisionLab uses tailwind classes. */',
    '@media (max-width: 480px) {',
    '  .cl-tabs, .collisionlab-tabs, [role="tablist"] {',
    '    overflow-x: auto;',
    '    -webkit-overflow-scrolling: touch;',
    '    flex-wrap: nowrap !important;',
    '    scrollbar-width: none;',
    '    padding-inline: 12px;',
    '  }',
    '  .cl-tabs::-webkit-scrollbar,',
    '  .collisionlab-tabs::-webkit-scrollbar,',
    '  [role="tablist"]::-webkit-scrollbar { display: none; }',
    '  .cl-tabs > *,',
    '  .collisionlab-tabs > *,',
    '  [role="tablist"] > * { flex: 0 0 auto; white-space: nowrap; }',
    '}',
    '',
    '/* ─ Generic intro modals (CollisionLab, SenseSpark) ─ */',
    '/* Best-effort selectors — keep the cards scrollable so the "Got it"',
    '   button is reachable. Selectors are deliberately broad. */',
    '.intro-modal-card,',
    '.info-modal-card,',
    '[class*="intro-modal" i] > div,',
    '[class*="info-modal" i] > div,',
    'div[role="dialog"] > div {',
    '  max-height: calc(var(--uz-vh) - 32px);',
    '  overflow-y: auto;',
    '  -webkit-overflow-scrolling: touch;',
    '}',
    '',
    '/* ─ Safe-area-inset support (notch, home indicator) ─ */',
    '.uz-nav-rail,',
    'nav.uz-nav-rail,',
    '#uzNavRail {',
    '  padding-top: env(safe-area-inset-top, 0px);',
    '}',
    '.uz-site-footer {',
    '  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));',
    '}',
    '',
    '/* ─ Reduce rubber-band scroll under fixed overlays ─ */',
    '@media (max-width: 768px) {',
    '  body { overscroll-behavior-y: contain; }',
    '}',
    '',
    '/* ─ :active feedback for touch devices ─ */',
    '@media (hover: none) {',
    '  button:active,',
    '  .btn:active,',
    '  a:active { transform: scale(.97); transition: transform 0.06s ease; }',
    '}',
    '',
    '/* ─ :focus-visible — keyboard accessibility ─ */',
    'button:focus-visible,',
    'a:focus-visible,',
    '[role="button"]:focus-visible {',
    '  outline: 2px solid #d4a853;',
    '  outline-offset: 2px;',
    '}',
    '',
    '/* ────── END MOBILE FIXES ────── */',
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

})();
