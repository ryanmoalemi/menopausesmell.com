# Menopause Wash

24-page static editorial and Amazon product-comparison site. The homepage introduces body odor before explaining deodorizing soaps. Source-linked Reddit excerpts support reader questions; original explanations distinguish body skin, underarms, external genital skin and vaginal symptoms.

## Run and edit

Requires Python 3.11 or later; no third-party packages or server required.

```sh
python production.py
python validate.py
python -m http.server 8000 --directory dist
```

`production.py` runs the existing content generator, adds deployment metadata and exports the site into `dist/` and the repository root. GitHub Pages can serve the committed root files. Do not edit generated HTML directly.

Sources:

- `build.py`: shared page layout and foundational guides.
- `commerce.py`: Amazon buttons, product cards and main comparison pages.
- `reader_copy.py`: final reader-focused copy and product wording.
- `make_extra_pages.py`: underarm and URO capsule guides.
- `assets/site.css`, `assets/site.js`: responsive styles and accessible menu/filter/checklist behavior.
- `data/commerce-products.json`, `data/products-research.json`: product labels and research.
- `data/social-shortlist.json`, `data/reddit-copy.json`: discussion counts and direct quotations.
- `data/amazon-commerce.json`: Amazon links and activation status.
- `data/site-settings.json`: domain, operator, contact and social profiles.
- `marketing/launch-copy.txt`: Pinterest and Reddit setup copy, welcome post and launch status.

## Current state

This branch is a complete working rebuild. It has not replaced the live main branch. The repository currently belongs to `menopausesmell.com`; its existing CNAME is preserved. The rebuild brand and intended canonical domain are `menopausewash.com`. Confirm the intended hosting/domain arrangement before merging the public launch configuration.

`public_launch` is false. Pages carry noindex directives and an empty sitemap until the domain and operator settings are complete. This prevents the staged copy from being presented as the finalized public site; it is not authentication or access control.

Amazon sign-in was blocked by the browser session on November 13, 2026. Product buttons therefore use explicitly labeled Amazon searches and do not earn a commission. Historical short links are preserved in the data ledger, including the original homepage link, but are not guessed onto exact product variants.

## Connect Amazon links

1. Use the owner's Amazon Associates account and verify enrollment. Add the final site and relevant promotional profiles to that account as required by the program.
2. For each exact product and variant, obtain its approved Special Link from the owner's account. Confirm formula, size, seller and quantity.
3. In `data/amazon-commerce.json`, paste that link into the corresponding product's `special_link`, then set its `exact_listing_verified` to true. Set `enrollment_verified` to true only after verification. The tracking ID is informational; the build never guesses it or constructs affiliate links from it.
4. Run the build and validation. Configured products change from “Search Amazon” to “View on Amazon.” Unverified products keep search fallbacks. The Associate statement, disclosure article and footer update together.

Do not commit Amazon passwords, session cookies, API credentials or payment information. No credentials are needed in this repository. There are no fixed prices, star ratings or fabricated product tests.

## Public launch

Set `public_base_url`, `site_owner`, and `contact_email`; set CNAME to the confirmed host; then set `public_launch` to true and rebuild. The build checks that the domain settings match. Public mode enables indexable pages, canonical links and a 23-URL sitemap, with the 404 route excluded.

Verify commercial usage rights for manufacturer product photography or replace those images with authorized program assets before public publication. Existing photography notes explicitly say these rights have not yet been confirmed. Update that statement only after confirming rights. Keep the source credits.

The generated privacy notice describes static GitHub Pages hosting, Google Fonts, external links and a local checklist. Revisit it if the actual hosting, tracking or collection changes. The site has no analytics, pixels, email capture, account system, symptom submissions or checkout.

## Validation

`validate.py` checks all 24 routes for a single H1, working internal routes and fragment targets, image files, nonempty alt text and relevant comparison/shopping paths. Production modes were also exercised with temporary fixture settings to confirm canonical/sitemap output and affiliate disclosure changes. Fixture links and identities are never committed to the real configuration.

The design's earlier browser pass covered desktop and narrow mobile layouts, navigation, filters, details and printable checklists. No public domain deployment, live commission attribution or social account creation has been verified.

## Editorial rules

Keep product families distinct from exact formulas. The eight-thread body-odor sample is a limited sample, not a universal “best on Reddit” ranking. URO capsules and gummies are different products. User comments are anecdotal, not clinical evidence. Never fabricate personal experiences, ratings, clinician review or endorsements. New or persistent vaginal symptoms should not be framed as a reason to buy a stronger wash.
