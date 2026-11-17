# Amazon destinations and browser checks

November 17, 2026. Scope: the published site and its shared product finder.

## Result

Replaced 32 Amazon search links across 13 comparison and product pages. The 16 active finder products have direct product destinations. These cover 25 unique ASINs across the site. Every purchase URL uses `https://www.amazon.com/dp/ASIN?tag=menopausewash-20`, with no answer data in its parameters. There is no search fallback. A missing, malformed, unverified or inconsistent destination fails the production build.

Product identity and variant were cross-checked against published ASIN references and manufacturer information. Sources and scope are stored in `data/amazon-commerce.json`. Gummies and capsules, liquid washes and bars, and toner size remain distinct. The lookup does not verify current Amazon stock, sellers, offer validity or checkout. Amazon retrieval was blocked in the available environment. Reconfirm those on real devices before buying traffic at scale.

## Fixes

- Removed Amazon search fallbacks from the finder and comparison-page generator. Refreshed embedded comparison-page shopping blocks.
- Replaced the newer `AbortSignal.timeout` dependency with bounded requests using timers and optional `AbortController`. Missing reviews do not block shopping. Catalog failures show a retry button.
- Removed dependencies on `structuredClone`, `Array.at` and CSS `:has`. Included the older media-query listener API and `vh` fallbacks for dynamic viewport units.
- Kept input text at 16 px on phones to avoid focus zoom. Explicit selected-state classes are refreshed after product searches.
- Reworked the opening question for short phone and landscape windows. All six choices and Continue fit in every tested viewport. No inner scroll area or horizontal overflow was present.

## Tests actually run

| Check | Observed result |
| --- | --- |
| Node tests | 83 passed, including matching, exclusions, privacy, direct links, reviews and request failures |
| Python tests | 19 passed, including build checks and Amazon destination validation |
| Production validation | 25 pages passed internal links, anchors, headings and image checks |
| Static shopping links | 32 direct links across 13 pages; zero search links |
| Active finder catalog | All 16 products have verified direct-link records |
| Opening layout in cloud Chrome | 18 viewport sizes passed |
| Complete UI journeys | 10, including eight normal journeys, one with older APIs absent and one without reviews |
| Exact product exclusions | Selected wash stays excluded after filtering the search and producing results |
| More-options button | Scrolls to the second product; optional extras begin expanded |
| Dialog | Answer editor opens and closes, including with older APIs absent |
| Catalog failure | Error is displayed, Retry restores the questionnaire |

Viewport sizes: 320×568, 320×740, 360×560, 360×800, 375×600, 375×740, 390×600, 390×844, 430×700, 430×932, 740×390, 768×1024, 1024×600, 1024×900, 1093×614, 1366×768, 1440×1100 and 1920×1080. The first pass found clipped choices in short windows; the saved before/after measurements show the fix.

Journeys covered urine leaks, underarm odor, combined smell and wetness, clothing odor, reactive outer-groin skin, daytime vaginal dryness, sexual friction and damp folds. No horizontal overflow or broken product images was observed. The simulated failures run only in local preview fixtures and are not shipped to visitors.

These are not 100 manual user walkthroughs, and screen-size testing does not constitute real device or browser-engine testing. The automated suites cover additional answer combinations.

## Requested real-browser matrix still pending

Only cloud Chrome was available. No real iPhone, Android phone, WebKit, Gecko, social-app WebView or connected device-testing service was available. User-agent spoofing was not counted as a browser test.

| Requested environment | Coverage and remaining work |
| --- | --- |
| Instagram, Facebook, TikTok, X internal browsers | Not run in the actual apps. Test each on both operating systems, including opening Amazon and returning to results. |
| Five recent iOS major releases | Target 27, 26, 18, 17 and 16; actual-device execution pending. |
| Five recent Android major releases | Target 17, 16, 15, 14 and 13; actual-device execution pending. WebView version must also be recorded. |
| Desktop Chrome | Actual cloud browser tested at multiple widths and heights. |
| Desktop Safari, Edge, Firefox, Opera | Actual browser execution pending. Compatibility changes reduce known dependencies but do not prove these engines work. |

For every pending combination, complete a normal match, a multi-concern match and an exact-product exclusion. Check selection visibility, Back, Edit answers, dialogs, keyboard focus and scrolling. Test the Amazon handoff, return from Amazon, expanded extras, orientation changes and reduced height from app toolbars. Repeat one slow-network and failed-request case. Record app, OS, browser/WebView versions and screenshots. A clean Chrome result is not a sign-off for the other combinations.

Technical references: [AbortSignal.timeout compatibility](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static), [Safari 15.4 features](https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/), [Apple security release list](https://support.apple.com/en-us/100100), [Android 17 release information](https://developer.android.com/blog/topics/android-17).

Raw evidence: `browser-checks-2026-11-17.json` and `amazon-links-2026-11-17.json` in this folder. Product source references are in the commerce ledger. Live deployment verification is recorded separately after publication.

## Published verification

Published application commit `887c42d79c93046b74e1ada61254914ab305b8b5`; GitHub Pages run `44058943137` completed successfully. Revisited all 13 live shopping pages and inspected all 32 Amazon anchors: every link is a direct ASIN URL with the correct affiliate tag. Completed a live urine-leak finder journey with five direct product links, expanded extras and the more-options button. No site-origin console warnings or errors were captured during that live journey. This checks our outgoing destinations, not Amazon stock or checkout.

Evidence: `live-links-2026-11-17.json`, `live-links-2026-11-17.jpg`, and `short-phone-2026-11-17.jpg`. The phone screenshot is the locally tested 320×568 viewport; the desktop screenshot is the deployed site.
