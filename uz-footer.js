/**
 * Undercover Zest Suite — Footer  (uz-footer.js)
 * See repo for full docs. 2026-05-12 mobile UX pass + hotfix.
 */
(function () {
  'use strict';

  var APPS = [
    { key: 'homepage',  match: ['/homepage', '/homepage/'] },
    { key: 'zest',      match: ['/index.html', '/'] },
    { key: 'rhyme',     match: ['/rhymeforge'] },
    { key: 'collision', match: ['/collisionlab'] },
    { key: 'morning',   match: ['/morningpages'] },
    { key: 'sense',     match: ['/sensespark'] },
  ];

  var path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  var activeApp = 'zest';
  APPS.forEach(function (a) {
    a.match.forEach(function (m) {
      if (path === m || path.indexOf(m + '/') === 0 || path.indexOf(m + '/index') === 0) {
        activeApp = a.key;
      }
    });
  });

  var variant = (activeApp === 'rhyme') ? 'compact' : 'full';

  var footerHTML;
  if (variant === 'compact') {
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
    footerHTML =
      '<footer class="uz-site-footer uz-footer--full">' +
        '<div class="uz-footer-content">' +
          '<div class="uz-support-section">' +
            '<p class="uz-support-desc">Built for songwriters, powered by coffee. If you love this tool, please feel free to donate below!</p>' +
            '<div class="uz-donation-buttons">' +
              '<a href="https://ko-fi.com/undercoverzest" class="uz-donation-btn" target="_blank" rel="noopener noreferrer">☕ Buy me a coffee</a>' +
            '</div>' +
          '</div>' +
          '<div class="uz-footer-credit">Made with 🍋 by Luke</div>' +
          '<div class="uz-footer-contact">We love hearing from you if you have any suggestions, or love: <a href="mailto:tidbit-people.1u@icloud.com">Contact me</a></div>' +
        '</div>' +
      '</footer>';
  }

  var container = document.createElement('div');
  container.innerHTML = footerHTML;
  document.body.appendChild(container.firstChild);

  // ── Ko-fi widget (deferred until welcome modal closes) ──
  var isMorningPages = activeApp === 'morning' ||
    window.location.href.toLowerCase().indexOf('morningpages') !== -1;

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
          setTimeout(function () {
            document.querySelectorAll('[class*="floatingchat"], [id*="kofi"]').forEach(function (el) {
              el.style.zIndex = '10002';
              el.style.overflow = 'visible';
              el.style.background = 'transparent';
            });
          }, 2000);
        }
      };
      document.body.appendChild(kofiScript);
    }

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
      if (!modal) { injectKofi(); return; }
      var settled = false;
      function maybeInject() {
        if (settled) return;
        var cs = window.getComputedStyle(modal);
        if (!document.body.contains(modal) ||
            modal.classList.contains('hidden') ||
            cs.display === 'none' || cs.visibility === 'hidden') {
          settled = true; mo.disconnect(); injectKofi();
        }
      }
      var mo = new MutationObserver(maybeInject);
      mo.observe(modal, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
      mo.observe(document.body, { childList: true, subtree: false });
      var pollId = setInterval(function () { maybeInject(); if (settled) clearInterval(pollId); }, 1000);
      setTimeout(function () { settled = true; mo.disconnect(); clearInterval(pollId); injectKofi(); }, 60000);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', waitForModalDismissThenInject, { once: true });
    } else {
      setTimeout(waitForModalDismissThenInject, 0);
    }
  }

  // ────────────────────────────────────────────────────────────────
  // ── Mobile UX helpers (pass 2 with hotfix 2026-05-12)
  // ────────────────────────────────────────────────────────────────
  function isMobileWidth() { return window.innerWidth <= 640; }

  function setupMobileEnhancements() {
    if (!isMobileWidth()) return;
    var body = document.body;
    if (!body) return;

    // ── 16. Key picker collapsed by default ───────────────────────
    var keyCollapser = document.getElementById('keyCollapser');
    if (keyCollapser) {
      body.classList.add('uz-key-collapsed');
      keyCollapser.addEventListener('click', function () {
        body.classList.toggle('uz-key-collapsed');
      });
    }

    // ── 18. Loop / repeat collapse — HOTFIX-safe version ──────────
    // Observer is now narrowly scoped to #progressionArea (where the
    // line-repeats live), disconnects during the callback, and only
    // writes textContent when it actually changes. This prevents the
    // infinite-mutation loop that froze the page.
    var looperObs = null;
    var looperDebounce = null;
    function rebuildLooperPills() {
      // Disconnect before mutating so our own writes do not retrigger
      if (looperObs) looperObs.disconnect();
      try {
        var groups = document.querySelectorAll('.line-repeats');
        for (var i = 0; i < groups.length; i++) {
          var g = groups[i];
          if (g.dataset.uzMobileCollapsed !== 'done') {
            g.dataset.uzMobileCollapsed = 'done';
            var active = g.querySelector('.repeat-btn.active');
            var label = active ? active.textContent.trim() : '1';
            var pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'uz-mobile-loop-pill';
            pill.setAttribute('aria-label', 'Repeat count');
            pill.textContent = '×' + label + ' ▾';
            pill.addEventListener('click', function (e) {
              e.stopPropagation();
              this.parentElement.classList.toggle('uz-loop-expanded');
            });
            g.insertBefore(pill, g.firstChild);
          }
          // Sync the pill label to the active button — but only if changed
          var activeBtn = g.querySelector('.repeat-btn.active');
          var pillEl = g.querySelector('.uz-mobile-loop-pill');
          if (activeBtn && pillEl) {
            var want = '×' + activeBtn.textContent.trim() + ' ▾';
            if (pillEl.textContent !== want) pillEl.textContent = want;
          }
          // Wire each inner repeat-btn to auto-collapse after click
          var btns = g.querySelectorAll('.repeat-btn');
          for (var j = 0; j < btns.length; j++) {
            var b = btns[j];
            if (b.dataset.uzClickWired !== '1') {
              b.dataset.uzClickWired = '1';
              b.addEventListener('click', function () {
                var parent = this.closest('.line-repeats');
                if (parent) setTimeout(function () { parent.classList.remove('uz-loop-expanded'); }, 150);
              });
            }
          }
        }
      } finally {
        // Reconnect to a narrow target so we only react to progression renders
        var target = document.getElementById('progressionArea');
        if (looperObs && target) {
          looperObs.observe(target, { childList: true, subtree: true });
        }
      }
    }
    function scheduleRebuild() {
      if (looperDebounce) return;
      looperDebounce = setTimeout(function () { looperDebounce = null; rebuildLooperPills(); }, 100);
    }
    setTimeout(rebuildLooperPills, 500);
    looperObs = new MutationObserver(function (mutations) {
      // Ignore mutations we caused ourselves — only react to real
      // app.js progression re-renders (childList changes on line cards).
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length)) {
          // Skip if the only change is adding our own pill
          var only = true;
          for (var k = 0; k < m.addedNodes.length; k++) {
            var n = m.addedNodes[k];
            if (!n.classList || !n.classList.contains('uz-mobile-loop-pill')) { only = false; break; }
          }
          if (!only) { scheduleRebuild(); return; }
        }
      }
    });
    var progArea = document.getElementById('progressionArea');
    if (progArea) looperObs.observe(progArea, { childList: true, subtree: true });

    // ── 20. Chord-shape size toggle pill ───────────────────────────
    var SHAPE_STATES = ['', 'uz-shapes-compact', 'uz-shapes-names'];
    var SHAPE_LABEL  = ['Shapes: Full', 'Shapes: Compact', 'Shapes: Names only'];
    var stored = 0;
    try { stored = parseInt(localStorage.getItem('uz-shapes-state') || '0', 10) || 0; } catch (e) {}
    function applyShapeState(idx) {
      idx = ((idx % SHAPE_STATES.length) + SHAPE_STATES.length) % SHAPE_STATES.length;
      SHAPE_STATES.forEach(function (cls) { if (cls) body.classList.remove(cls); });
      if (SHAPE_STATES[idx]) body.classList.add(SHAPE_STATES[idx]);
      try { localStorage.setItem('uz-shapes-state', String(idx)); } catch (e) {}
      var btn = document.getElementById('uzShapeToggle');
      if (btn) btn.textContent = SHAPE_LABEL[idx];
      return idx;
    }
    applyShapeState(stored);
    function ensureShapeToggle() {
      if (document.getElementById('uzShapeToggle')) return;
      if (!document.getElementById('chordDetailPanel') && !document.querySelector('.progression-line')) return;
      var btn = document.createElement('button');
      btn.id = 'uzShapeToggle';
      btn.type = 'button';
      btn.className = 'uz-shape-toggle-btn';
      btn.textContent = SHAPE_LABEL[stored];
      btn.addEventListener('click', function () { stored = applyShapeState(stored + 1); });
      document.body.appendChild(btn);
    }
    setTimeout(ensureShapeToggle, 800);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMobileEnhancements);
  } else {
    setupMobileEnhancements();
  }
  window.addEventListener('resize', function () {
    if (isMobileWidth() && !document.body.dataset.uzMobileSetup) {
      document.body.dataset.uzMobileSetup = '1';
      setupMobileEnhancements();
    }
  });

  // ── Inject CSS ────────────────────────────────────────────────────
  var css = [
    '.uz-footer--full {',
    '  background: linear-gradient(135deg, #1a1d24 0%, #22262e 100%);',
    '  border-top: 2px solid #c8a04a;',
    '  padding: 24px 40px; margin-top: 40px; text-align: center;',
    '  font-family: "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;',
    '}',
    '.uz-footer--full .uz-footer-content { max-width: 600px; margin: 0 auto; }',
    '.uz-footer--full .uz-donation-buttons { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; }',
    '.uz-footer--full .uz-donation-btn {',
    '  display: inline-block; text-decoration: none;',
    '  background: linear-gradient(135deg, #c8a04a 0%, #a07830 100%);',
    '  color: #fff; border: 2px solid transparent;',
    '  padding: 10px 22px; border-radius: 8px; cursor: pointer;',
    '  font-size: 14px; font-weight: 700; font-family: "Outfit", sans-serif;',
    '  transition: all 0.15s ease; box-shadow: 0 4px 12px rgba(200, 160, 74, 0.3);',
    '}',
    '.uz-footer--full .uz-donation-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(200, 160, 74, 0.5); }',
    '.uz-footer--full .uz-support-desc { font-size: 13px; color: #999; margin-bottom: 12px; }',
    '.uz-footer--full .uz-footer-credit { font-size: 13px; color: #777; margin-top: 12px; }',
    '.uz-footer--full .uz-footer-contact { font-size: 12px; color: #777; margin-top: 10px; }',
    '.uz-footer--full .uz-footer-contact a { color: #d4a853; text-decoration: none; font-weight: 600; }',
    '.uz-footer--compact { margin: 0; padding: 0; border: none; background: transparent; }',
    '.uz-footer--compact .uz-footer-inline {',
    '  max-width: 1100px; margin: 3rem auto 1.5rem; padding: 1.2rem 2rem 0;',
    '  border-top: 1px solid rgba(255,255,255,0.1);',
    '  display: flex; align-items: center; justify-content: center;',
    '  gap: 0.5rem; flex-wrap: wrap; font-size: 0.78rem; color: #888;',
    '}',
    '.uz-footer--compact .uz-footer-link { color: #888; text-decoration: none; }',
    '.uz-footer--compact .uz-footer-coffee { color: #c8a04a; }',
    '@media (max-width: 768px) { .uz-footer--full { padding: 20px 12px; } .uz-footer--full .uz-donation-btn { padding: 8px 18px; font-size: 13px; } }',
    '.floatingchat-container-wrap, .floatingchat-container-wrap-mo498, #kofi-widget-overlay-mo498 { z-index: 10002 !important; overflow: visible !important; }',
    '[class*="floatingchat"] iframe { border-radius: 12px !important; background: transparent !important; border: none !important; }',
    '[class*="floatingchat"], [id*="kofi"] { background: transparent !important; box-shadow: none !important; }',
    '',
    ':root { --uz-vh: 100vh; }',
    '@supports (height: 100dvh) { :root { --uz-vh: 100dvh; } }',
    '@media (max-width: 768px) {',
    '  input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]),',
    '  textarea, select { font-size: max(16px, 1rem) !important; }',
    '}',
    'html { -webkit-tap-highlight-color: rgba(212, 168, 83, 0.25); }',
    '',
    '.welcome-modal-overlay { z-index: 10010 !important; }',
    '.welcome-modal-card {',
    '  max-height: calc(var(--uz-vh) - 32px) !important;',
    '  overflow-y: auto !important; -webkit-overflow-scrolling: touch;',
    '  padding-bottom: calc(28px + env(safe-area-inset-bottom, 0px)) !important;',
    '}',
    'body:has(#welcomeModal:not(.hidden)) [class*="floatingchat"],',
    'body:has(#welcomeModal:not(.hidden)) [id^="kofi-"] { display: none !important; }',
    '',
    '@media (max-width: 640px) {',
    '  .lyrics-panel.open { width: 100vw !important; }',
    '  .lyrics-panel.size-half { width: 50vw !important; }',
    '  .lyrics-panel.size-third, .lyrics-panel.size-quarter { width: 50vw !important; }',
    '  .lyrics-panel { height: calc(var(--uz-vh) - var(--uz-rail-h, 52px)) !important; }',
    '  .lyrics-panel .lp-tabs { position: relative; padding-right: 50px; }',
    '  .lyrics-panel .lp-tabs-controls {',
    '    position: absolute; top: 6px; right: 4px;',
    '    margin-left: 0 !important; padding-right: 0 !important; gap: 2px;',
    '  }',
    '  .lyrics-panel .lp-size-btn { min-width: 28px; min-height: 28px; font-size: 11px; padding: 2px 6px; }',
    '  .lyrics-panel .lp-close-btn {',
    '    min-width: 44px; min-height: 44px; font-size: 22px;',
    '    display: inline-flex; align-items: center; justify-content: center; padding: 0;',
    '  }',
    '  body.lyrics-panel-open .lyrics-panel-tab { display: none !important; }',
    '  .lyrics-panel .lp-body, .lyrics-panel .lp-pane { overflow-y: auto; -webkit-overflow-scrolling: touch; }',
    '  .lp-section-btns { overflow-x: auto; flex-wrap: nowrap; scrollbar-width: none; }',
    '  .lp-section-btns::-webkit-scrollbar { display: none; }',
    '}',
    '',
    '@media (max-width: 640px) {',
    '  body.uz-key-collapsed #keyButtons { display: none !important; }',
    '  body.uz-key-collapsed #keyCollapser { display: inline-flex !important; }',
    '  #keyCollapser { min-height: 44px; padding-inline: 14px; font-size: 15px; }',
    '}',
    '',
    '@media (max-width: 640px) {',
    '  .line-repeats { position: relative; gap: 4px !important; }',
    '  .line-repeats .repeats-label,',
    '  .line-repeats .repeat-btn { display: none !important; }',
    '  .line-repeats.uz-loop-expanded .repeats-label,',
    '  .line-repeats.uz-loop-expanded .repeat-btn { display: inline-flex !important; }',
    '  .uz-mobile-loop-pill {',
    '    min-height: 32px; padding: 4px 10px;',
    '    border: 1px solid rgba(212,168,83,0.5);',
    '    background: rgba(212,168,83,0.08); color: #d4a853;',
    '    border-radius: 6px; font-size: 13px; font-weight: 600;',
    '    cursor: pointer; white-space: nowrap;',
    '  }',
    '  .uz-mobile-loop-pill:active { transform: scale(0.96); }',
    '}',
    '',
    '@media (max-width: 640px) {',
    '  .chord-row.modal, .chord-row {',
    '    gap: 14px 18px !important;',
    '    align-items: flex-start !important;',
    '    justify-content: center !important;',
    '    flex-wrap: wrap !important; padding-inline: 10px;',
    '  }',
    '  .chord-row.modal .chord-wrapper, .chord-row .chord-wrapper {',
    '    min-height: 100px;',
    '    display: flex; flex-direction: column; align-items: center; gap: 6px;',
    '    margin: 0 !important; flex: 0 0 auto;',
    '  }',
    '  .chord-row.modal .chord-box, .chord-row .chord-box { margin-bottom: 4px; flex-shrink: 0; }',
    '}',
    '',
    '@media (max-width: 640px) {',
    '  .uz-shape-toggle-btn {',
    '    position: fixed; right: 8px;',
    '    bottom: calc(8px + env(safe-area-inset-bottom, 0px));',
    '    z-index: 9000;',
    '    background: rgba(26, 26, 40, 0.92);',
    '    border: 1px solid rgba(212,168,83,0.6);',
    '    color: #d4a853; padding: 8px 14px;',
    '    border-radius: 999px; font-size: 12px; font-weight: 700;',
    '    cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.5);',
    '    min-height: 38px;',
    '  }',
    '  .uz-shape-toggle-btn:active { transform: scale(0.96); }',
    '  body.uz-shapes-compact .chord-diagrams {',
    '    transform: scale(0.7); transform-origin: top left;',
    '    margin-bottom: -25%;',
    '  }',
    '  body.uz-shapes-names .chord-diagrams { display: none !important; }',
    '  body.uz-shapes-names .chord-name,',
    '  body.uz-shapes-names .progression-line .chord-card .chord-name {',
    '    font-size: 18px; padding: 8px 10px;',
    '  }',
    '}',
    '',
    '@media (pointer: coarse) {',
    '  .chord-detail-close, .chord-picker-close, .key-finder-close,',
    '  .playback-close, .file-close, .scale-popup .close-btn,',
    '  #lyricsPanelClose, .lp-close-btn, .uz-dock-close {',
    '    min-width: 44px; min-height: 44px;',
    '    display: inline-flex; align-items: center; justify-content: center;',
    '  }',
    '  .chord-highlight-help-btn { min-width: 32px; min-height: 32px; }',
    '  .uz-rail-item, .uz-rail-home { min-width: 44px; padding-inline: 9px; }',
    '  .lp-tab { min-height: 44px; padding-block: 10px; }',
    '}',
    '@media (max-width: 480px) {',
    '  .key-buttons-row { display: grid !important; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; }',
    '  .key-buttons-row > * { min-width: 44px; min-height: 44px; width: 100% !important; height: auto !important; font-size: 14px; }',
    '  .repeat-btn { min-width: 32px !important; min-height: 32px !important; font-size: 12px !important; }',
    '  .tab-toggle-btn { min-height: 32px !important; padding-block: 4px !important; }',
    '}',
    '',
    '@media (max-width: 480px) {',
    '  .quick-actions, .rf-quick-actions, [class*="quick-actions"] {',
    '    flex-wrap: wrap !important; row-gap: 8px;',
    '  }',
    '  .quick-actions > button, .rf-quick-actions > button, [class*="quick-actions"] > button {',
    '    flex: 1 1 calc(50% - 4px); min-height: 44px; white-space: normal; text-align: center;',
    '  }',
    '  #guidePanel, .guide-panel, .info-panel, #infoPanel {',
    '    max-width: 100vw; width: min(720px, 100vw) !important; box-sizing: border-box;',
    '    padding-inline: clamp(16px, 4vw, 32px) !important;',
    '  }',
    '  .cl-tabs, .collisionlab-tabs, [role="tablist"] {',
    '    overflow-x: auto; -webkit-overflow-scrolling: touch;',
    '    flex-wrap: nowrap !important; scrollbar-width: none; padding-inline: 12px;',
    '  }',
    '  .cl-tabs::-webkit-scrollbar, .collisionlab-tabs::-webkit-scrollbar,',
    '  [role="tablist"]::-webkit-scrollbar { display: none; }',
    '  .cl-tabs > *, .collisionlab-tabs > *, [role="tablist"] > * { flex: 0 0 auto; white-space: nowrap; }',
    '}',
    '',
    '.intro-modal-card, .info-modal-card,',
    '[class*="intro-modal" i] > div, [class*="info-modal" i] > div,',
    'div[role="dialog"] > div {',
    '  max-height: calc(var(--uz-vh) - 32px);',
    '  overflow-y: auto; -webkit-overflow-scrolling: touch;',
    '}',
    '.uz-nav-rail, #uzNavRail { padding-top: env(safe-area-inset-top, 0px); }',
    '.uz-site-footer { padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); }',
    '@media (max-width: 768px) { body { overscroll-behavior-y: contain; } }',
    '@media (hover: none) { button:active, .btn:active, a:active { transform: scale(.97); transition: transform 0.06s ease; } }',
    'button:focus-visible, a:focus-visible, [role="button"]:focus-visible {',
    '  outline: 2px solid #d4a853; outline-offset: 2px;',
    '}',
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

})();
