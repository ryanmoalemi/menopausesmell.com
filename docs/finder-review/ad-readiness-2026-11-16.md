# Recommendation and paid-traffic fixes

The previous audit found a working finder with avoidable purchase friction and two misleading recommendation behaviors. This update gives the shopper a clear starting product, one explicit substitute and optional accessories. Independent selected needs remain visible together.

Implemented:

- Added two or three concise, label-grounded benefits to all 15 active products, with source and check date in the catalog. No menopause-specific efficacy guarantees or invented product testing.
- Excluded InterDry and Vaseline from the same shortlist. The InterDry card now states the manufacturer's no-creams/ointments/powders instruction before shopping.
- Unidentified allergies show product information for ingredient review, with no buying buttons or confirmed-match framing, including inside the details dialog.
- Exposed optional exact-product search after failed-category selection. Known failed formulas stay excluded. An unmatched product does not erase previously identified failures. Nothing yet resets exact failures.
- Label unverified Amazon destinations Find on Amazon; verified direct links say View on Amazon. The fixed menopausewash-20 tag remains on every shopping URL.
- Moved short care notes before the recommendations and labeled primary comfort accessories as optional.
- Collapsed accessories and retained distinct primary jobs, such as a moisturizer for regular dryness and lubricant for friction.
- Added generic funnel-count events in an isolated, opaque-origin sandbox. The Google tag cannot read the questionnaire DOM or storage. Only visit, start, numeric step, completion and shopping-click messages cross the boundary. No answers, product identities, URLs from clicks, raw referrers or campaign query strings are sent. Analytics and advertising storage consent are denied. GPC/DNT disable measurement. Preview builds do not load it.
- Retained the verified positive review excerpts and their scope disclosures. No new testimonial text was invented or imported without verification.

## Verification and release limitations

Automated checks cover matching, exclusions, independent needs, review selection, benefits, generic analytics message validation, sender validation and stripping of extra payload fields. The website validator checks all 25 generated routes. All 100 browser journeys completed: 22 at 390 × 844, 28 at 320 × 740 and 50 at 1440 × 1100 CSS pixels. No horizontal overflow, broken loaded images, missing benefits or untagged shopping links were observed. All nine unknown-allergy cases showed no shopping links. This is desktop Chrome rendering responsive viewports, not physical iOS/Android testing. Full observations are in 100-journey-retest.json. Extra manual checks covered the incompatible pair, exact failed-product search, preserving known exclusions when another product cannot be found, and no buying link inside an unknown-allergy details dialog. The extra wetness-only failed-antiperspirant check exposed an irrelevant fallback; it was fixed, regression-tested, and manually retested to show an honest no-match.

Exact Amazon destination verification remains incomplete: 2 direct listings and 13 explicitly labeled searches. Current price, stock, seller, checkout, commission attribution and Amazon purchasing were not verified in this session. Amazon had rejected the review browser, so no alternate access route was used.

The measurement code is implemented, but arrival and usefulness in the owner's GA4 reports have not been verified. Denied-consent signals may be used for modeling and are subject to Google's reporting limits. The code deliberately does not provide campaign attribution or health-based advertising audiences. Verify reporting and affiliate earnings before buying traffic; a shopping click is not a sale.

The finder has one implementation. Source and generated folders are not A/B variants. Ads should land directly on /product-finder/ to preserve the product-only experience; the editorial homepage still contains guides.

## Conversion assessment

8/10 for the revised shopper experience, as an editorial assessment, not a measured conversion rate. The clearest remaining improvements are verified exact-formula retailer destinations, more authentic product-and-concern-specific positive experiences, and verified campaign economics. Do not call the site 9/10 paid-traffic-ready until the shopping handoff and measurement are demonstrated.

The questionnaire's practical advantage is a fast, repeatable decision: correct body area, correct product job, known restrictions, exact failed-product exclusions, and a short explanation of why each choice belongs. AI can perform similar reasoning with sufficient context, and Amazon has broader inventory. The finder must earn its usefulness by doing those checks consistently and reducing the amount of comparison the visitor has to do.

## Sources

Product facts and benefit sources are recorded per product in data/finder-products.json. InterDry compatibility: https://www.coloplast.us/Global/US/Skin%20Care/Interdry/HealthTrust-TryInterDry/SC-M5105N-InterDry-Instructions-Poster.pdf

Google configuration and consent behavior: https://developers.google.com/analytics/devguides/collection/ga4/reference/config and https://developers.google.com/tag-platform/security/concepts/consent-mode
