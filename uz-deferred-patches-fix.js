/* Smoke-test bootstrap for v3 follow-up fixes.
 * Loaded by debug-with-patches.html on main (which is NOT linked
 * from index.html, so user's preview is unaffected).
 * Fetches the v3 patches from the fix/patches-v3-mobile-followups
 * branch and evaluates it.
 */
(function () {
  var raw = 'https://raw.githubusercontent.com/lukedavid2/uz-build-preview-10may/fix/patches-v3-mobile-followups/uz-deferred-patches.js?_b=' + Date.now();
  fetch(raw, { cache: 'no-store' })
    .then(function (r) { return r.text(); })
    .then(function (code) {
      try {
        // Run the IIFE in page-script scope.
        (0, eval)(code);
        window.__uzPatchesBootstrapped = { version: 'v3', source: 'fix/patches-v3-mobile-followups', length: code.length };
      } catch (err) {
        window.__uzPatchesBootstrapError = String(err);
        console.error('uz-deferred-patches-fix bootstrap eval failed:', err);
      }
    })
    .catch(function (err) {
      window.__uzPatchesBootstrapError = 'fetch: ' + String(err);
      console.error('uz-deferred-patches-fix bootstrap fetch failed:', err);
    });
})();
