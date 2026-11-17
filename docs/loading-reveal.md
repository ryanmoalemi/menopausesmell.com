# Loading and recommendation reveal

Integrated November 17, 2026 from the supplied `MenopauseWash-Loading-Reveal-Implementation.zip`. The package targeted an older commit, so its new modules and integration were merged into the current source. Its old app, catalog, generated preview and installer were not substituted for the current site.

## Visitor experience

Four stages run for 3.2 seconds each, totaling 12.8 seconds of visible reading time. The final stage is gold with a gentle sparkle and shimmer. Results open automatically and receive heading focus. Back, reset and navigation cancel stale callbacks. Editing a result and changing an aluminum preference remain immediate.

Care messages, unresolved allergies and no-match outcomes bypass the presentation. Missing reviews use neutral matching copy. Quotes appear in the results only under the existing source, scope and freshness checks.

Stage one uses relevant experiences from saved Reddit research only when a non-optional recommendation has a fresh, positive product-and-topic match. Stage two names the actual primary product category in the researched shortlist. Stage three reflects ingredient restrictions, fragrance or reactive-skin preferences, exact exclusions or broad approaches already tried. Stage four names the selected concern. The copy does not claim live Amazon or Reddit searches.

The package's explicit 12.8-second timing is retained. It is a presentation interval after matching, not the time required to retrieve or calculate recommendations. There is no measured evidence yet that this delay improves conversions. Evaluate completion and outbound-click rates before increasing paid traffic; a shorter-duration experiment is a future option.

## Data and source handling

`finder-data.mjs` requests only the same-site public `catalog.json`, `config.json` and optional `reviews.json`. The existing compatible fetch helper limits required requests to ten seconds and reviews to four seconds, even when AbortController is missing or a JSON body stalls. Requests omit credentials and referrers. Visitor answers remain in memory and do not become URLs, remote search queries, saved records or event payloads.

The authoritative catalog is `data/finder-products.json`; the reviewed experience corpus is `data/finder-reviews.json`. Existing `finder_reviews.py`, `scripts/import_finder_reviews.py` and `docs/review-import-workflow.md` own validation, import and public-field export. Gather source material editorially, verify exact product/formula and original context, preserve literal excerpts and actual checked dates, then import and rebuild. This integration does not claim a new research refresh or schedule one.

The source package's older instruction to retain Amazon search fallbacks conflicts with the owner's newer direct-product requirement. Current direct ASIN links, `menopausewash-20`, and the strict Amazon build audit remain authoritative. Product eligibility, recommendation order, benefits, quoted text, care copy and the existing expanded extras are unchanged.

## Implementation

- `finder_src/loading.mjs`: copy selection, four-stage controller, pause, cancellation and accessible markup.
- `finder_src/loading.css`: normal, short-phone and landscape layouts; reduced-motion and result entrance styles.
- `finder_src/finder-data.mjs`: public data loading through `compat.mjs`.
- `finder_src/app.mjs`: normal submit, immediate exceptional results, edits, reset and browser-history recovery.
- `finder.py`: dependent module and stylesheet cache versions.

The in-page Reduce motion button disables movement but preserves reading time. System reduced-motion CSS is also supported. Opening a dialog or hiding the page pauses progress. Browser history restoration renders the current screen immediately and records completion if it interrupted a pending reveal. The existing generic completion event fires when results appear rather than when the final answer is submitted.

## Verification

Browser evidence is in `finder-review/loading-browser-checks.json`. All four stages and automatic heading focus were observed. Seven viewport sizes were measured: 320×568, 360×560, 390×600, 390×844, 740×390, 1024×600 and 1366×768. The first pass found the sequence too tall in short windows. The corrected version fits all four rows without horizontal overflow in these sizes.

Observed UI checks include Reduce motion, immediate edits, Back and reset during loading, care bypass, unresolved-allergy bypass with no buy links, no-match bypass, missing-review fallback and completed results, required-data failure and Retry, older-API simulation, and navigating home during the sequence then returning without a stranded loader.

The automated suite includes timing boundaries, cancellation, replacement runs, hidden-page behavior, dialog pause, review eligibility, escaping, bounded data fetching and cache-version integrity. Run `node --test tests/*.test.mjs`, `python -m unittest discover -s tests`, `python production.py`, `python validate.py`, `python amazon_audit.py dist`, and `git diff --check`.

This is cloud Chrome testing at different viewport sizes, not certification of real social-app browsers, Safari, Firefox, iOS or Android. Actual cross-device coverage remains pending as documented in the earlier Amazon/browser audit.

## Release verification

Application commit `55db0e00e1d208db9708fec4b15fc6cd485ba372` passed GitHub Pages deployment run `44186094708`. Validation finished with 100 Node tests and 20 Python tests passing, 25 site pages validated, a clean Amazon destination audit and no whitespace errors.

On the live site, completed an underarm smell-and-wetness journey with fragrance preference. Observed the staged sequence followed by automatic results and heading focus; all five displayed shopping links were direct product URLs with `menopausewash-20`, extras were expanded, and no site-origin console errors or warnings were captured. Live evidence: `finder-review/loading-live.jpg` and `finder-review/loading-live-check.json`.
