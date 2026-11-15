# Product finder research and personalized copy update

Reviewed 2026-11-15. This is an internal implementation record, not shopper-facing discussion notes.

## What changed

The former care branch replaced combined needs with underwear and a cloth. The revised matcher evaluates each selected need separately. New vaginal symptoms still rule out recommending internal products as a self-treatment, but no longer erase the independent need for bladder-leak protection. Results show up to five eligible products in a numbered vertical list, never a hidden Other options panel.

The catalog now has 15 eligible recommendation candidates, adding a water-rinse bottle, absorbent underwear, a plain external barrier, two distinct vaginal moisturizers, and a silicone lubricant. Added questions distinguish everyday vaginal dryness, friction during sex, and chafing on unbroken outside skin. Category history covers those jobs without requiring brand recall.

The result introduction recalls all selected concerns. Individual product reasons connect a verified product feature to the relevant concern, area, sensitivity preference and unsuccessful product category. They do not assume that selecting a category means that every brand or formula in that category failed. Known ingredient restrictions apply to every recommendation and fallback. Unknown allergies receive label-review copy, not an allergy-safe promise.

## Social research and what it supports

This was qualitative research into needs, vocabulary, tradeoffs and products to investigate. It was not a representative survey or a sentiment-rating exercise. Thread mentions are not evidence that a product will work for a particular reader.

| Sources inspected | Useful observations | Implementation |
| --- | --- | --- |
| [r/Menopause pads discussion](https://www.reddit.com/r/Menopause/comments/17hvs7s/), [urgency and leaks](https://www.reddit.com/r/Menopause/comments/1cmthij/), [accident discussion](https://www.reddit.com/r/Menopause/comments/1dieinh/), [urine smell](https://www.reddit.com/r/Menopause/comments/1vii98h/bad_urine_smell/) | People distinguish light liners, bladder pads, heavier leaks, odor on underwear, and persistent symptoms despite washing. Poise and other bladder-specific options appear. | Separate leak management from washing; provide a pad and absorbent-underwear choice. Prefer underwear when pads have not helped. |
| [Perimenopause water-rinse discussion](https://www.reddit.com/r/Perimenopause/comments/1pylv4a/i_have_figured_it_out_now_i_need_help_please/), [vulvar discomfort discussion](https://www.reddit.com/r/Perimenopause/comments/1q9yeec/vulvar_itching_hell_from_gsm_genitourinary/) | Water rinsing, comfortable underwear and external skin care recur alongside calls for medical evaluation. | Add a plain-water peri bottle, distinct from a douche. Add plain petrolatum only for appropriate intact outside-skin needs. |
| [Dryness and burning](https://www.reddit.com/r/Menopause/comments/1xoyzdf/vaginal_dryness_and_burning_anything_besides/), [hormone-free moisturizer discussion](https://www.reddit.com/r/HormoneFreeMenopause/comments/1kr0c0g/), [Revaree experiences](https://www.reddit.com/r/Menopause/comments/157w9zu/), [moisturizer residue](https://www.reddit.com/r/Perimenopause/comments/1l2rcd0/) | Revaree and Replens are discussed, with both benefit reports and residue, burning, discharge or compatibility concerns. Daily moisture and lubrication during sex are different needs. | Ask about dryness and friction separately. Show inserts, gel or lubricant only for the selected job. Keep residue and condom caveats specific to the exact formula. |
| [Lubricant discussion](https://www.reddit.com/r/Menopause/comments/1hdmuze/), [Uberlube experiences](https://www.reddit.com/r/Menopause/comments/1fjz9dv/) | Silicone lubricant appears as an intimacy/friction option, not a general odor wash. | Add Überlube for friction during sex, not to fill odor results. |
| [Disposable-underwear tradeoffs](https://www.reddit.com/r/Perimenopause/comments/1q7pcbr/im_wearing_a_diaper/), [changing and cost](https://www.reddit.com/r/OveractiveBladder/comments/1s8dmjk/question_about_using_incontinence_underwear/) | Fit, bulk, cost and changing frequency matter. | Describe absorbent underwear as an alternative format, with size and disposable/bulk tradeoffs. |
| [Probiotic anecdotes](https://www.reddit.com/r/Menopause/comments/1m865by/), [odor discussion](https://www.reddit.com/r/Menopause/comments/1jkbfyn/) | Probiotics and boric acid are mentioned alongside many different causes and regimens. | Do not automatically turn new discharge, pain or bleeding into a supplement or boric-acid recommendation. The existing optional supplement record is not used to pad results. |

Other social coverage: the indexed description of [Dr. Sam Ellis's intimate aging skin-care video](https://www.youtube.com/watch?v=RrYedjFuEY4) distinguishes moisturizers and lubricants and names Revaree, Replens and Überlube. Its product links are affiliate-marked. The full video was not watched or transcribed. Indexed [TikTok Shop Revaree reviews](https://shop.tiktok.com/us/pdp/1731393512858620329) include benefit and residue reports, but are commercial product-page reviews. Indexed X results were largely [RepHresh brand promotion](https://mobile.x.com/RepHreshBrand/with_replies), not independent consumer evidence; direct X access was unavailable. Instagram searches did not yield enough relevant accessible material. Do not describe this work as a comprehensive review of X, Instagram or TikTok conversations.

## Clinical boundaries used in matching

- [NHS vaginal dryness](https://www.nhs.uk/symptoms/vaginal-dryness/) and [NICE menopause recommendations](https://www.nice.org.uk/guidance/ng23/chapter/recommendations): moisturizers for dryness, lubricants for sexual friction, and clinician treatment options when needed.
- [AUA/SUFU/AUGS 2025 GSM guideline](https://www.auanet.org/documents/Guidelines/PDF/2025%20Guidelines/GSM%20Unabridged%202025.pdf): nonhormonal moisturizers and lubricants are options, not proof that every brand has equivalent benefit.
- [NHS vaginal discharge](https://www.nhs.uk/symptoms/vaginal-discharge/) and [vaginitis](https://www.nhs.uk/conditions/vaginitis/): new odor/discharge or other symptoms need cause-specific evaluation. External comfort products do not treat the cause.
- [University of Iowa vulvar skin care](https://uihc.org/educational-resources/vulvar-skin-care-guidelines) and [contact dermatitis care](https://uihc.org/health-topics/contact-dermatitis-vulva): minimize irritants, distinguish outside skin from internal use, and consider plain external barriers for appropriate needs.
- [CDC BV guidance](https://www.cdc.gov/std/treatment-guidelines/BV.htm): consumer probiotic anecdotes do not establish a substitute for diagnosing/treating BV; boric acid is not an indiscriminate odor recommendation.

## New products and verification

| Exact product | Selected job | Primary label and identification sources |
| --- | --- | --- |
| Frida Mom Upside Down Peri Bottle, pink 10 oz | External plain-water cleanup | [Manufacturer](https://frida.com/products/upside-down-peri-bottle), [manufacturer directions](https://fridaaustralia.com.au/products/frida-mom-peri-bottle), [retailer materials](https://www.target.com/p/-/A-76199073) |
| Depend Silhouette Maximum Absorbency underwear, size chosen by shopper | Leak protection, alternative to pads | [Manufacturer](https://www.depend.com/en-us/incontinence-products/women/silhouette-classic-underwear), [materials and exact variant](https://www.target.com/p/depend-silhouette-women-s-medium-postpartum-incontinence-disposable-underwear/-/A-94947535) |
| Vaseline Original Healing Jelly, white petrolatum 100% | Intact external skin exposed to moisture or rubbing | [Manufacturer](https://www.vaseline.com/us/en/p/vaseline-healing-jelly-original.html/00305212352009) |
| Bonafide Revaree Original, 5 mg hyaluronic acid, 10 inserts | Everyday vaginal dryness | [Manufacturer](https://hellobonafide.com/products/revaree). Original is distinct from Plus, which contains almond oil. Original is not condom-compatible. |
| Replens Long-Lasting Vaginal Moisturizer, 8 single-use prefilled applicators | Everyday dryness, gel format | [Manufacturer](https://www.replens.com/en/products/replens-long-lasting-moisturizer), [US disposable-applicator leaflet](https://www.replens.com/pdf/Replens-Long-Lasting-Vaginal-Moisturizer-with-Disposable-Applicator.pdf), [8-pack ingredients](https://www.target.com/p/-/A-14790490). Do not substitute the reusable-tube formula or External Comfort Gel. |
| Überlube, unscented 55 ml silicone lubricant | Friction during sex | [Instructions](https://uberlube.com/pages/instructions-for-use), [medical product information](https://uberlube.com/pages/medical), [product](https://uberlube.com/products/uberlube-glass-bottle). Not compatible with polyurethane condoms. |

Real product photographs were checked against packaging and source records. Source URLs and image hashes are recorded in the catalog/settings. This is product identification, not a certification of image licensing.

Amazon rejected the cloud browser session with an unsupported-session/client message. New exact Amazon listings and sellers could not be verified. All six new destinations therefore remain clearly disclosed fixed-product searches using menopausewash-20. No guessed ASINs, prices, star ratings or seller claims were added. Existing verified direct links are retained.

## Expected journeys

- Outside sweat + urine leaks + intimate symptoms: Poise light pads, Frida rinse bottle, Depend absorbent underwear, Hanes briefs and Utopia cloths. New symptoms receive a concise care note; no internal treatment is recommended for an undiagnosed change.
- Pads have not helped: Depend comes before Poise. An alternative pad is labeled as a light pad, not another underwear option.
- Daytime dryness + friction during sex, no new symptoms: Revaree, Überlube and Replens, with separate reasons for regular moisture versus lubrication. No underwear or wash is added merely to reach five.
- Chafing on intact outside skin: plain external barrier. New rash, broken skin or acute intimate symptoms prevent this route from suggesting active topical or internal treatments.
- Body odor returns after washing: headline and soap/wash reasons address recurring body odor. Selecting dampness alone does not invent recurring odor in the copy.
- A known ingredient exclusion or exact failed product remains excluded in all fallback and alternative recommendations.

## Validation

Automated engine coverage includes the reported mixed-concern case; all 63 nonempty combinations of six intimate concerns crossed with no allergy plus eight allergy choices; ingredient exclusions; prior-product exclusion; reset; copy/concern consistency; and distinct condom warnings. Build checks also cover routes, affiliate URLs and asset generation. Responsive visual checks and live deployment verification are recorded in the accompanying review log.
