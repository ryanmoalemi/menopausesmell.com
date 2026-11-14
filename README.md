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
- `data/product-quotes.json`: verified quotations, source permalinks and illustrative-photo disclosure.
- `ratings.py`, `data/reddit-ratings.json`: calculated editorial sentiment scores and per-thread assessment ledger.
- `data/site-settings.json`: domain, operator, contact and social profiles.
- `marketing/launch-copy.txt`: Pinterest and Reddit setup copy, welcome post and launch status.

## Current state

The production domain is `menopausewash.com`. The repository retains its historical name `menopausesmell.com`. `CNAME` and `public_base_url` match the production domain. This release enables public-mode metadata, indexable pages and the sitemap.

The owner confirmed Amazon Associates tracking ID `menopausewash-20` and domain registration on November 12, 2026. All 26 Amazon button placements use tagged US product searches. Exact listing variants remain unverified, so buttons say “Search Amazon.” OneLink readiness and actual commission attribution have not been tested. Historical short links are preserved without assigning them to guessed variants.

## Connect Amazon links

1. Owner-confirmed enrollment and domain registration are recorded in `data/amazon-commerce.json`. Keep promotional profiles registered as applicable.
2. For each exact product and variant, obtain its approved Special Link from the owner's account. Confirm formula, size, seller and quantity.
3. In `data/amazon-commerce.json`, paste that link into the corresponding product's `special_link`, then set its `exact_listing_verified` to true. The recorded owner confirmation enables tagged search URLs. Only set `exact_listing_verified` after checking the listing; the builder must not guess product matches.
4. Run the build and validation. Configured products change from “Search Amazon” to “View on Amazon.” Unverified products keep search fallbacks. The Associate statement, disclosure article and footer update together.

Do not commit Amazon passwords, session cookies, API credentials or payment information. No credentials are needed in this repository. There are no fixed prices or fabricated product tests. Yellow stars are explicitly labeled editorial Reddit sentiment scores, not Amazon ratings or verified-buyer averages.

## Public launch

Set `public_base_url`, `site_owner`, and `contact_email`; set CNAME to the confirmed host; then set `public_launch` to true and rebuild. The build checks that the domain settings match. Public mode enables indexable pages, canonical links and a 23-URL sitemap, with the 404 route excluded.

Verify commercial usage rights for manufacturer product photography or replace those images with authorized program assets before public publication. Existing photography notes explicitly say these rights have not yet been confirmed. Update that statement only after confirming rights. Keep the source credits.

The generated privacy notice describes static GitHub Pages hosting, Google Fonts, external links and a local checklist. Revisit it if the actual hosting, tracking or collection changes. Google Analytics now measures page views, scrolls and outbound clicks. The tag disables Google signals and ad personalization; form interaction and site-search measurement are disabled. Checklist answers are not collected. The site has no email capture, account system, symptom submissions or checkout.

## Validation

`validate.py` checks all 24 routes for a single H1, working internal routes and fragment targets, image files, nonempty alt text and relevant comparison/shopping paths. Production modes were also exercised with temporary fixture settings to confirm canonical/sitemap output and affiliate disclosure changes. Fixture links and identities are never committed to the real configuration.

The design's earlier browser pass covered desktop and narrow mobile layouts, navigation, filters, details and printable checklists. Public deployment is handled by GitHub Pages from the main branch. Live commission attribution and social account creation remain unverified.

## Editorial rules

Keep product families distinct from exact formulas. The eight-thread body-odor sample is a limited sample, not a universal “best on Reddit” ranking. URO capsules and gummies are different products. User comments are anecdotal, not clinical evidence. Never fabricate personal experiences, ratings, clinician review or endorsements. New or persistent vaginal symptoms should not be framed as a reason to buy a stronger wash.

## Sentiment scoring and photography

`ratings.py` calculates family-level sentiment from the fixed eight-thread body-odor corpus. Positive threads contribute 5, mixed 3 and negative 1, with two neutral 3-point observations to temper small samples. Display rounds to the nearest half star, ties up. The artificial neutral adjustment is disclosed and excluded from real thread counts. At least three assessed threads are required; unrated products display no numeric stars. Discussion frequency is reported separately.

The research page exposes each assessment and source URL. Never substitute generic persimmon experiences for Mirai, deodorant reviews for Lume wash, or capsule reviews for gummies. No AggregateRating structured data is emitted. Review the evidence ledger before changing classifications, and apply the same rules to every family.

The three circular photos are AI-created illustrations, not Reddit commenters or verified customers. Their caption appears beside each quote. Compositions intentionally differ: a casual kitchen selfie, a close sideways car selfie with sunglasses on the head, and a low-angle laughing sofa selfie with reading glasses. Maintain natural skin texture and lighting, and preserve the local disclosure. Exact sourced words remain in the quote ledger.

## November 12 reader journey update

The homepage speaks directly to readers and offers three routes by concern. `/body-odor/` explains why odor may change and the practical first steps. `/underarm-products/` explains deodorant versus antiperspirant before the existing comparisons. Intimate-odor pages distinguish surrounding skin from vaginal symptoms and lead to the relevant care or appointment page. Product detail pages state who might consider each format and the main purchase check. Product names and photos are clickable internally.

The final presentation pass is `journey.py`, called after the earlier reader-copy pass. `production.py` also applies its outbound-link rule after production privacy/disclosure replacements. Public external HTTP links are limited to Amazon affiliate links at the owner's request. Reddit usernames, quotations, discussion assessments and medical source names remain on site; source URLs remain in the research data and noninteractive quote citations. Do not reintroduce outgoing Reddit, manufacturer or other shopping links without changing that policy.

Reader-journey health references: Cleveland Clinic, Body Odor (https://my.clevelandclinic.org/health/diseases/17865-body-odor); NHS, Body odour (https://www.nhs.uk/symptoms/body-odour-bo/); NHS, Vaginitis (https://www.nhs.uk/conditions/vaginitis/); NHS, Vaginal discharge (https://www.nhs.uk/symptoms/vaginal-discharge/). Checked November 12, 2026. Existing exact product-label facts and Reddit rating values were retained.

## Copy voice

Speak directly to the reader. Do not use the domain or site name as a brand in editorial sentences, such as “Menopause Wash helps you.” Use direct phrasing such as “Understand why your body odor may be changing” and “Compare body washes.” The site identifier may remain in the masthead, metadata and copyright.

The homepage introduction is limited to a headline and one short subtitle, immediately followed by the three concern cards. Do not reintroduce an introductory paragraph, a button that merely jumps to these cards, or a trust line between the introduction and the cards.

## Concern-page flow

`concern_pages.py` renders the three homepage destinations with a short reader-language headline, a verified Reddit excerpt, photos near the top, a practical first step and product comparisons. `data/concern-stories.json` records the exact excerpts and source access limits. These concern quotes do not change product sentiment ratings. Avoid diagnostic questionnaires or long explanations before showing the reader a next step. Longer label precautions remain expandable. Public outbound website links remain Amazon-only.

Public quote cards and concern-page openings must not include Discussion notes or research-notes calls to action. Keep quote attribution concise and retain source records in data. Natural product photographs and provenance are recorded in data/product-photo-sources.json.

Reader quotations must include an adjacent circular portrait. Existing illustrative portraits are not the Reddit authors: keep that label visibly beside each quote. Keep each concern opening distinct and its product photography above the mobile fold. Shared markup lives in quote_visual.py.

Concern-page openings follow: question, relatable quote with portrait, a short answer and product introduction, then labeled product photographs. The answer must explain why those photos are there before the reader reaches them. Keep medical explanations separate from the quoted Reddit words.


Shopping guidance update, November 13, 2026: concern pages lead with a format-based starting choice; compact fact grids collect scent, ingredients, body area, tradeoff and feedback scope. Amazon buttons name the target and disclose searches. Probiotic pages show selected positive and mixed customer reviews with source context; raw provenance is in data/customer-review-research.json. Do not transfer capsule reviews to gummies, claim causal benefit from anecdotes, or calculate a star score from these selected reviews.


## Search service setup

`data/search-services.json` holds the public Google and Bing ownership verification tags and IndexNow key. Keep the published tags and key text file in place. Google Search Console uses the canonical HTTPS URL-prefix property; Bing uses the same site URL. Both use `/sitemap.xml`.

`scripts/submit_indexnow.py` checks the live key file and submits sitemap URLs whose content hash changed, plus removed URLs from its previous state. The GitHub Actions workflow runs after a successful Pages deployment and caches the last accepted hashes. A first run submits the full 23-URL sitemap. HTTP 200/202 confirms receipt, not indexing. Use `--dry-run` to inspect changes without sending them.
