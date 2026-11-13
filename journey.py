"""Reader journey: understand the concern, choose a path, compare, then shop."""
import html
import re

E = html.escape


def internalize_sources(content):
    """Retain named citations while keeping public outbound actions on Amazon."""
    def replace(match):
        attrs,url,label=match.groups()
        if re.match(r'https?://(?:www\.)?(?:amazon\.com|amzn\.to)(?:/|$)',html.unescape(url)):
            return match.group(0)
        if 'quote-source' in attrs:
            return '<a class="quote-source" href="/reddit-recommendations/">Read our discussion notes</a>'
        label=label.replace('Read the manufacturer label','Manufacturer label checked').replace('Official manufacturer page','Manufacturer source').replace('Read the official URO capsule label','Official URO capsule label reviewed')
        cls='quote-author' if 'quote-author' in attrs else 'reference-label'
        return f'<span class="{cls}">'+label.replace('↗','')+'</span>'
    content=re.sub(r'<a\b([^>]*?)href="(https?://[^"]+)"[^>]*>(.*?)</a>',replace,content,flags=re.S)
    return content.replace('<h2>Read the discussions</h2>','<h2>Discussions reviewed</h2>')


def routes_panel(panel_id='start'):
    items = [
        ('/underarm-products/', 'towels.webp', 'Folded towels for a daily washing routine', 'My underarms smell different', 'Start with sweat vs. odor, then compare underarm options.'),
        ('/external-washes/', 'mirai-body-wash.webp', 'Mirai liquid body wash packaging', 'It’s on my body or in skin folds', 'Compare rinse-off washes for odor on body skin.'),
        ('/odor-and-menopause/', 'routine.webp', 'Towels and a dispenser in a bathroom', 'It’s vaginal or intimate odor', 'Understand the difference before choosing a cleanser.'),
    ]
    rows = ''.join(f'<a class="journey-choice" href="{url}"><img src="/assets/{photo}" alt="{alt}" width="70" height="76"><span><strong>{title}</strong><small>{text}</small></span><span class="choice-arrow" aria-hidden="true">↗</span></a>' for url,photo,alt,title,text in items)
    unsure = '<p class="start-unsure">Not sure? <a href="/body-odor/">Read the basics first</a>.</p>' if panel_id=='start' else ''
    return f'<section class="start-panel" id="{panel_id}" aria-labelledby="{panel_id}-title"><span class="eyebrow">Start with what you notice</span><h2 id="{panel_id}-title">Where is the smell?</h2>{rows}{unsure}</section>'


def home():
    from commerce import grid,shortlist,disclosure,quote,button,a
    return f'''<div class="wrap"><section class="journey-hero"><div class="journey-intro"><span class="eyebrow">Your guide to menopause odor</span><h1>Smelling different<br>since menopause?</h1><p class="journey-dek">Menopause Wash helps you understand changes in body odor, learn what to try first, and compare washes and underarm products discussed on Reddit.</p><p class="journey-promise">Start with where you notice the smell. Find a next step that fits.</p><div class="actions">{button('#start','Find my starting point')}{a('/external-washes/','I’m ready to compare washes','text-link')}</div><p class="journey-trust">Independent guidance · Real Reddit quotes · Amazon product comparisons</p></div>{routes_panel()}</section><section class="understand-band"><div><span class="eyebrow">First, understand the change</span><h2>More washing isn’t always the answer.</h2><p>Hormone changes, hot flashes and night sweats can affect body odor. A change on sweaty skin and a change in vaginal odor can need different care.</p>{a('/body-odor/','Why odor can change and what to try first','text-link')}</div><div class="reader-voice">{quote('need')}<p>If this sounds familiar, the guides below help you work out where to start.</p></div></section><section class="section" id="shortlist"><div class="section-heading"><div><span class="eyebrow">Ready to look at washes?</span><h2>Compare options for body-skin odor</h2></div>{a('/external-washes/','See the wash comparison','text-link')}</div><p class="section-intro">Prefer a liquid or a bar? Avoiding scented ingredients? Start with those differences, then read the Reddit experiences and check the exact product.</p>{disclosure()}{grid(shortlist())}<p class="note-small">Stars summarize Reddit sentiment about product families. They are not clinical scores or a promise that a wash will work for you. {a('/reddit-recommendations/#ratings','How the ratings work')}.</p></section><section class="journey-bottom"><div><span class="eyebrow">A different question</span><h2>Wondering about probiotics?</h2><p>URO capsules and gummies are different formulas. See what is in each and what the evidence can actually tell you about odor.</p>{a('/probiotics/','Understand probiotics before buying','text-link')}</div><div><span class="eyebrow">When a product isn’t the next step</span><h2>A new vaginal smell or other symptoms?</h2><p>Unusual discharge, itching, burning or pain is a reason to get advice. Use the care guide to decide what to bring up at an appointment.</p>{a('/when-to-get-checked/','When to get checked','text-link')}</div></section></div>'''


def basics():
    return f'''<div class="wrap"><header class="article-head"><span class="eyebrow">Start here</span><h1>Why do I smell different during menopause?</h1><p class="dek">Understand what may be changing, try the practical basics, then choose the right product category for your concern.</p></header><div class="basics-layout"><article class="article-body"><section id="why"><h2>Yes, body odor can change.</h2><p>Hormone changes, hot flashes and night sweats can affect body odor. Sweat interacting with bacteria on the skin contributes to the smell. A change does not automatically mean you are washing badly.</p><p>Menopause is one possible factor. Medicines, other health conditions and changes in routine can also matter. <a href="/sources/#body-odor">Sources behind this explanation</a>.</p></section><h2>Start with a few practical checks</h2><ul class="basics-checks"><li><strong>Skin or clothing?</strong> Wash and dry sweaty areas, and change out of damp clothing. Check whether the smell is also lingering in a bra, shirt or underwear.</li><li><strong>Odor or heavy sweating?</strong> Deodorant targets odor. Antiperspirant reduces sweating. A body wash is a separate part of the routine.</li><li><strong>Is your current wash irritating?</strong> Avoid piling on stronger products. A pharmacist can help you compare gentler cleansers or antiperspirants. Follow each product’s label.</li></ul><p class="note-small">These basics draw on NHS body-odor guidance. <a href="/sources/#body-odor">See the sources</a>.</p><h2>Where does a deodorizing wash fit?</h2><p>“Deodorizing soap” means a cleanser marketed for body odor. Our comparison covers persimmon soaps and acidified body washes discussed on Reddit. They are rinse-off products for body skin; they do not stop sweating or explain the cause of a new vaginal odor.</p><div class="actions"><a class="btn" href="/external-washes/">Compare body washes</a><a href="/underarm-products/">Explore underarm options</a></div><h2>When to ask for help</h2><p>If body odor persists despite basic care, suddenly changes, or comes with much more sweating than usual, speak with a clinician. If the change seems vaginal, especially with unusual discharge, itching, burning or pain, start with the <a href="/odor-and-menopause/">vaginal-odor guide</a>.</p><div class="callout"><strong>You do not have to identify the cause yourself.</strong><p>Note where and when you notice the change, what else feels different, and what you have already tried. <a href="/appointment-checklist/">Use the appointment checklist</a>.</p></div></article><aside>{routes_panel('choose-area')}</aside></div></div>'''


def next_step(path):
    choices = {
        '/odor-and-menopause/': ('If you are considering a cleanser', 'Start with care for the outside skin, then compare a cleanser if you still want one.', '/gentle-care/', 'Read gentle vulva care'),
        '/gentle-care/': ('Want to compare an external cleanser?', 'See the label, ingredients and intended use of Love Wellness pH Balanced Cleanser.', '/washes/love-wellness-ph-balanced-cleanser/', 'See the cleanser comparison'),
        '/ingredient-labels/': ('Put the label checks to use', 'Compare liquid washes and a bar side by side, including fragrance and formula differences.', '/external-washes/', 'Compare body washes'),
        '/when-to-get-checked/': ('Prepare for the conversation', 'Bring the changes you noticed and a list of products you have already tried.', '/appointment-checklist/', 'Open the appointment checklist'),
        '/appointment-checklist/': ('Care while you arrange a visit', 'Keep outside-skin care simple. The gentle-care guide explains what to consider before buying a cleanser.', '/gentle-care/', 'Read gentle-care guidance'),
        '/probiotics/': ('Considering URO?', 'Compare the capsule and gummy ingredients before choosing a format.', '/gummies-vs-capsules/', 'Compare URO gummies and capsules'),
        '/gummies-vs-capsules/': ('Want a closer look at the capsule?', 'Read the label and the different experiences reported before checking Amazon.', '/probiotics/uro-capsules/', 'Read the URO capsule comparison'),
        '/probiotics/uro-capsules/': ('Still comparing the formats?', 'Check how the capsule differs from the gummy before choosing.', '/gummies-vs-capsules/', 'See gummies vs. capsules'),
        '/sources/': ('Ready to compare?', 'Read the product differences alongside Reddit quotes and our source notes.', '/external-washes/', 'Compare body washes'),
        '/our-method/': ('See the research in context', 'Compare washes with source-linked editorial scores and the actual words from the discussions.', '/external-washes/', 'Compare body washes'),
        '/reddit-recommendations/': ('Use the research to compare', 'See which format and ingredient profile fits what you are looking for.', '/external-washes/', 'Compare body washes'),
    }
    if path not in choices:return ''
    title,text,url,label=choices[path]
    return f'<div class="wrap"><section class="journey-next"><div><span class="eyebrow">Your next step</span><h2>{title}</h2><p>{text}</p></div><a class="btn" href="{url}">{label}</a></section></div>'


def refine(path,title,description,content):
    if path=='/':
        return 'Menopause smell: understand the change and compare products','Understand changes in menopause body odor, find your starting point, and compare washes and underarm products discussed on Reddit.',home()
    if path=='/body-odor/':
        return 'Why body odor changes during menopause and what to try','Learn what may affect body odor during menopause, practical first steps and when to compare products or get advice.',basics()
    # Replace repeated footer funnels with one relevant next step; avoid self-links.
    content=re.sub(r'<div class="wrap"><section class="(?:shop-strip|quiet-shop)">.*?</section></div>','',content,flags=re.S)
    if path=='/external-washes/':
        description='Compare persimmon soaps and acidified body washes by format, scent, Reddit experiences and intended use.'
        content=content.replace('Deodorizing washes are marketed for odor on body skin. Compare the persimmon and acidified washes discussed on Reddit by format, ingredients and reported drawbacks.','Looking for a wash for sweaty body skin? Compare a persimmon liquid, an unscented acidified wash and an unscented persimmon bar. Start with the format and ingredients you prefer.')
        content=re.sub(r'<div class="comparison-question">.*?</div>','<p class="comparison-orientation">New here? <a href="/body-odor/">Learn why odor can change</a>. Already know what you want? Choose liquid or bar below.</p>',content,count=1,flags=re.S)
        content=content.replace('Other cleansers: compare the intended use','Prefer a straightforward fragrance-free cleanser?')
        content=content.replace('These are additional label comparisons. The reviewed Reddit discussions do not establish these exact formulas as community favorites.','Vanicream and Dove Ultra Sensitive are general body washes to compare if fragrance-free labeling is your priority. They are included for their labels, not as proven Reddit favorites.')
        content=content.replace('<div class="link-card"><h3>Fragrance-free body washes</h3>','<div class="link-card"><img class="choice-product-photo" src="/assets/vanicream.webp" alt="Vanicream Gentle Body Wash packaging"><h3>Fragrance-free body washes</h3>')
        content=content.replace('<div class="link-card"><h3>A cleanser labeled for the vulva</h3>','<div class="link-card"><img class="choice-product-photo" src="/assets/love-cleanser.webp" alt="Love Wellness external cleanser packaging"><h3>A cleanser labeled for the vulva</h3>')
    if path.startswith('/washes/'):
        pid=path.strip('/').split('/')[-1]
        verdicts={
            'mirai-persimmon-body-wash':('You want persimmon in a liquid wash.','The formula includes aromatic botanicals. If you avoid those, compare the Unscented bar or a fragrance-free body wash.'),
            'lume-unscented-wash':('You prefer an unscented liquid over a soap bar.','Choose the wash, not Lume deodorant. Confirm the size and current ingredients on the listing.'),
            'mirai-unscented-bar':('You prefer a solid persimmon soap with no added fragrance listed.','The Unscented bar differs from the liquid and scented bars. It can still have a natural scent and may not suit every skin type.'),
        }
        if pid in verdicts:
            fit,watch=verdicts[pid]
            box=f'<div class="buyer-summary"><p><strong>Consider this if:</strong> {fit}</p><p><strong>Before you buy:</strong> {watch}</p></div>'
            content=re.sub(r'<div class="detail-facts">.*?</div>',box,content,count=1,flags=re.S)
        else:
            # Put the product image before the purchase action on the secondary cleanser pages.
            match=re.search(r'<figure class="article-figure">.*?</figure>',content,re.S)
            if match:
                fig=match.group(0).replace('class="article-figure"','class="article-figure compact-product-figure"')
                content=content.replace(match.group(0),'',1).replace('<article class="article-body">','<article class="article-body">'+fig,1)
            if pid=='love-wellness-ph-balanced-cleanser':
                content=content.replace('A body-wash label does not establish suitability for every body area.','This cleanser is labeled for the external vulva, not for internal washing or treatment of vaginal odor.')
    if path=='/underarm-products/':
        title='Underarm odor during menopause: what to try and compare'
        content=content.replace('The Ordinary and PanOxyl for underarm odor?','Underarms smell different? Start here.')
        content=content.replace('Reddit users discuss these products for underarm odor. One is an exfoliating toner; the other is an acne cleanser. Here is how their labeled uses differ from those routines.','Check whether the main problem is odor, heavy sweating or an irritating routine. Then compare the products people discuss, with their limits in view.')
        start='''<section class="underarm-basics" id="start-with-basics"><h2>Match the product to the problem</h2><div class="basics-pair"><div><h3>Mostly sweat?</h3><p>Check whether your usual product is an antiperspirant. Antiperspirants reduce sweating; deodorants target odor. Ask a pharmacist if your current option is not helping.</p></div><div><h3>Looking for a different wash?</h3><p>Start with a rinse-off body-wash comparison. The toner and acne cleanser below are different product types, with different label precautions.</p><a href="/external-washes/">Compare body washes</a></div></div><p class="note-small"><a href="/sources/#body-odor">Medical sources for the basics</a>.</p></section>'''
        content=content.replace('</header>','</header>'+start,1)
    if path=='/odor-and-menopause/':
        content=content.replace('<h2>Three useful next steps</h2>','<h2>Choose your next step</h2>')
        content=content.replace('<h2>Start by separating the questions</h2>','<div class="intimate-directions"><h2>Which sounds closer?</h2><p><strong>Sweat on the surrounding skin:</strong> start with <a href="/gentle-care/">gentle outside-skin care</a>.</p><p><strong>A change in vaginal odor or discharge:</strong> read <a href="/when-to-get-checked/">when to get checked</a> before trying to solve it with a wash.</p><p><strong>Not sure:</strong> note when it happens and any other symptoms. You can bring that to a clinician without knowing the cause.</p></div><h2>Outside skin and the vagina are different</h2>')
    if path=='/gentle-care/':
        content=content.replace('<h2>If you still want a cleanser</h2>','<h2 id="cleanser">If you still want a cleanser</h2>')
        content=content.replace('<div class="actions"><a class="btn secondary"','<div class="actions"><a class="btn secondary"')
    if path=='/probiotics/':
        # Answer the question before the quote and product links.
        answer=re.search(r'<div class="callout"><strong>The practical answer</strong>.*?</div>',content,re.S)
        if answer:
            content=content.replace(answer.group(0),'',1).replace('<article class="article-body">','<article class="article-body">'+answer.group(0),1)
        content=content.replace('The original research included URO capsule reviews. The gummies below are a separate formula; repHresh and Good Girl remain secondary label examples. None is ranked as the best menopause-odor treatment.','Start with the format and ingredients, not the biggest number on the bottle. <a href="/probiotics/uro-capsules/">URO capsules have their own comparison</a>; the gummies below use a different formula. These are label comparisons, not a ranking of odor treatments.')
        content=re.sub(r'(<h2>Ask what was measured</h2>.*?)(<h2>Questions before spending money</h2>)',r'<details class="label-details research-details"><summary>Read the studies and evidence limits</summary>\1</details>\2',content,count=1,flags=re.S)
    if path=='/gummies-vs-capsules/':
        content=content.replace('<h2>What is different?</h2>','<p class="quick-answer"><strong>The short answer:</strong> these are different formulas, not the same supplement in two formats. Neither was established here as a treatment for menopause-related odor.</p><h2>What is different?</h2>')
        content=content.replace('class="article-figure compact-product-figure"','class="article-figure compact-product-figure"')
    if path=='/reddit-recommendations/':
        content=content.replace('See which products came up in eight body-odor threads, what readers liked or disliked, and which exact versions were identified.','See how we scored the products, what people liked or disliked, and where the evidence is limited. All of the discussion summaries are here on this page.')
        content=content.replace('<div class="callout"><strong>How to read the counts</strong>','<div class="research-jumps"><a href="#ratings">How the stars work</a><a href="#rating-mirai">Mirai</a><a href="#rating-lume_cleansers">Lume</a><a href="#rating-ordinary">The Ordinary</a><a href="#rating-panoxyl">PanOxyl</a></div><div class="callout"><strong>How to read the counts</strong>')
    if path=='/sources/':
        content=content.replace('<h2>Product and community sources</h2>','<h2 id="body-odor">Body odor and sweating</h2><ul class="source-list"><li>Cleveland Clinic, <cite>Body Odor</cite>, medically reviewed March 4, 2022: sweat, skin bacteria, hormone changes, deodorants and antiperspirants.</li><li>NHS, <cite>Body odour (BO)</cite>, reviewed May 14, 2025: everyday care, pharmacist advice and when to seek assessment.</li><li>NHS, <cite>Vaginal discharge</cite>: changes in discharge and symptoms that need advice.</li></ul><p>These sources were checked for the reader-journey update on November 12, 2026. Product discussion scores use their separately disclosed Reddit sample.</p><h2 id="product-labels">Product and community sources</h2>')
    content=internalize_sources(content)
    content=content.replace('These links support the explanations on this site.', 'These sources support the explanations on this site.')
    content=content.replace('Each product page links to its manufacturer.', 'Product pages summarize the manufacturer labels we checked.')
    content=content.replace('Product pages link to the labels we checked.', 'Product pages explain the label details we checked.')
    content=content.replace('links to product discussions and explains how mentions were counted', 'summarizes product discussions and explains how mentions were counted')
    content+=next_step(path)
    return title,description,content
