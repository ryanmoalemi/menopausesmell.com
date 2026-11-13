"""Reader-facing copy. Research ledgers remain unchanged and retain full detail."""
import html
import re

PRODUCT_COPY = {
    'mirai-persimmon-body-wash': {
        'display_name': 'Mirai Persimmon Body Wash',
        'summary': 'A liquid body wash with persimmon fruit extract, marketed for body odor. This is the liquid Mirai product named in the earlier Reddit discussion.',
        'social_short': 'Mirai soaps and washes appear in 3 of the 8 body-odor threads we reviewed. The comments do not all name this liquid formula.',
        'label': 'The bottle reviewed is 9.3 fl oz (275 mL). Although some page graphics say fragrance-free, the ingredient list includes grapefruit peel oil and peppermint, lavandin, geranium and rosemary extracts. Check the full list if you avoid scented botanicals.',
        'tradeoff': 'Some people in the persimmon-soap discussions describe dryness or irritation. Those reports cover different products, so they do not tell us how this exact liquid formula will feel on your skin.',
        'check': 'Liquid wash; contains aromatic botanicals',
    },
    'lume-unscented-wash': {
        'display_name': 'Lume Unscented Body Wash',
        'summary': 'A rinse-off body wash with an acidic, low-pH formula. Lume calls this “acidified.” Its deodorant is a separate product.',
        'social_short': 'Lume cleansers appear in 6 of 8 reviewed threads. Three clearly mention the acidified liquid wash; the others describe different or unspecified formats.',
        'label': 'The product photo shows the Unscented wash in an 8.5 fl oz bottle. A separate 7 fl oz retailer ingredient list does not list fragrance. Because the sizes differ, check the ingredients and size on the exact bottle you buy.',
        'tradeoff': 'Reddit experiences are mixed, including reports of irritation or no improvement. Unscented is the version compared here, but comments about Lume often leave out the scent and size.',
        'check': 'Unscented body wash; confirm bottle size',
    },
    'mirai-unscented-bar': {
        'display_name': 'Mirai Unscented Persimmon Soap',
        'summary': 'A solid soap with persimmon fruit extract for readers who prefer a bar to a liquid body wash. The Unscented bar has a different formula from Mirai’s liquid wash.',
        'social_short': 'Mirai soaps and washes appear in 3 of 8 reviewed threads. This bar is a format option, not a separately proven Reddit favorite.',
        'label': 'The Unscented bar reviewed is 3.5 oz (100 g). Its ingredient list does not list fragrance or perfume essential oils. The brand says the ingredients may have a light natural scent. Lavender and citrus bars are separate scented versions.',
        'tradeoff': 'Some persimmon-soap users report dryness, burning or a rash. The comments do not always identify the brand or formula. Unscented does not guarantee that a product will suit sensitive skin.',
        'check': 'Unscented bar, 3.5 oz',
    },
}

HEADERS = {
    '/gentle-care/': ('Gentle care for the vulva', 'The vulva is the genital skin on the outside. Start with gentle washing, then compare a cleanser only if you want one.'),
    '/odor-and-menopause/': ('Vaginal odor during menopause', 'Start by separating odor on the surrounding skin from a change in vaginal discharge. A body wash cannot tell you what is causing the change.'),
    '/ingredient-labels/': ('What to check on a wash label', 'Check where it is meant to be used, whether it contains fragrance, and what its claims actually tell you.'),
    '/probiotics/': ('Probiotics for vaginal odor', 'Compare oral capsules and gummies, understand the differences, and see what the research does and does not show.'),
    '/gummies-vs-capsules/': ('URO gummies vs. capsules', 'The same brand sells two different formulas. Compare the ingredients and bacteria before choosing a format.'),
    '/when-to-get-checked/': ('When vaginal odor needs medical attention', 'A change in odor with discharge, itching, burning or pain is a reason to seek advice. This page explains when to arrange an appointment and when to get urgent help.'),
    '/appointment-checklist/': ('What to ask about a change in odor', 'Use this printable checklist to describe the change, list what you have tried, and prepare questions for your appointment.'),
    '/our-method/': ('How we choose and compare products', 'Reddit helps us find products people discuss. Labels explain their intended use. Medical sources help us check health claims.'),
    '/sources/': ('Sources behind the guides', 'Find the medical guidance, product labels and Reddit discussions used on this site.'),
    '/affiliate-disclosure/': ('Amazon links and affiliate disclosure', 'This preview uses Amazon search links. They do not currently earn a commission.'),
    '/privacy/': ('Privacy and your information', 'This preview has no health questionnaire, email signup or custom account system. The printable checklist stays in your browser tab.'),
}

RESEARCH_LIMITS = {
    'The Ordinary glycolic acid toner': 'Most comments name the brand or toner without its strength. One thread explicitly identifies 7%. It is a leave-on toner, not a wash.',
    'Persimmon cleanser category': 'These mentions cover several brands, scents, bars and liquids. One thread contains a suggestion without a first-hand report. The count is not a Mirai-only total.',
    'Lume cleanser family': 'Three threads clearly name the acidified liquid wash. The other mentions include a bar, an unspecified soap, or a routine with several Lume products.',
    'PanOxyl cleanser family': 'Comments discuss bars, liquid washes and different strengths. One person appears in two threads. The count does not establish a preferred formula.',
    'Mirai persimmon cleanser family': 'Comments often omit the format or scent, and one combines soap and wipes. These mentions do not identify the Unscented bar as a separate winner.',
    'Hibiclens': 'Two threads contain suggestions without first-hand reports. This is an antiseptic skin cleanser, not an intimate wash.',
    'Hypochlorous-acid spray category': 'The discussions do not establish a repeatedly recommended brand. Some reports combine the spray with other products.',
    'Dove antibacterial body wash': 'This is the antibacterial wash. It is different from Dove Sensitive, Ultra Sensitive and deodorant products.',
    'Witch hazel': 'No brand is repeatedly identified. The discussions also include a negative experience.',
    'Oral chlorophyll': 'Reports combine products or omit the brand and formula. They do not establish that chlorophyll reduces odor.',
}

def replace_dek(content, text):
    return re.sub(r'<p class="dek">.*?</p>', '<p class="dek">'+html.escape(text)+'</p>', content, count=1, flags=re.S)

def refine_page(path, title, description, content):
    if path in HEADERS:
        title, description = HEADERS[path]
        # Reader quotes remain attributed in the article, below the clear topic heading.
        match = re.search(r'<h1>(.*?)</h1>(<span class="quote-credit">.*?</span>)?', content, re.S)
        if match and match.group(2):
            reader = '<blockquote class="reader-quote">'+match.group(1)+'</blockquote>'+match.group(2)
            content = content.replace('<article class="article-body">', '<article class="article-body">'+reader, 1)
        content = re.sub(r'<h1>.*?</h1>(?:<span class="quote-credit">.*?</span>)?', '<h1>'+title+'</h1>', content, count=1, flags=re.S)
        content = replace_dek(content, description)

    # A generic comfort sidebar and a repeated shopping strip interrupted every article.
    content = re.sub(r'<aside class="side-note"><span class="eyebrow">A useful reminder</span>.*?</aside>', '', content, flags=re.S)
    content = content.replace('class="article-layout"><article', 'class="article-layout reader-layout"><article')
    content = content.replace('Compare all washes', 'Compare body washes')
    content = content.replace('Read the product review', 'See ingredients &amp; tradeoffs')
    content = content.replace('Read the care signposts', 'See symptoms that need attention')
    content = content.replace('care signposts', 'symptoms that need attention')
    content = content.replace('not a diagnosis or an individualized treatment recommendation', 'not a diagnosis or personal treatment advice')

    if path.startswith('/washes/') and path not in ['/washes/'+x+'/' for x in PRODUCT_COPY]:
        content = content.replace('Additional label comparison. This exact product is not established as a community favorite in our reviewed sample.', 'Additional cleanser comparison. This formula is included for its label details, not because our Reddit sample established it as a favorite.')
        content = content.replace('External hands/body; lather on wet skin and rinse. Manufacturer does not establish intravaginal use or menopause-specific efficacy.', 'A rinse-off cleanser for hands and body. It is not an internal vaginal wash or a proven treatment for menopause-related odor.')
        content = content.replace('Brand cleanser page states no fragrance or masking fragrance. Bottle visibly says fragrance free. No essential oils/botanical extracts per product page.', 'The brand labels it fragrance-free, with no masking fragrance, essential oils or botanical extracts.')
        content = content.replace('General skin cleanser, not a vaginal pH or infection treatment; suitability for any individual vulvar skin condition is not established by this page.', 'This is a general skin cleanser. The label does not show that it treats vaginal odor, changes vaginal pH or treats an infection.')
        content = content.replace('Keep exact Ultra Sensitive variant identity. Ordinary Sensitive Body Wash is a different fragranced formula. No menopause-odor treatment evidence established.', 'Ultra Sensitive and ordinary Sensitive Body Wash are different formulas. The label does not establish that either treats menopause-related odor.')
        content = content.replace('Manufacturer explicitly says no fragrance or essential oils; inspected ingredient image has no parfum/fragrance. Benzyl alcohol appears in ingredients; ingredient-function/individual sensitivity questions remain separate from fragrance-free marketing.', 'The manufacturer says no fragrance or essential oils. The ingredient list includes benzyl alcohol, so check the full list if you have a known sensitivity. Fragrance-free does not mean everyone will tolerate it.')
        content = content.replace('Brand cites a consumer-perception study, 31 women aged 23–64 for four weeks. Do not present reported lack of pH disruption as objective proof or menopause-specific effectiveness.', 'The brand cites a four-week survey of 31 women aged 23 to 64. Their reported experiences do not establish an objectively measured pH effect or a benefit specifically for menopause-related odor.')
        content = content.replace('<h2>Ingredient notes</h2><p>', '<details class="label-details"><summary>Read the full ingredient list</summary><p>',1)
        content = content.replace('</p><p>Ingredients can change.', '</p></details><p>Ingredients can change.',1)
        # The first disclosure already explains the Amazon search links.
        content = re.sub(r'(<h2>Check the current product</h2>)<p class="disclosure">.*?</p>', r'\1', content, count=1, flags=re.S)

    if path == '/gentle-care/':
        content = content.replace('That concern came up in our community research. ', '')
        content = content.replace('Compare the labels', 'Compare an external vulva cleanser')
        content = content.replace('href="/external-washes/"', 'href="/washes/love-wellness-ph-balanced-cleanser/"')
    if path == '/ingredient-labels/':
        content = content.replace('exclude it from the fragrance-free shortlist pending clarification', 'do not describe it as fragrance-free while those details conflict')
    if path == '/probiotics/':
        content = content.replace('URO capsule comparison', 'Compare URO capsules')
        content = content.replace('Jump to other label comparisons', 'Compare other supplements')
        content = content.replace('A microscopic Nugent score improved.', 'A laboratory score describing vaginal bacteria improved. This is called a Nugent score.')
        content = content.replace('with BV;', 'with bacterial vaginosis (BV);')
        content = content.replace('The 2021 CDC BV treatment guideline', 'The CDC guideline for bacterial vaginosis (BV)')
        content = content.replace('Check the exact strain identifiers, total and per-strain dose when disclosed, delivery route, study population, and measured outcome. Higher CFU is not automatically better. Species names alone do not identify a studied strain.', 'Compare the specific bacteria, the amount per serving, whether the product is swallowed or used vaginally, who was studied, and which symptoms were measured. A strain is a specific type of a microorganism. CFU, or colony-forming units, is a measure of the number of live microorganisms. A larger CFU number does not automatically mean a better result.')
        content = content.replace('Other labels to compare', 'Compare oral supplements')
        content = content.replace('Label example · not a treatment pick', 'Oral supplement · label comparison')
        content = content.replace('Evidence limit:', 'Does it help with odor?')
        content = content.replace('5 billion beneficial bacteria per serving; L. rhamnosus GR-1 and L. reuteri RC-14 identified in official FAQ. Vegan, non-GMO, gluten-free claims.', 'The official FAQ identifies two strains: L. rhamnosus GR-1 and L. reuteri RC-14. The label lists 5 billion live microorganisms per serving.')
        content = content.replace('Bacillus coagulans SNZ 1969, 1 billion CFU in 135 mg proprietary blend with pineapple fruit powder and sea-buckthorn juice powder. Vitamin C 45 mg, vitamin D3 50 mcg, sodium 5 mg. Tapioca syrup, sugar, pectin, natural flavor and color among excipients.', 'A gummy with Bacillus coagulans SNZ 1969 and 1 billion live microorganisms per serving. It also contains vitamins C and D3, fruit ingredients and added sugar. Its formula differs from URO capsules.')
        content = content.replace('50 mg proprietary blend, 1 billion CFU total: B. subtilis DE111 plus L. acidophilus, gasseri, salivarius, brevis, rhamnosus, casei, plantarum, paracasei. Other ingredients inulin, HPMC capsule and medium-chain triglycerides. Only DE111 has an alphanumeric strain identifier on inspected panel.', 'A capsule containing a blend of bacteria, with 1 billion live microorganisms per serving. The label checked identifies the DE111 strain for B. subtilis but does not give strain identifiers for the other listed species.')
        content = content.replace('No menopause-odor benefit for this finished retail product was established in this review.', 'We did not establish an odor benefit for this exact product in people going through menopause.')
        # Give shoppers product choices after the short answer; keep study detail available afterwards.
        start=content.find('<h2>Ask what was measured</h2>'); end=content.find('<h2 id="products">')
        if 0 <= start < end:
            evidence=content[start:end]; content=content[:start]+content[end:]
            content=content.replace('<h2>Questions before spending money</h2>', evidence+'<h2>Questions before spending money</h2>',1)
    if path == '/gummies-vs-capsules/':
        content = content.replace('<h2>A real example: URO</h2>', '<h2>What is different?</h2>')
        content = content.replace('Total CFU per labeled serving', 'Live microorganisms per serving (CFU)')
        content = content.replace('Four Lactobacillus species; no strain IDs in the retrieved panel', 'Four Lactobacillus species; the label checked does not identify their specific strains')
        content = content.replace('XOS prebiotic', 'XOS, a prebiotic ingredient')
        content = content.replace('What to compare on any supplement</h2>', 'How to read the numbers</h2><p>CFU means colony-forming units, a measure of live microorganisms. A strain is a specific type of a microorganism. A larger CFU number alone does not show that one product will work better.</p><h2>What to compare on any supplement</h2>')
        content = content.replace('route, formula, population, and endpoint', 'way it is taken, exact formula, people studied, and result measured')
        content = content.replace('other excipients', 'other added ingredients')
        content = content.replace('Do not buy a format as a promise', 'What neither format proves')
        content = re.sub(r'<figure class="article-figure">(.*?)</figure>', r'<figure class="article-figure compact-product-figure">\1</figure>', content, count=1, flags=re.S)
    if path == '/appointment-checklist/':
        content = content.replace('You can say: “I’ve noticed a change in scent, and I’d like help figuring out what is causing it.” You do not need to apologize or diagnose it yourself.', 'Start by describing the change in your own words. You do not need to know its cause. Check the questions you want to bring, then print this page.')
        content = content.replace('<ul class="checklist">', '<h2>What to note before the visit</h2><ul class="checklist">',1)
        marker='<li><label><input type="checkbox"><span>What could explain'
        content = content.replace(marker, '</ul><h2>Questions to ask at the visit</h2><ul class="checklist">'+marker,1)
    if path == '/when-to-get-checked/':
        content = content.replace('Bring up new or persistent odor,', 'Bring up new or persistent vaginal odor,')
        content = content.replace('This is a general signpost, not a complete triage checklist.', 'This list is not exhaustive; seek help if you feel seriously unwell.')
    if path == '/our-method/':
        content = content.replace('intended route', 'intended body area or way it is taken')
        content = content.replace('What we actually accessed', 'What we read')
        content = content.replace('Recovered historical research', 'Earlier reader-supplied discussions')
        content = content.replace('The July research supplied by the site owner', 'Earlier discussions shared with us')
        content = content.replace('Our November 12 research included 15 Reddit discussions,', 'The broader November 12 research included 15 Reddit discussions,')
        content = content.replace('Seven YouTube-linked items', 'The product-count table uses a separate, fixed sample of eight body-odor threads, explained on the <a href="/reddit-recommendations/">Reddit research page</a>. These are different research sets, so their totals should not be combined. Seven YouTube-linked items')
    if path == '/affiliate-disclosure/':
        content = re.sub(r' Four previously supplied Amazon short links.*?confirming their destinations\.', '', content)
        content = content.replace('approved Special Links will replace the search fallbacks', 'tracked product links will replace the search links')
        content = content.replace('The no-purchase option remains part of the care guidance.', 'Care guides also explain when a purchase is unnecessary.')
    if path == '/sources/':
        content = content.replace('Open the product-by-product Reddit source ledger', 'Read the Reddit product discussions')
        content = content.replace('The developer research package contains the full dated product, affiliate, and social-research ledgers, including contradictory labels and access limits.', 'The <a href="/reddit-recommendations/">Reddit research page</a> links to product discussions and explains how mentions were counted. Product pages link to the labels we checked.')
    if path == '/not-found/':
        content = content.replace('Let’s find a useful next step.', 'We couldn’t find that page.')
        content = content.replace('<div class="actions">', '<p>The link may be old or incomplete. Return home or open the body-wash comparison.</p><div class="actions">',1)
    return title,description,content
