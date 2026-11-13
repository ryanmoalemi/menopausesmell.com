"""Three visual concern pages: recognition, a practical first step, then options."""
from pathlib import Path
import html
import json
import re
from quote_visual import visual_quote

ROOT = Path(__file__).parent
STORIES = json.loads((ROOT / 'data/concern-stories.json').read_text())['stories']
E = html.escape


def hero(key, photos):
    q = STORIES[key]
    tiles = ''.join(
        f'<a class="concern-photo {fit}" href="{href}"><img src="/assets/{image}" alt="{E(alt)}" width="420" height="420" fetchpriority="high"><span>{E(label)}</span></a>'
        for image, alt, label, href, fit in photos
    )
    return f'''<header class="concern-hero concern-{key}"><div class="concern-copy"><h1>{q['heading']}</h1>{visual_quote(q['quote'], E(q['community']), q['photo'], class_name='concern-voice', cite=q['url'])}</div><div class="concern-photos">{tiles}</div></header>'''


def first_step(title, text, source='body-odor'):
    return f'<section class="first-step"><div><span class="eyebrow">A simple place to start</span><h2>{title}</h2></div><p>{text} <a class="care-source" href="/sources/#{source}">Care sources</a>.</p></section>'


def affiliate_note():
    return '<p class="disclosure concern-disclosure">As an Amazon Associate I earn from qualifying purchases. <a href="/affiliate-disclosure/">About our links</a>.</p>'


def compact_rating(pid):
    from ratings import rating
    # The stars already link to the calculation. Keep the sample and scope visible.
    return re.sub(r'<a class="rating-method"[^>]*>.*?</a>', '', rating(pid))


def wash_card(pid, fit, check):
    from commerce import PRODUCT_MAP, product_quote, amazon
    p = PRODUCT_MAP[pid]
    name = p.get('display_name', p['name'])
    return f'''<article class="solution-card" id="product-{pid}" data-product="{pid}" data-category="{p['category']}"><div class="solution-product"><a href="/washes/{pid}/"><img src="/assets/{p['image']}" alt="{E(p['name'])}" width="140" height="170" loading="lazy"></a><div><span class="eyebrow">{E(fit)}</span><h3><a href="/washes/{pid}/">{E(name)}</a></h3><p>{E(check)}</p></div></div>{compact_rating(pid)}{product_quote(pid)}<div class="solution-actions">{amazon(pid, 'concern_comparison')}<a href="/washes/{pid}/">Ingredients &amp; details</a></div></article>'''


WASH_FITS = {
    'mirai-unscented-bar': ('Prefer a soap bar?', 'Persimmon soap with no added fragrance listed. Can still dry or irritate some skin.'),
    'lume-unscented-wash': ('Prefer an unscented liquid?', 'An acidified rinse-off body wash. This is the wash, not Lume deodorant.'),
    'mirai-persimmon-body-wash': ('Prefer a persimmon liquid?', 'A liquid body wash with persimmon extract and aromatic botanicals.'),
}


def wash_cards(ids, three=False):
    return '<div class="solution-grid'+(' three' if three else '')+'">'+''.join(wash_card(pid, *WASH_FITS[pid]) for pid in ids)+'</div>'


def underarms(old_content):
    from commerce import amazon
    # Preserve the existing exact product IDs and full label precautions.
    rows = re.findall(r'<section class="research-row".*?</section>', old_content, re.S)
    precautions = {}
    for row in rows:
        ident = re.search(r'id="([^"]+)"', row)
        details = re.search(r'<details class="label-details">.*?</details>', row, re.S)
        if ident and details:
            precautions[ident.group(1)] = details.group(0)
    others = ''
    entries = [
        ('ordinary-glycolic-7', 'ordinary-glycolic.png', 'The Ordinary Glycolic Acid 7% Toner', 'An exfoliating toner, not a body wash. Reddit users discuss it for underarms, but that use is not established by the label reviewed. It can irritate skin and increase sun sensitivity.'),
        ('panoxyl-10-bar', 'panoxyl-10-bar.webp', 'PanOxyl 10% Acne Treatment Bar', 'A benzoyl-peroxide acne medicine, not an ordinary soap. The label does not give underarm-odor directions; it can irritate skin and bleach fabric. The 4% wash is a different product.'),
    ]
    for pid, photo, name, text in entries:
        others += f'''<article class="other-option" id="{pid}"><div class="other-product"><img src="/assets/{photo}" alt="{E(name)}" width="110" height="130" loading="lazy"><div><h3>{name}</h3><p>{text}</p></div></div>{compact_rating(pid)}{precautions.get(pid, '')}{amazon(pid, 'underarm_other_options')}</article>'''
    return '<div class="wrap concern-page">'+hero('underarms', [
        ('mirai-unscented-soap.webp','Mirai persimmon soap held in wet hands','Persimmon soap','#product-mirai-unscented-bar',''),
        ('lume-in-use.webp','Lume unscented body wash held over foamy bathwater','Unscented body wash','#product-lume-unscented-wash','lifestyle'),
    ])+first_step('Keep the routine simple.', 'Gently wash, dry your underarms well, and use an antiperspirant if you also need sweat control. A wash cleans skin; antiperspirant reduces sweating.')+f'''
    <section class="solution-section" id="wash-options"><div class="solution-heading"><h2>Two washes women talk about</h2><p>For the washing part of your routine. Neither stops sweating.</p></div>{affiliate_note()}{wash_cards(['mirai-unscented-bar','lume-unscented-wash'])}</section>
    <details class="other-discussed"><summary><span class="summary-photos"><img src="/assets/ordinary-glycolic.png" alt="The Ordinary Glycolic Acid Toner" width="44" height="50"><img src="/assets/panoxyl-10-bar.webp" alt="PanOxyl Acne Treatment Bar" width="44" height="50"></span><span>What about glycolic acid and PanOxyl?<small>Two other products you may have seen recommended.</small></span></summary><p class="other-intro">These have different uses and stronger precautions. Ask a pharmacist or dermatologist before adapting them for underarm odor.</p><div class="solution-grid">{others}</div></details>
    <section class="help-next"><h2>Still struggling with it?</h2><p>If odor persists despite basic care, changes suddenly, or sweating increases a lot, a clinician can help with the cause and stronger treatment options.</p><a href="/appointment-checklist/">Take a short checklist to your appointment</a></section>
    <p class="concern-footnote">Reddit experiences are personal reports, not proof a product will work for you. Use products on their labeled body areas and stop if they irritate. <a href="/reddit-recommendations/#ratings">How the stars work</a>.</p></div>'''


def body_washes():
    return '<div class="wrap concern-page">'+hero('body', [
        ('mirai-at-sink.webp','Hands dispensing Mirai body wash at a bathroom sink','Liquid body wash','#product-mirai-persimmon-body-wash',''),
        ('mirai-unscented-soap.webp','Mirai persimmon soap held in wet hands','Persimmon soap bar','#product-mirai-unscented-bar',''),
    ])+first_step('Keep skin folds clean and dry.', 'Pat dry rather than scrub, and change out of damp bras or clothing. If there is a rash, soreness or broken skin, get it checked before trying a stronger wash.', 'skin-fold-care')+f'''
    <section class="solution-section" id="wash-options"><div class="solution-heading"><h2>Compare body washes</h2><p>Persimmon soap or an acidified wash? Here are the differences and the Reddit experiences.</p></div><p class="body-area-note">For body skin. For the vulva or vaginal odor, use the <a href="/odor-and-menopause/">intimate-care guide</a>.</p>{affiliate_note()}
    <div class="filters" role="group" aria-label="Filter wash comparison"><button class="filter" data-filter="all" aria-pressed="true">All washes</button><button class="filter" data-filter="liquid" aria-pressed="false">Liquid washes</button><button class="filter" data-filter="bar" aria-pressed="false">Soap bars</button></div><p class="filter-status" id="filter-status" aria-live="polite">3 products shown</p>{wash_cards(['mirai-persimmon-body-wash','lume-unscented-wash','mirai-unscented-bar'], True)}</section>
    <section class="gentler-options"><div><span class="eyebrow">Avoiding fragrance?</span><h2>Two more labels to compare</h2><p>Vanicream and Dove Ultra Sensitive are general body washes. They are included for their fragrance-free labels, not as Reddit-ranked odor fixes.</p></div><div class="gentler-links"><a href="/washes/vanicream-gentle-body-wash/"><img src="/assets/vanicream.webp" alt="Vanicream Gentle Body Wash" width="75" height="105" loading="lazy"><span>Vanicream Gentle Body Wash</span></a><a href="/washes/dove-ultra-sensitive/"><img src="/assets/dove.webp" alt="Dove Ultra Sensitive body wash" width="75" height="105" loading="lazy"><span>Dove Ultra Sensitive</span></a></div></section>
    <p class="concern-footnote">A wash can help clean the skin; it cannot treat every cause of odor or a skin-fold rash. Reddit sentiment is not a clinical rating. <a href="/reddit-recommendations/#ratings">How the stars work</a>.</p></div>'''


def intimate():
    from commerce import amazon
    return '<div class="wrap concern-page">'+hero('intimate', [
        ('love-cleanser-lifestyle.webp','Love Wellness cleanser beside a towel, brand photo showing earlier packaging','Optional external cleanser','#cleanser-option','lifestyle love-lifestyle'),
    ])+first_step('Start with gentle outside care.', 'Rinse the outside skin with water, pat dry, and avoid scented washes or deodorants there. Never wash inside the vagina. You do not need to buy a special wash.', 'intimate-care')+f'''
    <section class="intimate-help" id="outside-care"><div><span class="eyebrow">If the change is new or persistent</span><h2>You can ask for help without knowing the cause.</h2></div><p>Book a medical visit for a strong or persistent change, unusual discharge, itching, burning or pain. Any vaginal bleeding after menopause needs evaluation. <a href="/when-to-get-checked/">When to get checked</a>.</p></section>
    <section class="external-cleanser" id="cleanser-option"><div class="external-cleanser-photo lifestyle"><img src="/assets/love-cleanser-lifestyle.webp" alt="Love Wellness cleanser beside a towel, earlier packaging" width="360" height="400" loading="lazy"></div><div><span class="eyebrow">If you prefer a cleanser</span><h2>Love Wellness pH Balanced Cleanser</h2><p>A fragrance-free wash labeled for the vulva, the genital skin on the outside.</p><p><strong>Optional:</strong> water may be enough. This is a label comparison, not a Reddit-ranked favorite or a treatment for vaginal odor.</p><p class="note-small">Use externally according to the label. Stop if it irritates. Photo shows earlier packaging; check the current label on Amazon.</p>{affiliate_note()}<div class="solution-actions">{amazon('love-wellness-ph-balanced-cleanser','intimate_care')}<a href="/washes/love-wellness-ph-balanced-cleanser/">Ingredients &amp; details</a></div></div></section>
    <details class="care-explainer"><summary>Why can scent change during menopause?</summary><p>Hormone changes can affect vaginal tissues, while sweat affects surrounding skin. Dryness, irritation or changes in discharge can have several causes. A clinician can work out what needs care; you do not have to diagnose it from the smell.</p><p><a href="/sources/#intimate-care">Care sources</a> · <a href="/appointment-checklist/">Appointment checklist</a></p></details>
    <a class="supplement-next" href="/probiotics/uro-capsules/"><img src="/assets/uro-capsules.webp" alt="URO oral probiotic capsules" width="65" height="90" loading="lazy"><span><strong>Wondering about URO instead?</strong><span>Read the capsule comparison and what the evidence can tell you before buying.</span></span><span aria-hidden="true">↗</span></a>
    <p class="concern-footnote">Care guidance and product comparisons are general information and have not been reviewed by a clinician. <a href="/gentle-care/">More about gentle vulva care</a>.</p></div>'''


def story_notes():
    rows = ''
    for key, q in STORIES.items():
        rows += f'''<article class="reader-story-note" id="reader-{key}"><h3>{E(q['thread'])}</h3>{visual_quote(q['quote'], E(q['community']), q['photo'], cite=q['url'])}<p>{q['community']} · {q['date']} · {q['kind']}.</p><p>{E(q['context'])}</p></article>'''
    return f'<section class="reader-story-notes"><h2>Where the opening words come from</h2><p>These excerpts describe the concerns behind the three homepage paths. They are separate from our product-rating sample and are not product endorsements.</p>{rows}<p class="note-small">Checked November 13, 2026 through indexed Reddit text. Direct thread retrieval was unavailable. Full source references are retained in our research records.</p></section>'
