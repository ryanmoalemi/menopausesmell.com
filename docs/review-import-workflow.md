# Product finder review refresh

Repository: `ryanmoalemi/menopausesmell.com`, branch `main`. Production: https://menopausewash.com/product-finder/. Hosting is GitHub Pages. Do not create another Site or alter DNS.

## Editorial contract

Body-care recommendations address the selected concern first. Laundry is supporting care after relevant skin products. Retain the allergy, damaged-skin, intimate-symptom and prior-product exclusions. Recommend up to five appropriate products without padding.

The owner requests a simple shopping experience: why the product fits, one short **selected positive experience** when available, and the Amazon button. Do not display critical/mixed reviews or a pros-and-cons section. Do not relabel a mixed review as positive, strip a qualification that changes its meaning, invent portraits, ratings or verified-purchase status, or imply the excerpts represent all feedback. The display explicitly identifies positive selection.

Keep mixed/negative experiences in the editorial corpus to assess products. If repeated, relevant, credible reports undermine a recommendation, investigate exact formula, present labels and primary evidence; lower or remove the product where justified. One anecdote or a search-selected sample cannot establish a failure rate. Record reasons and source URLs in the product data before changing eligibility. Never relax safety or allergen exclusions to force a result.

## Current coverage and gaps

Initial import (2026-11-15): 44 candidates researched, 27 source-checked excerpts retained across 11 product families. Ten positive excerpts across six families are eligible for the shopping display. Remaining records support editorial assessment only. Exact variants are frequently unspecified; family scope is visibly disclosed. There is no source-checked positive excerpt for every product.

Research all currently eligible catalog products, prioritizing missing coverage and recently mentioned concerns. Use Reddit, primary product labels and other publicly accessible sources for assessment. No TinyFish. Existing browser/search access may be reused but do not bypass access controls. Search pages may identify leads; do not publish a quote until its full source context has been read. Do not treat AI summaries as review text.

## Source verification and import

1. Pull the latest main into a clean checkout. Read `data/finder-products.json`, `data/finder-reviews.json`, `finder_reviews.py`, `finder_src/reviews.mjs` and this document. Preserve unrelated work.
2. Search recent and older discussions for the actual product, including positive, mixed and negative reports. Keep short literal excerpts, at most 55 words and 600 characters. Review the full paragraph/thread so an excerpt does not reverse the meaning or imply a benefit from another product.
3. Prefer a direct comment permalink; otherwise identify a thread excerpt honestly. Preserve author handle only if observed, and exact date only if verified. Never turn a relative page age into an invented exact date. Set `checkedAt` to the actual UTC date the source was read, not the scheduled date.
4. Confirm exact product versus product family. A same-brand face wash is not a body wash; an antiperspirant is not aluminum-free gel; Revaree Plus is not Original; pads differ in absorbency. Exclude ambiguous product type. Family feedback requires a visible, specific `productScopeNote`. Record original full text in `sourceText` and retrieval evidence in repository metadata.
5. Add only supported topic tags. Every tag has a short verbatim `tagEvidence` substring. Do not infer a reviewer's age, menopause status, allergy, diagnosis or failed treatments from subreddit membership. Keep combination routines and non-menopause contexts explicit. The client matches topics locally; shopper health answers must never be sent off site or added to analytics.
6. Reopen prior sources. For deleted/withdrawn or materially changed comments, set `status: withdrawn` or correct/reverify the record. If inaccessible, do not fake a fresh check; retain the older checked date. Client and build omit records older than 56 days without a successful recheck.
7. Prepare a batch JSON object with a `reviews` array matching existing records. Keep stable IDs. Run `python scripts/import_finder_reviews.py /tmp/review-batch.json` first. Inspect counts and changes, then repeat with `--write`. The importer is idempotent, validates the whole batch before writing, rejects unsupported sources, and updates the corpus atomically.
8. `public_corpus()` emits only verified positive excerpts and display fields. Full source text, internal negative/mixed reports and evidence fields are not included in the finder payload. Do not add AggregateRating schema or turn counts into efficacy claims.

## Amazon provider

Disabled. An affiliate tracking ID or logged-in account does not authorize importing customer-review text. Current official operating policies section 6(t) restrict review/rating reuse to authorized API arrangements; IP license 2(e) requires prior written approval for aggregation/analysis/repurposing. The examined Creators API customer-review model exposes count and star rating, not review bodies. Do not enable on the assumption that any API credential provides text. Obtain an actual authorized review-text feed and permission covering storage, display and personalized analysis first. API caching restrictions may require refresh much more often than weekly; do not write Amazon review text into this static repository.

References checked 2026-11-15:
- https://affiliate-program.amazon.com/help/operating/policies
- https://affiliate-program.amazon.com/creatorsapi/docs/en-us/get-started/using-sdk

Amazon buttons continue to use `tag=menopausewash-20`. Exact verified ASIN links stay direct; unverified exact destinations remain clearly labeled Amazon searches. Never mark a search result as a verified listing.

## Test, publish and verify

Run:
```
node --check finder_src/app.mjs
node --test tests/finder-engine.test.mjs tests/finder-reviews.test.mjs
python -m unittest discover -s tests -p 'test_finder*.py'
python production.py
python validate.py
git diff --check
```

Production build exports generated root routes. Commit both source and generated files. Confirm the clothes-only route puts cleansers before laundry, changing sensitivity changes appropriate review matching, mixed/negative excerpts never render, absent reviews do not block shopping, all shopping destinations retain the affiliate tag, and answer reset/privacy remain intact.

Use the connected GitHub writer to publish if shell git has no credentials. Create a Git tree from the tested local commit's changed files over the current main base tree. Compare the returned tree SHA to the tested local tree. Create a commit with the current main parent, then update main using `expected_sha` and `force:false`. If main moved, fetch, integrate, retest and rebuild the tree; never overwrite unrelated work. Preserve text/binary encodings. Verify GitHub Pages deployment and live `/product-finder/reviews.json` matches the new public corpus. Inspect the result on mobile and desktop after UI changes.

Report imported/updated/withdrawn counts, published status, and concrete blockers. This recurring task performs the import and publication, not merely a reminder. No fabricated success if research, access or deployment fails.
