/**
 * uz-deferred-patches.js — runtime patches for the six "deferred"
 * items from the 2026-05-12 mobile UX audit. Loaded after app.js
 * via index.html. v2: chord-name captured at edit time + toolbar
 * Select toggle (long-press removed).
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleInit);
  } else {
    scheduleInit();
  }

  function scheduleInit() { setTimeout(init, 1500); }

  function init() {
    injectStyles();
    setupHintDotGate();
    setupShapeEditorExtras();
    setupMismatchWarnings();
    setupMultiSelectDrag();
    setupToolbarSelectToggle();
    setupTabBoundarySnapshot();
  }

  function injectStyles() {
    var css = [
      'body.uz-shape-clean #chordShapeOverlay .hint-dot,',
      'body.uz-shape-clean #chordShapeOverlay .hint-note { display: none !important; }',
      '.uz-shape-shift-row { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 6px 0; margin-bottom: 4px; }',
      '.uz-shape-shift-btn { min-width: 38px; min-height: 32px; background: rgba(212,168,83,0.10); border: 1px solid rgba(212,168,83,0.4); color: #d4a853; border-radius: 6px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: "Outfit", sans-serif; }',
      '.uz-shape-shift-btn:hover { background: rgba(212,168,83,0.18); border-color: #d4a853; }',
      '.uz-shape-shift-btn:active { transform: scale(0.96); }',
      '.uz-shape-shift-label { font-size: 12px; color: #999; }',
      '.uz-shape-type-row { display: flex; align-items: center; gap: 6px; padding: 8px 12px; margin: 0 12px 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; }',
      '.uz-shape-type-row label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 0.04em; flex-shrink: 0; }',
      '.uz-shape-type-input { flex: 1; min-width: 0; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; color: #e0e0e0; font-family: "JetBrains Mono", "Menlo", monospace; font-size: 14px; padding: 6px 8px; }',
      '.uz-shape-type-input:focus { outline: none; border-color: #d4a853; }',
      '.uz-shape-type-go { background: #d4a853; color: #1a1a2a; border: none; padding: 6px 10px; border-radius: 4px; font-size: 13px; font-weight: 700; cursor: pointer; }',
      '.uz-shape-type-go:hover { background: #e8ba50; }',
      '.uz-shape-type-row .uz-hint { font-size: 11px; color: #888; flex-shrink: 0; }',
      '.progression-chord.uz-chord-mismatch::after { content: "⚠️"; position: absolute; top: 2px; right: 18px; font-size: 14px; line-height: 1; pointer-events: none; filter: drop-shadow(0 0 2px rgba(0,0,0,0.6)); }',
      '.progression-chord { position: relative; }',
      '.progression-chord.uz-chord-mismatch { outline: 1px dashed rgba(255,180,60,0.7); outline-offset: -2px; }',
      '.progression-chord.uz-selected { outline: 2px solid #d4a853; outline-offset: -2px; background: rgba(212,168,83,0.08); }',
      '.progression-chord.uz-dragging, .progression-chord.uz-dragging-group { opacity: 0.4; }',
      'body.uz-select-mode .progression-chord::before { content: ""; position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border: 2px solid rgba(212,168,83,0.6); border-radius: 3px; background: rgba(0,0,0,0.25); z-index: 2; pointer-events: none; }',
      'body.uz-select-mode .progression-chord.uz-selected::before { background: #d4a853; border-color: #d4a853; box-shadow: inset 0 0 0 2px #1a1a2a, inset 0 0 0 4px #d4a853; }',
      '.uz-select-mode-bar { position: fixed; top: 60px; left: 50%; transform: translateX(-50%); z-index: 9500; display: flex; align-items: center; gap: 12px; padding: 8px 14px; background: rgba(26,26,40,0.96); border: 1px solid rgba(212,168,83,0.5); border-radius: 8px; color: #e0e0e0; font-family: "Outfit", sans-serif; font-size: 13px; box-shadow: 0 6px 18px rgba(0,0,0,0.5); }',
      '.uz-select-mode-bar button { background: rgba(212,168,83,0.18); border: 1px solid rgba(212,168,83,0.5); color: #d4a853; padding: 6px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; min-height: 32px; }',
      '.uz-drag-ghost { position: fixed; pointer-events: none; z-index: 9999; background: rgba(212,168,83,0.92); color: #1a1a2a; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-family: "Outfit", sans-serif; font-size: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.5); transform: translate(-50%, -50%); }',
      '.uz-drop-target { outline: 2px dashed #d4a853 !important; outline-offset: 2px; }',
      'body.uz-select-mode .progression-chord { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }',
      '.uz-select-toggle-btn { background: rgba(212,168,83,0.12); border: 1px solid rgba(212,168,83,0.4); color: #d4a853; padding: 6px 10px; border-radius: 6px; font-family: "Outfit", sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; min-height: 32px; }',
      '.uz-select-toggle-btn:hover { background: rgba(212,168,83,0.22); border-color: #d4a853; }',
      '.uz-select-toggle-btn:active { transform: scale(0.97); }',
      '.uz-select-toggle-btn.uz-select-toggle-active { background: #d4a853; color: #1a1a2a; border-color: #d4a853; }',
      '.uz-select-toggle-icon { margin-right: 4px; }',
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'uzDeferredPatchesStyle';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Item 1: hint-dot gate (overlay-scoped observer)
  function setupHintDotGate() {
    var hintObs = null;
    function check() {
      var overlay = document.getElementById('chordShapeOverlay');
      if (!overlay) {
        document.body.classList.remove('uz-shape-clean');
        if (hintObs) { hintObs.disconnect(); hintObs = null; }
        return;
      }
      var hasPlaced = overlay.querySelector('.shape-fret-cell.active');
      document.body.classList.toggle('uz-shape-clean', !hasPlaced);
    }
    function attachOverlayObs() {
      var overlay = document.getElementById('chordShapeOverlay');
      if (!overlay) return;
      check();
      if (hintObs) hintObs.disconnect();
      hintObs = new MutationObserver(check);
      hintObs.observe(overlay, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest && e.target.closest('[data-action="editChordShape"]');
      if (!t) return;
      setTimeout(attachOverlayObs, 50);
      setTimeout(attachOverlayObs, 250);
    }, true);
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest && e.target.closest('[data-action="closeChordShape"], [data-action="saveChordShape"], [data-action="cancelChordShape"], [data-action="clearChordShape"]');
      if (!t) return;
      setTimeout(check, 200);
    }, true);
  }

  // Items 2 + 3: shape editor extras (click-triggered, not body observer)
  function setupShapeEditorExtras() {
    function tryInject() {
      var overlay = document.getElementById('chordShapeOverlay');
      if (overlay && !overlay.dataset.uzExtrasInjected) {
        overlay.dataset.uzExtrasInjected = '1';
        injectShapeExtras(overlay);
      }
    }
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest && e.target.closest('[data-action="editChordShape"]');
      if (!t) return;
      setTimeout(tryInject, 50);
      setTimeout(tryInject, 200);
      setTimeout(tryInject, 500);
    }, true);
    tryInject();
  }

  function injectShapeExtras(overlay) {
    // Item 2: shift buttons
    var nav = overlay.querySelector('.shape-fret-nav');
    if (nav && !nav.parentElement.querySelector('.uz-shape-shift-row')) {
      var shiftRow = document.createElement('div');
      shiftRow.className = 'uz-shape-shift-row';
      shiftRow.innerHTML = '<span class="uz-shape-shift-label">Shift shape:</span><button type="button" class="uz-shape-shift-btn" data-uz-shift="-1" title="Shift down 1 fret">↓ 1 fret</button><button type="button" class="uz-shape-shift-btn" data-uz-shift="+1" title="Shift up 1 fret">↑ 1 fret</button>';
      nav.parentElement.insertBefore(shiftRow, nav.nextSibling);
      shiftRow.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-uz-shift]');
        if (!btn) return;
        var dir = btn.getAttribute('data-uz-shift') === '+1' ? +1 : -1;
        shiftShape(overlay, dir);
      });
    }
    // Item 3: type-to-enter
    var body = overlay.querySelector('.shape-editor-body');
    var fretboard = overlay.querySelector('.shape-fretboard');
    if (body && fretboard && !body.querySelector('.uz-shape-type-row')) {
      var typeRow = document.createElement('div');
      typeRow.className = 'uz-shape-type-row';
      typeRow.innerHTML = '<label for="uzShapeTypeInput">Type:</label><input id="uzShapeTypeInput" class="uz-shape-type-input" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="x 3 2 0 1 0"><button type="button" class="uz-shape-type-go">Set</button><span class="uz-hint">low E → high E</span>';
      body.insertBefore(typeRow, fretboard);
      var input = typeRow.querySelector('.uz-shape-type-input');
      var goBtn = typeRow.querySelector('.uz-shape-type-go');
      function apply() {
        var tokens = (input.value || '').trim().split(/\s+/);
        applyFretString(overlay, tokens);
      }
      goBtn.addEventListener('click', apply);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); apply(); }
      });
      input.value = readCurrentFretString(overlay);
    }
  }

  function readCurrentFretsFromDOM(overlay) {
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

  function readCurrentFretString(overlay) {
    var f = readCurrentFretsFromDOM(overlay);
    return f.map(function (v) { return v === null ? 'x' : String(v); }).join(' ');
  }

  function applyFretString(overlay, tokens) {
    if (tokens.length !== 6) { flashTypeError(overlay, 'Need exactly 6 values'); return; }
    var target = tokens.map(function (t) {
      t = String(t).trim().toLowerCase();
      if (t === 'x' || t === '-') return null;
      var n = parseInt(t, 10);
      if (isNaN(n) || n < 0 || n > 24) return undefined;
      return n;
    });
    if (target.some(function (v) { return v === undefined; })) { flashTypeError(overlay, 'Use frets 0-24 or x for muted'); return; }
    var clearBtn = overlay.querySelector('[data-action="clearChordShape"]');
    if (clearBtn) clearBtn.click();
    setTimeout(function () { placeFrets(target); }, 30);
  }

  function flashTypeError(overlay, msg) {
    var input = overlay.querySelector('.uz-shape-type-input');
    if (!input) return;
    var orig = input.placeholder;
    input.placeholder = msg;
    input.style.borderColor = '#ff6666';
    setTimeout(function () { input.placeholder = orig; input.style.borderColor = ''; }, 2500);
  }

  function placeFrets(target) {
    var overlay = document.getElementById('chordShapeOverlay');
    if (!overlay) return;
    var stringHeaders = overlay.querySelectorAll('.shape-string-header');
    for (var s = 0; s < 6; s++) {
      var t = target[s];
      var header = stringHeaders[s];
      if (t === null) cycleStringHeader(header, 'X');
      else if (t === 0) cycleStringHeader(header, 'O');
      else clickFretAtAbsolute(s, t);
    }
  }

  function cycleStringHeader(header, want) {
    if (!header) return;
    var stateEl = header.querySelector('.shape-string-state');
    function read() { return (stateEl && stateEl.textContent || '').trim(); }
    for (var i = 0; i < 3 && read() !== want; i++) header.click();
  }

  function clickFretAtAbsolute(stringIdx, absFret) {
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
      setTimeout(function () { clickFretAtAbsolute(stringIdx, absFret); }, 30);
      return;
    }
    var cells = foundRow.querySelectorAll('.shape-fret-cell');
    var cell = cells[stringIdx];
    if (cell && !cell.classList.contains('active')) cell.click();
  }

  function shiftShape(overlay, dir) {
    var current = readCurrentFretsFromDOM(overlay);
    var next = current.map(function (v) {
      if (v === null || v === 0) return v;
      return v + dir;
    });
    if (next.some(function (v) { return v !== null && v < 0; })) { flashTypeError(overlay, 'Cannot shift below fret 0'); return; }
    if (next.some(function (v) { return v !== null && v > 24; })) { flashTypeError(overlay, 'Cannot shift above fret 24'); return; }
    var clearBtn = overlay.querySelector('[data-action="clearChordShape"]');
    if (clearBtn) clearBtn.click();
    setTimeout(function () { placeFrets(next); }, 30);
  }

  // Item 4: mismatch warning. KEY: capture original chord name at
  // edit-click time (NOT at save time), so app.js's auto-rename of
  // the chord doesn't fool our match check.
  var mismatchByCardKey = Object.create(null);
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('[data-action]');
    if (!t) return;
    var action = t.getAttribute('data-action');
    if (action === 'editChordShape') {
      var line = t.getAttribute('data-line');
      var idx = t.getAttribute('data-idx');
      var card = t.closest('.progression-chord');
      var origChord = card ? (card.getAttribute('data-chord') || '') : '';
      window.__uzPendingShapeEdit = { line: line, idx: idx, origChord: origChord };
    } else if (action === 'saveChordShape') {
      try {
        var overlay = document.getElementById('chordShapeOverlay');
        var frets = overlay ? readCurrentFretsFromDOM(overlay) : null;
        var key = window.__uzPendingShapeEdit;
        var chordName = key && key.origChord;
        if (chordName && frets && key) {
          var mismatch = !shapeMatchesChord(chordName, frets);
          mismatchByCardKey[key.line + ':' + key.idx] = mismatch;
        }
      } catch (err) {}
      setTimeout(applyMismatchBadges, 100);
      setTimeout(applyMismatchBadges, 400);
    } else if (action === 'clearChordShape') {
      var k2 = window.__uzPendingShapeEdit;
      if (k2) delete mismatchByCardKey[k2.line + ':' + k2.idx];
      setTimeout(applyMismatchBadges, 100);
    }
  }, true);

  function setupMismatchWarnings() {
    var area = document.getElementById('progressionArea');
    if (!area) return;
    new MutationObserver(function () { applyMismatchBadges(); }).observe(area, { childList: true, subtree: true });
    setTimeout(applyMismatchBadges, 500);
  }

  function applyMismatchBadges() {
    document.querySelectorAll('.progression-chord').forEach(function (card) {
      var line = card.getAttribute('data-line');
      var idx = card.getAttribute('data-idx');
      var k = line + ':' + idx;
      var hasShape = !!card.querySelector('.mini-chord-svg');
      if (hasShape && mismatchByCardKey[k]) {
        card.classList.add('uz-chord-mismatch');
        card.setAttribute('title', 'This shape doesn\'t play the named chord. Tap ♦ to edit.');
      } else {
        card.classList.remove('uz-chord-mismatch');
      }
    });
  }

  var NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  var FLAT_TO_SHARP = { Db:'C#', Eb:'D#', Gb:'F#', Ab:'G#', Bb:'A#' };
  var OPEN_PITCH_CLASSES = [4, 9, 2, 7, 11, 4];
  var CHORD_INTERVALS = {
    ''     : [0,4,7], 'm'    : [0,3,7], '7'    : [0,4,7,10], 'm7'   : [0,3,7,10],
    'maj7' : [0,4,7,11], 'sus4' : [0,5,7], 'sus2' : [0,2,7], 'dim'  : [0,3,6],
    'aug'  : [0,4,8], '6'    : [0,4,7,9], 'm6'   : [0,3,7,9], 'dim7' : [0,3,6,9],
    'm7b5' : [0,3,6,10], 'add9' : [0,4,7,14], '9'    : [0,4,7,10,14],
  };
  function chordExpectedPCs(chordName) {
    var m = chordName.match(/^([A-G][b#]?)(.*)$/);
    if (!m) return null;
    var root = FLAT_TO_SHARP[m[1]] || m[1];
    var ri = NOTE_NAMES.indexOf(root);
    if (ri < 0) return null;
    var iv = CHORD_INTERVALS[m[2] || ''] || CHORD_INTERVALS[''];
    var pcs = new Set();
    iv.forEach(function (i) { pcs.add((ri + i) % 12); });
    return pcs;
  }
  function actualPCsFromFrets(frets) {
    var pcs = new Set();
    for (var s = 0; s < 6; s++) {
      var f = frets[s];
      if (f === null || f === undefined) continue;
      pcs.add((OPEN_PITCH_CLASSES[s] + f) % 12);
    }
    return pcs;
  }
  function shapeMatchesChord(chordName, frets) {
    var expected = chordExpectedPCs(chordName);
    if (!expected) return true;
    var actual = actualPCsFromFrets(frets);
    if (actual.size === 0) return true;
    var allFound = true;
    expected.forEach(function (pc) { if (!actual.has(pc)) allFound = false; });
    var noOutside = true;
    actual.forEach(function (pc) { if (!expected.has(pc)) noOutside = false; });
    return allFound && noOutside;
  }

  // Item 5: multi-select + drag (NO long-press; toolbar toggle below)
  var selected = new Set();
  var selectMode = false;
  function cardKey(card) { return card.getAttribute('data-line') + ':' + card.getAttribute('data-idx'); }

  function setupMultiSelectDrag() {
    document.addEventListener('click', function (e) {
      var card = e.target.closest && e.target.closest('.progression-chord');
      if (!card) return;
      if (e.shiftKey) { e.preventDefault(); e.stopImmediatePropagation(); extendSelection(card); }
      else if (e.metaKey || e.ctrlKey) { e.preventDefault(); e.stopImmediatePropagation(); toggleSelection(card); }
      else if (selectMode) { e.preventDefault(); e.stopImmediatePropagation(); toggleSelection(card); }
    }, true);
    setupPointerDrag();
    document.addEventListener('dragstart', function (e) {
      var card = e.target.closest && e.target.closest('.progression-chord');
      if (!card) return;
      var ck = cardKey(card);
      if (!selected.has(ck)) { clearSelection(); return; }
      var members = Array.from(selected);
      e.dataTransfer.setData('application/x-uz-multi', JSON.stringify(members));
      try { e.dataTransfer.setData('text/plain', members.join(',')); } catch (err) {}
      members.forEach(function (k) {
        var el = document.querySelector('.progression-chord[data-line="' + k.split(':')[0] + '"][data-idx="' + k.split(':')[1] + '"]');
        if (el) el.classList.add('uz-dragging-group');
      });
      var ghost = document.createElement('div');
      ghost.className = 'uz-drag-ghost';
      ghost.textContent = members.length + ' chords';
      ghost.style.cssText = 'position:absolute;top:-1000px;';
      document.body.appendChild(ghost);
      try { e.dataTransfer.setDragImage(ghost, 40, 16); } catch (err) {}
      setTimeout(function () { ghost.remove(); }, 200);
    }, true);
    document.addEventListener('dragend', function () {
      document.querySelectorAll('.uz-dragging-group').forEach(function (el) { el.classList.remove('uz-dragging-group'); });
    }, true);
    document.addEventListener('drop', function (e) {
      var multi = null;
      try { multi = e.dataTransfer && e.dataTransfer.getData('application/x-uz-multi'); } catch (err) {}
      if (!multi) return;
      var members = JSON.parse(multi);
      var dropTarget = e.target.closest('.progression-chord, .line-chords');
      if (!dropTarget) return;
      e.preventDefault(); e.stopImmediatePropagation();
      doMultiMove(members, dropTarget);
    }, true);
  }

  // Toolbar Select toggle (replaces mobile long-press)
  function setupToolbarSelectToggle() {
    function tryInject() {
      var toolButtons = document.getElementById('toolButtons');
      if (!toolButtons) return false;
      if (toolButtons.querySelector('#uzSelectToggle')) return true;
      var btn = document.createElement('button');
      btn.id = 'uzSelectToggle';
      btn.className = 'uz-select-toggle-btn';
      btn.type = 'button';
      btn.title = 'Toggle multi-select mode — tap chord cards to select, then drag to move the group';
      btn.innerHTML = '<span class="uz-select-toggle-icon">☑</span> Select';
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (selectMode) { exitSelectMode(); btn.classList.remove('uz-select-toggle-active'); }
        else { enterSelectMode(); btn.classList.add('uz-select-toggle-active'); }
      });
      toolButtons.appendChild(btn);
      return true;
    }
    if (tryInject()) return;
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (tryInject() || tries > 20) clearInterval(iv);
    }, 250);
  }

  function extendSelection(card) {
    if (selected.size === 0) { toggleSelection(card); return; }
    var siblings = Array.from(card.parentElement.querySelectorAll('.progression-chord'));
    var newIdx = siblings.indexOf(card);
    var existingIdx = -1;
    siblings.forEach(function (el, i) {
      if (selected.has(cardKey(el))) {
        if (existingIdx === -1 || Math.abs(i - newIdx) < Math.abs(existingIdx - newIdx)) existingIdx = i;
      }
    });
    if (existingIdx === -1) { toggleSelection(card); return; }
    var lo = Math.min(existingIdx, newIdx);
    var hi = Math.max(existingIdx, newIdx);
    for (var i = lo; i <= hi; i++) selected.add(cardKey(siblings[i]));
    refreshSelectionDOM();
  }

  function toggleSelection(card) {
    var k = cardKey(card);
    if (selected.has(k)) selected.delete(k); else selected.add(k);
    refreshSelectionDOM();
    updateSelectBar();
  }
  function clearSelection() { selected.clear(); refreshSelectionDOM(); updateSelectBar(); }
  function refreshSelectionDOM() {
    document.querySelectorAll('.progression-chord').forEach(function (card) {
      card.classList.toggle('uz-selected', selected.has(cardKey(card)));
    });
  }
  function enterSelectMode() {
    if (selectMode) return;
    selectMode = true;
    document.body.classList.add('uz-select-mode');
    syncSelectToggleBtn();
    updateSelectBar();
  }
  function exitSelectMode() {
    selectMode = false;
    document.body.classList.remove('uz-select-mode');
    clearSelection();
    syncSelectToggleBtn();
    var bar = document.getElementById('uzSelectModeBar');
    if (bar) bar.remove();
  }
  function syncSelectToggleBtn() {
    var btn = document.getElementById('uzSelectToggle');
    if (!btn) return;
    btn.classList.toggle('uz-select-toggle-active', selectMode);
  }
  function updateSelectBar() {
    if (!selectMode && selected.size === 0) {
      var existing = document.getElementById('uzSelectModeBar');
      if (existing) existing.remove();
      return;
    }
    var bar = document.getElementById('uzSelectModeBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'uzSelectModeBar';
      bar.className = 'uz-select-mode-bar';
      document.body.appendChild(bar);
      bar.innerHTML = '<span class="uz-select-count"></span><button type="button" data-uz-act="clear">Clear</button><button type="button" data-uz-act="exit">Done</button>';
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('[data-uz-act]');
        if (!b) return;
        var act = b.getAttribute('data-uz-act');
        if (act === 'clear') clearSelection();
        if (act === 'exit') exitSelectMode();
      });
    }
    bar.querySelector('.uz-select-count').textContent = selected.size + ' selected — drag any to move group';
  }
  function doMultiMove(members, dropTarget) {
    members.sort(function (a, b) {
      var ax = a.split(':').map(Number), bx = b.split(':').map(Number);
      return ax[0] - bx[0] || ax[1] - bx[1];
    });
    var rect = dropTarget.getBoundingClientRect();
    var isCont = dropTarget.classList.contains('line-chords');
    var cx = isCont ? rect.right - 4 : rect.left + 8;
    var cy = rect.top + rect.height / 2;
    members.forEach(function (k, i) {
      var parts = k.split(':');
      var sel = '.progression-chord[data-line="' + parts[0] + '"][data-idx="' + parts[1] + '"]';
      var src = document.querySelector(sel);
      if (!src) return;
      var dt = new DataTransfer();
      try { dt.setData('text/plain', parts.join(',')); } catch (err) {}
      src.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dt }));
      dropTarget.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt, clientX: cx, clientY: cy }));
      dropTarget.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt, clientX: cx, clientY: cy }));
      src.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer: dt }));
    });
    selected.clear(); refreshSelectionDOM(); updateSelectBar();
  }

  var pdState = null;
  function setupPointerDrag() {
    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('pointerup', onPointerUp, true);
    document.addEventListener('pointercancel', onPointerUp, true);
  }
  function onPointerMove(e) {
    if (!pdState) return;
    if (e.pointerType !== 'touch') return;
    e.preventDefault();
    pdState.ghost.style.left = e.clientX + 'px';
    pdState.ghost.style.top = e.clientY + 'px';
    var hit = document.elementFromPoint(e.clientX, e.clientY);
    var dt = hit && (hit.closest('.progression-chord') || hit.closest('.line-chords'));
    if (pdState.lastTarget && pdState.lastTarget !== dt) pdState.lastTarget.classList.remove('uz-drop-target');
    if (dt) dt.classList.add('uz-drop-target');
    pdState.lastTarget = dt;
  }
  function onPointerUp(e) {
    if (!pdState) return;
    pdState.ghost.remove();
    if (pdState.lastTarget) {
      pdState.lastTarget.classList.remove('uz-drop-target');
      doMultiMove(pdState.members, pdState.lastTarget);
    }
    pdState = null;
  }

  // Item 6: boundary snapshot (defensive guard on growth===1)
  var boundarySnapshots = Object.create(null);
  function setupTabBoundarySnapshot() {
    var area = document.getElementById('progressionArea');
    if (!area) return;
    new MutationObserver(function () {
      document.querySelectorAll('.tab-grid').forEach(function (grid) {
        var lineEl = grid.closest('[data-line]') || grid.closest('.progression-line') || grid.closest('.line-card');
        if (!lineEl) return;
        var lineIdx = lineEl.getAttribute('data-line');
        if (lineIdx === null) return;
        snapshotOrRestore(parseInt(lineIdx, 10), grid);
      });
    }).observe(area, { childList: true, subtree: true });
  }
  function snapshotOrRestore(lineIdx, grid) {
    var children = Array.from(grid.children);
    var boundaries = [];
    var colCount = 0;
    children.forEach(function (el) {
      if (el.classList.contains('tab-chord-boundary')) boundaries.push(colCount);
      else if (/tab-col/.test(el.className)) colCount++;
    });
    var snap = boundarySnapshots[lineIdx];
    if (!snap) {
      boundarySnapshots[lineIdx] = { boundaries: boundaries.slice(), tabLen: colCount };
      return;
    }
    var growth = boundaries.length - snap.boundaries.length;
    if (growth === 1) {
      var expected = [];
      for (var i = 0; i < boundaries.length; i++) expected.push(Math.floor(i * colCount / boundaries.length));
      expected[0] = 0;
      var isEvenSplit = boundaries.every(function (b, i) { return Math.abs(b - expected[i]) <= 1; });
      if (isEvenSplit && snap.boundaries.length > 1) {
        var desired = snap.boundaries.slice();
        desired.push(snap.tabLen);
        restoreBoundaries(lineIdx, grid, desired);
      }
    }
    boundarySnapshots[lineIdx] = { boundaries: boundaries.slice(), tabLen: colCount };
  }
  function restoreBoundaries(lineIdx, grid, desired) {
    var boundaries = grid.querySelectorAll('.tab-chord-boundary');
    boundaries.forEach(function (bDiv, i) {
      var targetCol = desired[i];
      if (targetCol === undefined) return;
      var cols = grid.querySelectorAll('[class*="tab-col"]');
      var col = cols[targetCol];
      if (!col) return;
      var rect = col.getBoundingClientRect();
      var bRect = bDiv.getBoundingClientRect();
      if (Math.abs(rect.left - bRect.left) < 4) return;
      var dt = new DataTransfer();
      try { dt.setData('text/plain', 'boundary'); } catch (err) {}
      bDiv.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt, clientX: bRect.left, clientY: bRect.top }));
      col.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt, clientX: rect.left, clientY: rect.top }));
      col.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt, clientX: rect.left, clientY: rect.top }));
      bDiv.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
    });
  }

})();
