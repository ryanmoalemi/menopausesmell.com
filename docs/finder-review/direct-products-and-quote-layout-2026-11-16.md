# Direct products and quote placement, November 16, 2026

The product finder now uses direct Amazon product destinations for all 15 automatic recommendation candidates and the one optional browse-only item (URO capsules). Each URL contains only its exact ASIN path and the fixed `menopausewash-20` tag. No questionnaire answers are included in shopping URLs.

Fourteen search destinations were replaced. The already-direct Vanicream antiperspirant and Utopia washcloth links were retained. ASIN identity sources, named variants and verification scope are recorded in `data/finder-products.json`. Manufacturer facts remain the basis for ingredients and product claims. Secondary product records were used only to identify destinations. Amazon blocked automated page access, so current sellers, availability, price, checkout and commission attribution are not verified.

Desktop questions now use 18px choices, 38px headings and a 960px content width. Desktop recommendation text is larger too. Browser zoom is a separate setting: the supplied screenshot showed Chrome's zoom-out indicator. Resetting Chrome zoom with Ctrl+0 restores 100%.

The selected positive quote appears before the Amazon action in document order. On desktop it sits below a smaller product photo alongside benefits; on mobile it sits immediately above the Amazon button. Source, product/variant limits and the individual-results notice remain visible. The source modal retains the full context. Redundant completion text and repeated badges were removed from results. The matching explanation and ingredient details remain available below the Amazon button.

## Verification

- 79 JavaScript tests pass, including all 16 direct destinations and exact fixed tag checks.
- 15 Python checks pass; 25-page static validation passes.
- Prior 100 observed browser cases still agree with the current recommendation engine and shopping eligibility. Their original destination snapshot is preserved separately. This was not a new set of 100 live browser journeys.
- New browser check: outer-groin odor, no allergies, nothing tried. The first result is Vanicream Gentle Body Wash, 12 fl oz, linking to B07FKQGN7F.
- The full quote is above the fold at all nine tested portrait/tablet/desktop sizes. Quote text ends before the Amazon button begins at every size.
- The complete Amazon button is also above the fold at 360x800, 375x740, 390x844, 430x932, 768x1024, 1024x900, 1366x768 and 1440x1100. At the very narrow 320x740 size, the quote is visible but the button needs a small scroll. No hidden/truncated quote, sticky covering control or smaller text was used to force everything into that viewport.
- No horizontal overflow or broken images in these nine checks. These are CSS viewport checks, not physical-device certification or a guarantee for every possible content length/browser toolbar.
- Source/context dialog works and preserves the original comment, attribution, context, source URL and variant limitation.

Raw measurements: `quote-viewport-checks-2026-11-16.json`.
