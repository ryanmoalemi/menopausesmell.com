# Compact opening and results layout, November 16, 2026

The first question no longer has an internal scroll container or fixed-height cap. Desktop presents six full-size choices in two columns, beside a smaller illustration. The intro, progress indicator and navigation remain visible. Normal page scrolling is still available when accessibility zoom or an unusually short viewport requires it; options are never clipped.

Results now lead directly from the matching badge and a smaller heading to the first product. The repeated description and generic starting instruction are removed from ordinary results. Clinical care notes and the descriptive context for care routes remain. Product-specific matching reasons, previous-product context, benefits, quotes and warnings remain in the product card. The quote continues to precede the Amazon action.

The finder wordmark is a normal accessible link to `/`. The existing homepage wordmark was already a home link.

## Browser verification

- All six first-step options and Continue fit at 320x740, 375x740, 390x844, 768x1024, 1024x600, 1093x614 and 1366x768. No page overflow or internal question scrollbar in these checks.
- The 1093x614 case approximates the reduced CSS viewport of a typical laptop using increased browser zoom.
- Reproduced the reported Mirai result: body/skin folds, odor stays in clothes, no allergies, body wash previously tried. The first product begins at y=172 on desktop, and its Amazon button ends at y=521–525. The quote ends at y=434. Both quote and button fit even at 1024x600.
- The same result starts at y=189 on 375x740 and y=197 on 390x844; the complete Amazon button and quote are visible in both.
- Clicked the finder logo and observed navigation to the actual home page. Returned through the homepage's Product finder link.
- No broken images or horizontal overflow in the checked result views.
- 79 JavaScript checks, 15 Python checks and 25-page static validation passed. No recommendation logic or Amazon destinations changed.

Raw measurements: `compact-layout-checks-2026-11-16.json`. These are CSS viewport checks, not physical-device certification for every possible content length.

## Published check

Release `0776c162b55f40165ff7836505f782578e38a4d6` deployed successfully. On the live site, all six opening options appeared in two columns without an internal scrollbar, and the logo navigated to `https://menopausewash.com/`. The reproduced Mirai result begins at y=164 in the live 1348px-wide desktop viewport; its quote ends at y=427 and Amazon button at y=517. Screenshots: `live-six-options-2026-11-16.jpg` and `live-compact-result-2026-11-16.jpg`.
