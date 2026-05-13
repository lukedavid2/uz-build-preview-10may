/**
 * uz-deferred-patches-v31-supplement.js  (v3.4 mobile updates)
 *
 * Loaded by the bootstrap AFTER the v3 IIFE. Re-implements the four
 * v3 behaviours that v3 got wrong on mobile, plus v3.2/v3.3/v3.4
 * user-feedback iterations:
 *   - shape-type input keyboard: QWERTY (with autocorrect off)
 *   - chord-tones: tight zigzag, no-overflow, smaller chips
 *   - header: NO overrides (debug HTML now matches production)
 *   - iOS scroll-jump dampening on chord-shape input focus
 */
(function () {
  'use strict';

  // ─── Fix 1+2: body-childList observer catches every overlay remount ───
  function injectShapeExtrasV31(overlay) {
    var nav = overlay.querySelector('.shape-fret-nav');
    if (nav && !nav.parentElement.querySelector('.uz-shape-shift-row')) {
      var shiftRow = document.createElement('div');
      shiftRow.className = 'uz-shape-shift-row';
      shiftRow.innerHTML =
        '<span class="uz-shape-shift-label">Shift shape:</span>' +
        '<button type="button" class="uz-shape-shift-btn" data-uz-shift="-1" title="Shift down 1 fret">↓ 1 fret</button>' +
        '<button type="button" class="uz-shape-shift-btn" data-uz-shift="+1" title="Shift up 1 fret">↑ 1 fret</button>';
      nav.parentElement.insertBefore(shiftRow, nav.nextSibling);
      shiftRow.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-uz-shift]');
        if (!btn) return;
        var dir = btn.getAttribute('data-uz-shift') === '+1' ? +1 : -1;
        shiftShapeV31(overlay, dir);
      });
    }
    var body = overlay.querySelector('.shape-editor-body');
    var fretboard = overlay.querySelector('.shape-fretboard');
    if (body && fretboard && !body.querySelector('.uz-shape-type-row')) {
      var typeRow = document.createElement('div');
      typeRow.className = 'uz-shape-type-row';
      typeRow.innerHTML =
        '<label for="uzShapeTypeInput">Type:</label>' +
        '<input id="uzShapeTypeInput" class="uz-shape-type-input" type="text" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" pattern="[0-9xX\\- ]*" placeholder="x32010 or x 3 2 0 1 0">' +
        '<button type="button" class="uz-shape-type-go">Set</button>' +
        '<span class="uz-hint">low E → high E</span>';
      body.insertBefore(typeRow, fretboard);
      var input = typeRow.querySelector('.uz-shape-type-input');
      var goBtn = typeRow.querySelector('.uz-shape-type-go');
      function apply() {
        var raw = (input.value || '').trim();
        var tokens;
        if (/\s/.test(raw)) tokens = raw.split(/\s+/);
        else tokens = raw.split('');
        applyFretStringV31(overlay, tokens);
      }
      goBtn.addEventListener('click', apply);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); apply(); }
      });
      input.value = readCurrentFretStringV31(overlay);
    }
  }

  function readCurrentFretsFromDOMV31(overlay) {
    var frets = [null, null, null, null, null, null];
    overlay.querySelectorAll('.shape-fret-cell.active').forEach(function (cell) {
      var s = parseInt(cell.dataset.string, 10);
      var f = parseInt(cell.dataset.fret, 10);
      if (isNaN(s) || isNaN(f)) return;
      if (s >= 0 && s < 6) frets[s] = f;
    });
    overlay.querySelectorAll('.shape-string-state').forEach(function (st, idx) {
      var t = (st.textContent || '').trim();
      var s = parseInt(st.parentElement && st.parentElement.dataset && st.parentElement.dataset.string, 10);
      if (isNaN(s)) s = idx;
      if (t === 'X') frets[s] = null;
      else if (t === 'O') frets[s] = 0;
    });
    return frets;
  }
  function readCurrentFretStringV31(overlay) {
    return readCurrentFretsFromDOMV31(overlay).map(function (v) { return v === null ? 'x' : String(v); }).join(' ');
  }
  function flashTypeErrorV31(overlay, msg) {
    var input = overlay.querySelector('.uz-shape-type-input');
    if (!input) return;
    var orig = input.placeholder;
    input.placeholder = msg;
    input.style.borderColor = '#ff6666';
    setTimeout(function () { input.placeholder = orig; input.style.borderColor = ''; }, 2500);
  }
  function applyFretStringV31(overlay, tokens) {
    if (tokens.length !== 6) { flashTypeErrorV31(overlay, 'Need 6 values (e.g. x32010 or x 3 2 0 1 0)'); return; }
    var target = tokens.map(function (t) {
      t = String(t).trim().toLowerCase();
      if (t === 'x' || t === '-') return null;
      var n = parseInt(t, 10);
      if (isNaN(n) || n < 0 || n > 24) return undefined;
      return n;
    });
    if (target.some(function (v) { return v === undefined; })) { flashTypeErrorV31(overlay, 'Use frets 0-24 or x for muted'); return; }
    var clearBtn = overlay.querySelector('[data-action="clearChordShape"]');
    if (clearBtn) clearBtn.click();
    setTimeout(function () { placeFretsV31(target); }, 50);
  }
  function placeFretsV31(target) {
    var overlay = document.getElementById('chordShapeOverlay');
    if (!overlay) return;
    var stringHeaders = overlay.querySelectorAll('.shape-string-header');
    for (var s = 0; s < 6; s++) {
      var t = target[s];
      var header = stringHeaders[s];
      if (t === null) cycleStringHeaderV31(header, 'X');
      else if (t === 0) cycleStringHeaderV31(header, 'O');
      else clickFretAtAbsoluteV31(s, t);
    }
  }
  function cycleStringHeaderV31(header, want) {
    if (!header) return;
    var stateEl = header.querySelector('.shape-string-state');
    function read() { return (stateEl && stateEl.textContent || '').trim(); }
    for (var i = 0; i < 3 && read() !== want; i++) header.click();
  }
  function clickFretAtAbsoluteV31(stringIdx, absFret) {
    var overlay = document.getElementById('chordShapeOverlay');
    if (!overlay) return;
    var rows = overlay.querySelectorAll('.shape-fret-row');
    var foundRow = null;
    rows.forEach(function (r) {
      var num = r.querySelector('.shape-fret-num');
      var n = num ? parseInt((num.textContent || '').trim(), 10) : NaN;
      if (n === absFret) foundRow = r;
    });
    if (!foundRow) {
      var navUp = overlay.querySelector('[data-action="shapeNavUp"]');
      var navDown = overlay.querySelector('[data-action="shapeNavDown"]');
      var navText = (overlay.querySelector('.shape-fret-nav span') || {}).textContent || '';
      var m = navText.match(/Frets\s+(\d+)/);
      var base = m ? parseInt(m[1], 10) : 0;
      var delta = absFret - (base + 2);
      var navBtn = delta > 0 ? navUp : navDown;
      for (var i = 0; i < Math.abs(delta) && i < 24; i++) if (navBtn) navBtn.click();
      setTimeout(function () { clickFretAtAbsoluteV31(stringIdx, absFret); }, 50);
      return;
    }
    var cells = foundRow.querySelectorAll('.shape-fret-cell');
    var cell = cells[stringIdx];
    if (cell && !cell.classList.contains('active')) cell.click();
  }
  function shiftShapeV31(overlay, dir) {
    var current = readCurrentFretsFromDOMV31(overlay);
    var next = current.map(function (v) {
      if (v === null || v === 0) return v;
      return v + dir;
    });
    if (next.some(function (v) { return v !== null && v < 0; })) { flashTypeErrorV31(overlay, 'Cannot shift below fret 0'); return; }
    if (next.some(function (v) { return v !== null && v > 24; })) { flashTypeErrorV31(overlay, 'Cannot shift above fret 24'); return; }
    var clearBtn = overlay.querySelector('[data-action="clearChordShape"]');
    if (clearBtn) clearBtn.click();
    setTimeout(function () { placeFretsV31(next); }, 50);
  }

  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var added = muts[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var n = added[j];
        if (n && n.nodeType === 1 && n.id === 'chordShapeOverlay') {
          injectShapeExtrasV31(n);
        }
      }
    }
  }).observe(document.body, { childList: true });
  var existingOverlay = document.getElementById('chordShapeOverlay');
  if (existingOverlay) injectShapeExtrasV31(existingOverlay);

  // ─── Fix 3: iOS keyboard on melody-tab cell input (keeps numeric) ──
  var progressionArea = document.getElementById('progressionArea');
  if (progressionArea) {
    function patchTabCellInput(input) {
      if (!input || input.dataset.uzKbV31) return;
      input.dataset.uzKbV31 = '1';
      try { input.setAttribute('type', 'tel'); } catch (e) {}
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('pattern', '[0-9]*');
      if (document.activeElement === input) {
        try { input.blur(); } catch (e) {}
        try { input.focus({ preventScroll: true }); } catch (e) { try { input.focus(); } catch (e2) {} }
      } else {
        try { input.focus({ preventScroll: true }); } catch (e) { try { input.focus(); } catch (e2) {} }
      }
    }
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (!n || n.nodeType !== 1) continue;
          if (n.matches && n.matches('.tab-cell-input')) {
            patchTabCellInput(n);
          } else if (n.querySelector) {
            var inner = n.querySelector('.tab-cell-input');
            if (inner) patchTabCellInput(inner);
          }
        }
      }
    }).observe(progressionArea, { childList: true, subtree: true });
  }

  // ─── Fix 4: zoom slider min ── multi-layered ───
  function patchZoomSlider(slider) {
    if (!slider) return;
    if (slider.getAttribute('min') !== '0.2') slider.setAttribute('min', '0.2');
    var step = slider.getAttribute('step');
    if (!step || parseFloat(step) > 0.05) slider.setAttribute('step', '0.05');
    slider.dataset.uzMinPatchedV31 = '1';
  }
  function scanForZoomSliders(root) {
    (root || document).querySelectorAll('.tab-zoom-slider').forEach(patchZoomSlider);
  }
  scanForZoomSliders();
  if (progressionArea) {
    new MutationObserver(function () { scanForZoomSliders(); }).observe(progressionArea, { childList: true, subtree: true });
  }
  new MutationObserver(function () { scanForZoomSliders(); }).observe(document.body, { childList: true });
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('tab-zoom-slider')) {
      patchZoomSlider(t);
    }
  }, true);

  // ─── v3.4 CSS ──────────────────────────────────────────────────
  var style = document.createElement('style');
  style.id = 'uzDeferredPatchesV31Style';
  style.textContent = [
    '@media (max-width: 480px) {',
    // ── v3.4 chord-tones: tuned smaller. v3.3 was too big (32px
    //   chips + ±16px zigzag + width:max-content meant adjacent
    //   chord-tones overlapped horizontally into the next chord
    //   and adjacent progression-rows collided vertically).
    //   v3.4 fixes: smaller chips (22px min-width), no width-
    //   overflow (width:auto + max-width:100%), smaller zigzag
    //   (±8px), tighter padding, plus overflow:hidden so chips
    //   that would overflow the chord-wrapper bounds get clipped
    //   instead of crossing into the neighbour.
    '  .chord-row .chord-wrapper,',
    '  .chord-row.modal .chord-wrapper {',
    '    overflow: visible !important;',
    '  }',
    '  .chord-row .chord-wrapper .chord-tones,',
    '  .chord-row.modal .chord-wrapper .chord-tones,',
    '  .chord-tones {',
    '    flex-wrap: nowrap !important;',
    '    overflow: hidden !important;',
    '    gap: 3px !important;',
    '    padding: 2px 3px !important;',
    '    position: relative;',
    '    z-index: 1;',
    '    width: auto !important;',
    '    max-width: 100% !important;',
    '    border-radius: 6px;',
    '    background: rgba(255,255,255,0.025);',
    '    justify-content: center;',
    '  }',
    '  .chord-row .chord-wrapper .chord-tones .tone-stack,',
    '  .chord-row.modal .chord-wrapper .chord-tones .tone-stack,',
    '  .chord-tones .tone-stack {',
    '    min-width: 22px !important;',
    '    flex: 0 1 auto !important;',
    '    border-radius: 4px;',
    '    overflow: hidden;',
    '    box-shadow: 0 1px 1px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.03) inset;',
    '  }',
    '  .chord-tones .tone-top, .chord-tones .tone-bot {',
    '    min-width: 20px;',
    '    text-align: center;',
    '    padding: 1px 0;',
    '    font-size: 10px;',
    '    line-height: 1.15;',
    '  }',
    '  .chord-tones .tone-top {',
    '    font-weight: 700;',
    '  }',
    // Smaller zigzag — ±8px (was ±16). Adjacent progression-row
    // chord-tones now have plenty of vertical clearance from each
    // other within the chord-row\'s 14px top+bottom padding.
    '  .chord-row .chord-wrapper:nth-child(odd) .chord-tones,',
    '  .chord-row.modal .chord-wrapper:nth-child(odd) .chord-tones {',
    '    transform: translateY(-8px) !important;',
    '  }',
    '  .chord-row .chord-wrapper:nth-child(even) .chord-tones,',
    '  .chord-row.modal .chord-wrapper:nth-child(even) .chord-tones {',
    '    transform: translateY(8px) !important;',
    '  }',
    '  .chord-row .chords-container,',
    '  .chord-row.modal .chords-container {',
    '    padding-top: 14px !important;',
    '    padding-bottom: 14px !important;',
    '  }',
    '  .chord-tones .tone-stack:active {',
    '    transform: scale(0.94);',
    '    transition: transform 80ms ease-out;',
    '  }',
    // ── v3.4 header: NO overrides. debug-with-patches.html has
    //   been updated to include class="logo-image" + the <div
    //   class="tagline"> element, so the production styles in
    //   styles.css (.logo-image{50×50, radius:10px, shadow},
    //   .logo-container{white card, radius:12px, shadow},
    //   .tagline{uppercase, letter-spaced}) now apply correctly.
    //   No patch CSS needed.
    '}',  // closes @media (max-width: 480px)
    // ── iOS scroll-jump dampening on chord-shape input focus
    '.uz-shape-type-input {',
    '  scroll-margin-bottom: 40vh;',
    '  scroll-margin-top: 12vh;',
    '}',
    'body:has(#chordShapeOverlay) {',
    '  overflow: hidden;',
    '  overscroll-behavior: contain;',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  window.__uzPatchesV31 = { loaded: true, version: '3.4' };
})();
