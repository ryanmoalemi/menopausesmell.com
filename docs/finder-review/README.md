# Product finder implementation review

Implemented from `MenopauseWash-Design-Handoff/02-mobile-screens` and `03-desktop`, not the exploratory boards. Launch approved by the site owner on November 14, 2026 after the mobile and desktop implementation review. The design package archive SHA256 is `af984e18ec3ddb60a1f18929f8730e33e175354a3270950b30d911bf921d85f7`.

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
- Product cards for wetness, odor control, clothes and dampness. Optional product comparisons, ingredient details, at-home care and appointment notes stay inside the finder.
- Answers are kept only in JavaScript memory. Finder fonts and data are local. No finder analytics, storage, query-string answers or raw health details in affiliate parameters. Amazon links use fixed product searches and `menopausewash-20` with no referrer.

## Verified in this review

26 JavaScript tests and 7 Python tests pass. The static validator passes all 25 preview routes.

Browser checks covered the complete design-example journey, exact product search (including URO capsule/gummy distinction), retained answers when editing, the sweat-control outcome and aluminum-free preference, the vaginal-change care outcome, unknown ingredient no-match, ingredient details, pelvic hotspot clarification, manual reduced motion, dialog Tab/Shift+Tab containment, Escape, and restored focus.

Opening layout: 320, 360, 375, 390, 430, 768, 1024, 1440px and 740 x 390 landscape. Product result: 320, 375, 390, 768, 1024 and 1440px. No horizontal overflow at those tested viewports. Primary shopping action fits the 375 x 740 example with context and caveat above it. Product images rendered successfully. Measurements are included in the JSON files.

Not verified on physical iOS/Android devices, real screen readers, 200% OS text scaling, or network-failure simulation. The technical-error route preserves answers in code, and malformed catalog data is covered by tests.

## Launch configuration

The site owner approved publication on November 14, 2026. The finder is enabled at `/product-finder/`, linked from the homepage and shared navigation, and included in the sitemap. Production config uses `preview: false`. No finder analytics or health-answer persistence is enabled.

The two recommendation candidates have current manufacturer ingredient context checked on November 14, 2026. Exact Amazon listings remain unverified; buttons explicitly open product searches using `menopausewash-20`. Other catalog products are previous-attempt choices, not automatic recommendations. Sweat-control and deodorant shortlists remain category guidance until exact products qualify.

The approved launch reuses only the existing site's product photography. SHA256 provenance checks keep this approval limited to those exact published files. Third-party photo permission fields remain unverified; the launch instruction is not represented as a license verification. Newly introduced imagery still needs its own basis for publication.

No fabricated review scores, prices, popularity counts, product endorsements or testimonial portraits were added.

## Source ownership

`finder_src/` holds the standalone UI. `engine.mjs` contains pure matching logic. `data/finder-products.json` holds formula, variant, direction, source and eligibility records. `finder.py` is the build boundary. Existing `production.py` handles normal site export; the preview flag isolates review output. `tests/fixtures/` holds the preview-only responsive harness.

The body and icon SVGs are the supplied original assets. Inter and Noto Serif are self-hosted with their license notices. Existing repository product photography is reused for private implementation review; this is not a new rights clearance.

## Compact finder update, 2026-11-14

- Reduced header, body illustration, choice cards and result spacing. The primary question/result is constrained to the available dynamic viewport; Back and Continue remain outside the content overflow area. Oversized text, short landscape screens and optional expanded content can scroll without hiding navigation.
- Added a four-stop visual progress track with animated milestone checks. The track reflects actual routed questions, including shorter care paths and ingredient-allergy questions. System reduced-motion preferences remain honored.
- Back retains entered choices. Returning from an unfinished result edit restores the previous result's answers. The first question shows a disabled Back button.
- Kept the body interaction and product-photo picker. Optional failure notes, alternative recommendations and care details open inside the finder. The main product photo, explanation and Amazon action remain together.
- Browser review: 320x740 and 390x844 mobile, 1363x936 desktop; no horizontal overflow. At 320x740 all standard underarm questions fit without content scrolling, and the sweat recommendation's Back/Other options row ends at about 662px before the final concern-chip addition. Checked body selection, previous-product notes, Back retention and the one-question bladder-care return path.
- Validation: 37 matching/progress tests plus 8 build tests passed; 25 generated pages validated.


## Shopping continuity update, 2026-11-14

- Start over resets answers, ingredient selections, failure notes, formatting preferences, history, and dialog content. Edit answers remains separate.
- Ingredient choices replace the open text allergy screen; the product-photo question stays in the flow. Specific selected ingredients require recorded exclusion coverage. Unknown allergies carry explicit label-review copy, never an allergy-safe claim.
- Leakage uses the three actual questions (area, skin, tried) and a light bladder-leak pad. Vaginal-change and irritated-skin routes offer comfort items with concise clinician notes; no treatment claims or guide detours.
- Previous failures remain excluded. A different routine category can be suggested with a clear explanation. If every eligible catalog product has been ruled out, retain an honest exceptional no-match state rather than reinsert a failed or excluded item.
- Added exact product photography: Poise Ultra Thin Light Regular 28 pads (Target product photo), Hanes cotton briefs (manufacturer), Utopia 12-pack white washcloths (manufacturer). Only Utopia has a newly verified exact Amazon destination; other new items use disclosed fixed-product searches.
- Source references: https://www.poise.com/en-us/products/incontinence-pads/ultra-thin/light-absorbency-regular-length-without-wings ; https://www.target.com/p/-/A-79330413 ; https://www.hanes.com/products/hanes-womens-cotton-assorted-briefs-10-pack/pw40wh ; https://www.utopiadeals.com/products/washcloths ; https://www.amazon.com/dp/B01N7K7EFF
- Care copy checked against https://www.nhs.uk/symptoms/vaginal-discharge/ and https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products/ .
- Validation: 41 engine tests, including ordinary route/allergen combinations, plus 8 build tests and the 25-page site validator. Manual browser checks cover small mobile and desktop, reset, leakage shopping, aluminum exclusion, photo picking and back navigation.


## Category cards and personal reveal, 2026-11-14

Concern headings now name the selected area. No allergies is first and the duplicate uncertain answer is removed from the skin question. The prior-product question now uses compact, brand-neutral category cards with relevant choices per path. Exact product exclusions remain supported in the engine; broad category history prefers a different cleanser format where appropriate and is explicitly identified when the best eligible result remains in a category the shopper has tried. It is not treated as proof that every formula in that category failed.

The reveal adds Selected for you, factual attribute/approach badges, a restrained entrance animation, and an in-tool explanation using the shopper's area, concerns and category history. No invented match percentages, ratings or loading process. OS reduced motion remains honored.

Category vocabulary informed by indexed Reddit conversations: https://www.reddit.com/r/Menopause/comments/1dannsk/ ; https://www.reddit.com/r/Perimenopause/comments/1mg04ad/peri_and_body_odor/ ; https://www.reddit.com/r/Menopause/comments/1mk8b1w/ ; https://www.reddit.com/r/Perimenopause/comments/1wm3bxs/my_newest_awful_symptom_excessive_crotch_sweating/ ; https://www.reddit.com/r/Menopause/comments/1lvfbss/smell_down_there/ . Categories describe prior use, not endorsement of the remedies in those comments.

Results-design references: https://docs.revenuehunt.com/how-to-guides/show-results-explanation/ ; https://help.octaneai.com/en/articles/17435466-use-smart-copy-in-your-quiz . Used answer recall, concise reasons and consistent product controls. Vendor conversion claims were not treated as proof of this implementation's performance.

## Numbered shortlist and reset update, 2026-11-14

- Returning to the area question through Back, the answer editor, or Start over clears all answers and navigation history. Selecting any area also starts with fresh downstream answers. The old retained-answer notice is removed.
- Allergy cards stay white. Selection uses a dark plum border and checkmark; No allergies remains first.
- Results now show up to five numbered product cards directly on the page. No Other options or Compare options gate. Results use normal page scrolling; questions remain compact. Each card has its own photo, explanation, ingredient details and Amazon action.
- The first recommendation stays first. Additional items come only from relevant categories, and every item passes the same body-area, verified-label, publication, ingredient, skin-sensitivity, and exact-failed-product filters. No supplement is inserted to fill the list. Broad category history remains a preference with an explicit compare-with-yours note.
- The irritated body-skin example offers cotton cloths and fragrance-free laundry care. This expands the permitted support categories to laundry care for irritated skin without recommending a topical rash treatment. Intimate concern paths retain supportive comfort items and a care note. Fewer than five products is expected when fewer fit.
- Care context: https://www.aad.org/news/stop-itchy-skin-in-its-tracks ; https://www.aad.org/public/diseases/eczema/types/atopic-dermatitis/atopic-dermatitis-coping ; https://www.nhs.uk/symptoms/body-odour-bo/ ; https://www.nhs.uk/conditions/vaginitis/ . These support general care categories, not efficacy claims for particular brands.

## Expanded recommendations and personalized copy, 2026-11-15

- Added six label-checked product choices and matching for everyday dryness, friction during sex, external chafing, fuller leak coverage and plain-water rinsing. Multiple needs are evaluated independently before alternates and comfort extras are added.
- Replaced every result headline, introduction and product-match explanation. Copy names selected concerns, distinguishes each product's job, reflects ingredient preferences and acknowledges prior category failures. Removed generic “washing step” copy and assertions about unselected odor or dampness.
- The reported outside-sweat + urine-leaks + intimate-symptoms case now returns five applicable products. Skin warnings and ingredient exclusions apply to the full list. Dryness-only and friction-only paths do not add filler products.
- Validation passed: 62 engine tests and 8 build tests; 25-page validation; JS syntax and diff checks. Engine tests include 567 combined intimate-concern/allergy contexts. Browser review covered 390px body-odor results, 320px concern and dryness flows, 1440px five-product results, back navigation and a fresh reset. Final preview had no broken product images or horizontal overflow. The smallest screen uses the existing scrollable question panel with the action buttons kept visible.
- Research, manufacturer labels, social coverage limitations and Amazon session limitations are documented in [research-and-copy-2026-11-15.md](research-and-copy-2026-11-15.md). Exact new Amazon listing verification remains incomplete; those destinations are explicitly disclosed searches.

## Recommendation fixes, 2026-11-16

See [ad-readiness-2026-11-16.md](ad-readiness-2026-11-16.md) for the current recommendation, exact-product exclusion, benefits, purchase-check, result-order and isolated aggregate measurement changes. Earlier no-analytics descriptions above describe historical releases. Amazon searches are now labeled Find on Amazon; no additional exact listings were guessed.
