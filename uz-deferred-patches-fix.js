/* Smoke-test bootstrap. Loaded by debug-with-patches.html on main
 * (NOT by index.html). Fetches both the v3 base file AND the v3.1
 * supplement file from the fix/patches-v3-mobile-followups branch,
 * evaluates them in order: v3 first, then v3.1 (which patches v3's
 * regressions).
 */
(function () {
  var BRANCH = 'fix/patches-v3-mobile-followups';
  var BASE = 'https://raw.githubusercontent.com/lukedavid2/uz-build-preview-10may/' + BRANCH + '/';
  function load(name) {
    return fetch(BASE + name + '?_b=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.text(); });
  }
  load('uz-deferred-patches.js')
    .then(function (code) {
      try {
        (0, eval)(code);
        window.__uzPatchesBootstrapped = { version: 'v3', length: code.length };
      } catch (err) {
        window.__uzPatchesBootstrapError = 'v3 eval: ' + String(err);
        console.error('v3 eval failed:', err);
        throw err;
      }
      return load('uz-deferred-patches-v31-supplement.js');
    })
    .then(function (code) {
      try {
        (0, eval)(code);
        if (window.__uzPatchesBootstrapped) {
          window.__uzPatchesBootstrapped.supplement = { version: 'v3.1', length: code.length };
        }
      } catch (err) {
        window.__uzPatchesBootstrapError = 'v3.1 eval: ' + String(err);
        console.error('v3.1 supplement eval failed:', err);
      }
    })
    .catch(function (err) {
      window.__uzPatchesBootstrapError = window.__uzPatchesBootstrapError || ('fetch: ' + String(err));
      console.error('bootstrap failed:', err);
    });
})();
