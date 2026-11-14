# Product finder implementation review

Implemented from `MenopauseWash-Design-Handoff/02-mobile-screens` and `03-desktop`, not the exploratory boards. Preview only, with publication disabled. The design package archive SHA256 is `af984e18ec3ddb60a1f18929f8730e33e175354a3270950b30d911bf921d85f7`.

## Review screens

- [Mobile opening](mobile-start.jpg)
- [Product photo picker](mobile-picker.jpg)
- [Mobile result](mobile-result.jpg)
- [Compact 375 x 740 result](mobile-compact.jpg)
- [Desktop result](desktop-result.jpg)
- [Mobile edit sheet](mobile-edit.jpg)
- [Sweat-control route](mobile-sweat.jpg)
- [Care-first route](mobile-care.jpg)
- [No confirmed match](mobile-no-match.jpg)

These are browser screenshots of real HTML and controls. Standard mobile uses a 390 x 844 CSS viewport. Desktop uses a 1440 x 1100 CSS viewport displayed at 80% in the review harness. Browser screenshot scaling is preserved. Crops remove only the review harness background and controls.

## Build and run

```sh
python production.py --finder-preview
python validate.py --finder-preview
node --test tests/finder-engine.test.mjs
python -m unittest discover -s tests -p 'test_*.py'
```

Serve `dist/` with an ordinary static server and open `/product-finder/`. The responsive review harness is `/__review/`. Within Work, use `sites-preview start /absolute/path/to/checkout` after setting the local `.openai/hosting.json` to `{"static":{"directory":"dist"}}`.

The preview build does not export generated pages to the GitHub Pages repository root. It removes analytics, disables indexing and keeps the QA harness out of normal production builds. There is no new runtime package or framework dependency.

## What works

- Six area choices with matching body highlights and accessible native controls. The pelvic hotspot asks which source the visitor means.
- Three truthful stages; no scan, countdown, fake percentage or artificial result delay.
- Underarm clarification, independent sensitivity filters, ingredient allergy route, early care exits.
- Exact product-photo selections, searchable catalog, optional reasons and routine note. Capsule/gummy and wash/bar identities remain separate.
- One eligible primary result with at most two qualifying alternatives. Tried items and restrictions are never silently relaxed.
- Edit sheet, Back, another-area flow, privacy information, reduced motion, keyboard focus containment and return focus.
- Separate category guidance for wetness, odor control, clothes and dampness. Optional deodorant, antiperspirant, probiotic and at-home comparisons use existing internal guides.
- Answers are kept only in JavaScript memory. Finder fonts and data are local. No finder analytics, storage, query-string answers or raw health details in affiliate parameters. Amazon links use fixed product searches and `menopausewash-20` with no referrer.

## Verified in this review

26 JavaScript tests and 5 Python tests pass. The static validator passes all 25 preview routes.

Browser checks covered the complete design-example journey, exact product search (including URO capsule/gummy distinction), retained answers when editing, the sweat-control outcome and aluminum-free preference, the vaginal-change care outcome, unknown ingredient no-match, ingredient details, pelvic hotspot clarification, manual reduced motion, dialog Tab/Shift+Tab containment, Escape, and restored focus.

Opening layout: 320, 360, 375, 390, 430, 768, 1024, 1440px and 740 x 390 landscape. Product result: 320, 375, 390, 768, 1024 and 1440px. No horizontal overflow at those tested viewports. Primary shopping action fits the 375 x 740 example with context and caveat above it. Product images rendered successfully. Measurements are included in the JSON files.

Not verified on physical iOS/Android devices, real screen readers, 200% OS text scaling, or network-failure simulation. The technical-error route preserves answers in code, and malformed catalog data is covered by tests.

## Before public release

The user requested mobile and desktop review before publishing. Keep `data/finder-settings.json` disabled until that review is complete.

The two preview recommendation candidates have manufacturer ingredient/direction context checked on November 14, 2026. Exact Amazon listings have not been verified; buttons are explicitly labeled as searches. Product-photo commercial reuse rights remain unconfirmed. The build deliberately rejects a public finder release while these records are uncleared. The other products are available as previous-attempt selections, not automatic recommendations. Sweat-control and deodorant shortlists remain category guidance until exact eligible products are verified.

No fabricated review scores, prices, popularity counts, product endorsements or testimonial portraits were added.

## Source ownership

`finder_src/` holds the standalone UI. `engine.mjs` contains pure matching logic. `data/finder-products.json` holds formula, variant, direction, source and eligibility records. `finder.py` is the build boundary. Existing `production.py` handles normal site export; the preview flag isolates review output. `tests/fixtures/` holds the preview-only responsive harness.

The body and icon SVGs are the supplied original assets. Inter and Noto Serif are self-hosted with their license notices. Existing repository product photography is reused for private implementation review; this is not a new rights clearance.
