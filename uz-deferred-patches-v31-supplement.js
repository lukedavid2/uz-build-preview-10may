/**
 * uz-deferred-patches-v31-supplement.js  (v3.11 mobile updates)
 *
 * Loaded by the bootstrap AFTER the v3 IIFE. Re-implements the four
 * v3 behaviours that v3 got wrong on mobile, plus v3.2-v3.6
 * user-feedback iterations:
 *   - shape-type input keyboard: numeric keypad + in-app SPACE/X buttons,
 *     stacked layout (input row 1, buttons row 2)
 *   - chord-tones: two-row banding, max-content width, 22px chips
 *   - header: NO overrides (debug HTML matches production)
 *   - iOS scroll-jump dampening on chord-shape input focus
 */
(function () {
  'use strict';

  function injectShapeExtrasV31(overlay) {
    var nav = overlay.querySelector('.shape-fret-nav');
    if (nav && !nav.parentElement.querySelector('.uz-shape-shift-row')) {
      var shiftRow = document.createElement('div');
      shiftRow.className = 'uz-shape-shift-row';
      shiftRow.innerHTML =
        '<span class="uz-shape-shift-label">Shift shape:</span>' +
        '<button type="button" class="uz-shape-shift-btn" data-uz-shift="+1" title="Shift shape down (toward higher frets)">↓ 1 fret</button>' +
        '<button type="button" class="uz-shape-shift-btn" data-uz-shift="-1" title="Shift shape up (toward lower frets)">↑ 1 fret</button>';
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
      // v3.6: stack input on its own row (full width so all 6 string
      // states are visible) and put SPACE/X/Set buttons on a second
      // row below.
      typeRow.innerHTML =
        '<div class="uz-shape-type-row-input">' +
          '<label for="uzShapeTypeInput">Type:</label>' +
          '<input id="uzShapeTypeInput" class="uz-shape-type-input" type="tel" inputmode="numeric" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" pattern="[0-9xX\\- ]*" placeholder="x32010 or x 3 2 0 1 0">' +
        '</div>' +
        '<div class="uz-shape-type-row-buttons">' +
          '<button type="button" class="uz-shape-type-insert" data-uz-insert=" " title="Insert space">␣ space</button>' +
          '<button type="button" class="uz-shape-type-insert" data-uz-insert="x" title="Insert x for muted">x mute</button>' +
          '<button type="button" class="uz-shape-type-go">Set</button>' +
          '<span class="uz-hint">low E → high E</span>' +
        '</div>';
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
      typeRow.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('[data-uz-insert]');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        var ch = btn.getAttribute('data-uz-insert');
        try { input.focus({ preventScroll: true }); } catch (err) { input.focus(); }
        var start = (input.selectionStart != null) ? input.selectionStart : input.value.length;
        var end = (input.selectionEnd != null) ? input.selectionEnd : input.value.length;
        if (typeof input.setRangeText === 'function') {
          input.setRangeText(ch, start, end, 'end');
        } else {
          input.value = input.value.slice(0, start) + ch + input.value.slice(end);
          var pos = start + ch.length;
          input.setSelectionRange(pos, pos);
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
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

  // Melody-tab cell input — numeric keypad
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

  // Zoom slider min
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

  // ─── v3.6 CSS ──────────────────────────────────────────────────
  var style = document.createElement('style');
  style.id = 'uzDeferredPatchesV31Style';
  style.textContent = [
    '@media (max-width: 480px) {',
    // ── v3.6 chord-tones: TRUE two-row layout, width:max-content,
    //   no horizontal column-width constraint. Each strip is
    //   absolute-positioned with left:0, right:auto, width:max-content
    //   so it grows to fit all its chips at natural 22px size.
    //   Adjacent chord (opposite band) horizontal overlap is safe
    //   because they\'re vertically separated. Same-band chord 3
    //   is 2 wrappers away (~120px) which exceeds typical chord-
    //   tones strip width.
    '  .chord-row .chord-wrapper,',
    '  .chord-row.modal .chord-wrapper {',
    '    overflow: visible !important;',
    '    position: relative !important;',
    '    padding-bottom: 80px !important;',
    '  }',
    '  .chord-row .chord-wrapper .chord-tones,',
    '  .chord-row.modal .chord-wrapper .chord-tones,',
    '  .chord-tones {',
    '    position: absolute !important;',
    '    left: 50% !important;',
    '    right: auto !important;',
    '    height: 30px !important;',
    '    flex-wrap: nowrap !important;',
    '    overflow: visible !important;',
    '    gap: 3px !important;',
    '    padding: 0 3px !important;',
    '    margin: 0 !important;',
    '    z-index: 1;',
    '    width: max-content !important;',
    '    max-width: none !important;',
    '    border-radius: 4px;',
    '    background: rgba(255,255,255,0.025);',
    '    justify-content: flex-start;',
    '    align-items: stretch;',
    '    box-sizing: border-box;',
    '    transform: translateX(-50%) !important;',
    '  }',
    // v3.10: every strip stays centered (left: 50% + translateX).
    // The v3.8 :first/:last clamps pulled edge strips toward the
    // wrapper boundary, causing the rightmost 4-chip strip to
    // overlap the strip 2 positions to its left in the same band.
    // Natural centering means edge strips bleed only ~1-5px past
    // viewport on common phone widths — acceptable.
    '  .chord-row .chord-wrapper:nth-child(odd) .chord-tones,',
    '  .chord-row.modal .chord-wrapper:nth-child(odd) .chord-tones {',
    '    bottom: 44px !important;',
    '  }',
    '  .chord-row .chord-wrapper:nth-child(even) .chord-tones,',
    '  .chord-row.modal .chord-wrapper:nth-child(even) .chord-tones {',
    '    bottom: 0 !important;',
    '  }',
    // Chips back to 22px (column-width constraint removed)
    '  .chord-row .chord-wrapper .chord-tones .tone-stack,',
    '  .chord-row.modal .chord-wrapper .chord-tones .tone-stack,',
    '  .chord-tones .tone-stack {',
    '    min-width: 22px !important;',
    '    flex: 0 0 auto !important;',
    '    border-radius: 4px;',
    '    overflow: hidden;',
    '    box-shadow: 0 1px 1px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,255,255,0.04) inset;',
    '    height: 100%;',
    '    display: flex;',
    '    flex-direction: column;',
    '  }',
    '  .chord-tones .tone-top, .chord-tones .tone-bot {',
    '    min-width: 20px;',
    '    text-align: center;',
    '    padding: 0;',
    '    font-size: 10px;',
    '    line-height: 1.3;',
    '    flex: 1 0 auto;',
    '  }',
    '  .chord-tones .tone-top {',
    '    font-weight: 700;',
    '  }',
    '  .chord-row .chords-container,',
    '  .chord-row.modal .chords-container {',
    '    padding-top: 4px !important;',
    '    padding-bottom: 4px !important;',
    '  }',
    '  .chord-tones .tone-stack:active {',
    '    transform: scale(0.92);',
    '    transition: transform 80ms ease-out;',
    '  }',
    '  .uz-shape-type-insert {',
    '    background: rgba(212,168,83,0.18);',
    '    border: 1px solid rgba(212,168,83,0.45);',
    '    color: #d4a853;',
    '    padding: 4px 10px;',
    '    border-radius: 5px;',
    '    font-family: "Outfit", sans-serif;',
    '    font-size: 13px; font-weight: 700;',
    '    cursor: pointer;',
    '    min-height: 32px;',
    '    flex-shrink: 0;',
    '  }',
    '  .uz-shape-type-insert:active { transform: scale(0.94); background: rgba(212,168,83,0.32); }',
    // v3.10: a little extra horizontal padding on the chord-row
    // card so the rightmost 4-chip strip doesn't kiss the card edge
    '  .chord-row { padding-left: 14px !important; padding-right: 14px !important; }',
    // v3.11: borrowed-mode rows (Lydian/Mixolydian/Phrygian/DomTriads)
    // never have a second chord-tones band, so the 44px reserved below
    // the top-band strip is wasted padding. Pin the strip to bottom:0
    // and trim wrapper padding so the strip sits flush at the wrapper
    // bottom — same 6px chord-box-to-strip gap as main-row top-band.
    '  .chord-row.borrowed-mode .chord-wrapper {',
    '    padding-bottom: 36px !important;',
    '  }',
    '  .chord-row.borrowed-mode .chord-wrapper .chord-tones {',
    '    bottom: 0 !important;',
    '  }',
    '}',  // closes @media (max-width: 480px)
    // v3.7: fix vertical alignment of borrowed iv chord.
    // Roman numerals containing a ♭ (U+266D) glyph render in a
    // fallback font with different metrics than plain ASCII
    // numerals (e.g. "iv"), so the chord-numeral div height
    // varied per label and pushed some chord-boxes up vs. down.
    // Lock the numeral box to a fixed height with the text
    // bottom-aligned so the chord-box below always lines up.
    '.chord-numeral {',
    '  height: 18px !important;',
    '  line-height: 18px !important;',
    '  display: flex !important;',
    '  align-items: flex-end !important;',
    '  justify-content: center !important;',
    '  margin-bottom: 4px !important;',
    '  overflow: hidden;',
    '}',
    '.uz-shape-type-insert {',
    '  background: rgba(212,168,83,0.18);',
    '  border: 1px solid rgba(212,168,83,0.45);',
    '  color: #d4a853;',
    '  padding: 4px 10px;',
    '  border-radius: 5px;',
    '  font-family: "Outfit", sans-serif;',
    '  font-size: 13px; font-weight: 700;',
    '  cursor: pointer;',
    '  min-height: 32px;',
    '  flex-shrink: 0;',
    '}',
    '.uz-shape-type-insert:active { transform: scale(0.94); background: rgba(212,168,83,0.32); }',
    // v3.6 two-row shape-type structure
    '.uz-shape-type-row {',
    '  flex-direction: column !important;',
    '  align-items: stretch !important;',
    '  gap: 6px !important;',
    '}',
    '.uz-shape-type-row-input {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 6px;',
    '  width: 100%;',
    '}',
    '.uz-shape-type-row-input .uz-shape-type-input {',
    '  flex: 1 1 auto;',
    '  min-width: 0;',
    '}',
    '.uz-shape-type-row-buttons {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 6px;',
    '  flex-wrap: wrap;',
    '}',
    '.uz-shape-type-row-buttons .uz-hint {',
    '  margin-left: auto;',
    '  font-size: 11px;',
    '  color: #888;',
    '  flex-shrink: 1;',
    '}',
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

  window.__uzPatchesV31 = { loaded: true, version: '3.11' };
})();
