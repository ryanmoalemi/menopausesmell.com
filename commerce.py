"""Amazon-focused presentation layer. Product, quote and link ledgers are editable data."""
from pathlib import Path
import json, html, re
from urllib.parse import urlencode
from reader_copy import PRODUCT_COPY, RESEARCH_LIMITS

ROOT=Path(__file__).parent
E=html.escape
DATA=ROOT/'data'
Q={
 'home': {'text':'Any recommendations for deodorizing soaps?','url':'https://www.reddit.com/r/Menopause/comments/1hk2cy0/any_recommendations_for_deodorizing_soaps/','community':'r/Menopause','kind':'thread title'},
 'need': {'text':'Now no matter how often I shower or what deodorant I use, I still smell.','url':'https://www.reddit.com/r/Menopause/comments/1l23e0l/do_i_smell/','community':'r/Menopause','kind':'post excerpt'},
 'intimate': {'text':'Crotch smell after menopause','url':'https://www.reddit.com/r/Menopause/comments/1lwdyyu/crotch_smell_after_menopause/','community':'r/Menopause','kind':'thread title'},
 'gentle': {'text':'What soap to use to wash my lady bits?','url':'https://www.reddit.com/r/Perimenopause/comments/1r8ze4y/what_soap_to_use_to_wash_my_lady_bits/','community':'r/Perimenopause','kind':'thread title'},
 'comfort': {'text':'Looking for something new that will control odor and not irritate.','url':'https://www.reddit.com/r/Perimenopause/comments/1hc2wqb/vaginal_wash/','community':'r/Perimenopause','kind':'post excerpt'},
 'which': {'text':"What y'all using down there?",'url':'https://www.reddit.com/r/Perimenopause/comments/1hc2wqb/vaginal_wash/','community':'r/Perimenopause','kind':'post excerpt'},
 'body': {'text':'I smell more than I ever have.','url':'https://www.reddit.com/r/Perimenopause/comments/1vt4mq8/perimenopause_smell/','community':'r/Perimenopause','kind':'post excerpt'},
 'supplements': {'text':'I’ve been looking into women’s probiotics to see if they might help, but I don’t know much about them yet.','url':'https://www.reddit.com/r/Healthyhooha/comments/1rm2jgt/womens_probiotics/','community':'r/Healthyhooha','kind':'post excerpt; adjacent audience, not a menopause account'},
}
LINKS=json.loads((DATA/'amazon-commerce.json').read_text())
PRODUCTS=json.loads((DATA/'commerce-products.json').read_text()) if (DATA/'commerce-products.json').exists() else []
for p in PRODUCTS:
 p.update(PRODUCT_COPY.get(p['id'],{}))
PRODUCT_MAP={p['id']:p for p in PRODUCTS}

def a(url,text,cls=''):
 return f'<a class="{cls}" href="{E(url,quote=True)}">{text}</a>'
def button(url,text,secondary=False):
 return a(url,text,'btn secondary' if secondary else 'btn')
def credit(key):
 q=Q[key]
 return f'<span class="quote-credit">{a(q["url"],q["community"]+" · "+q["kind"])} · Direct quote</span>'
def quote(key,tag='blockquote'):
 return f'<{tag} class="reader-quote">“{E(Q[key]["text"])}”</{tag}>{credit(key)}'
def amazon(pid,placement='card'):
 p=LINKS['products'].get(pid,{})
 special=p.get('special_link')
 active=bool(LINKS.get('enrollment_verified') and p.get('exact_listing_verified') and special)
 url=special if active else p.get('search_url','https://www.amazon.com/s?'+urlencode({'k':PRODUCT_MAP.get(pid,{}).get('name',pid.replace('-',' '))}))
 label='View on Amazon' if active else 'Search Amazon'
 name=PRODUCT_MAP.get(pid,{}).get('display_name',pid.replace('-',' '))
 return f'<a class="btn amazon" aria-label="{E(label+' for '+name,quote=True)}" href="{E(url,quote=True)}" rel="sponsored nofollow noopener" target="_blank" data-product-id="{pid}" data-placement="{placement}">{label}<span aria-hidden="true">↗</span></a>'
def disclosure():
 if LINKS.get('enrollment_verified'):
  text='As an Amazon Associate I earn from qualifying purchases.'
 else:
  text='These links open Amazon search results. This preview does not earn commissions.'
 return f'<p class="disclosure">{text} {a("/affiliate-disclosure/","How links work")}. Check the exact formula, size and seller in Amazon results.</p>'
def card(p,compact=False):
 return f'''<article class="product social-product" data-product="{p['id']}" data-category="{p['category']}"><div class="product-art"><img src="/assets/{p['image']}" alt="{E(p['name'])} packaging" loading="lazy"></div><div class="product-body"><span class="badge">{E(p['badge'])}</span><h3>{E(p.get('display_name',p['name']))}</h3><p>{E(p['summary'])}</p><dl><div><dt>For</dt><dd>{E(p['area'])}</dd></div><div><dt>Check</dt><dd>{E(p['check'])}</dd></div></dl><p class="evidence-note">{E(p.get('social_short',p['social']))} {a('/reddit-recommendations/#'+p['id'],'See the Reddit sources')}</p><div class="product-links">{a('/washes/'+p['id']+'/','See ingredients &amp; tradeoffs')}{amazon(p['id'])}</div></div></article>'''
def shortlist():
 return [p for p in PRODUCTS if p.get('featured')]
def grid(items):
 return '<div class="product-grid">'+''.join(card(p) for p in items)+'</div>'
def shop_strip(context='wash',quiet=False):
 if quiet:
  return '<section class="quiet-shop"><span>Product comparisons</span>'+a('/external-washes/','Body washes')+' '+a('/probiotics/','Oral probiotics')+'</section>'
 if context=='care':
  return '<section class="quiet-shop"><span>Considering a cleanser for outside skin?</span>'+a('/gentle-care/','Start with gentle vulva care')+' '+a('/washes/love-wellness-ph-balanced-cleanser/','Read the external cleanser comparison')+'</section>'
 if context=='supplement':
  return '<section class="quiet-shop"><span>Continue comparing</span>'+a('/probiotics/uro-capsules/','URO capsules')+' '+a('/gummies-vs-capsules/','URO gummies vs. capsules')+'</section>'
 return '<section class="shop-strip"><div><span class="eyebrow">Compare products</span><h2>Body washes discussed on Reddit</h2><p>Compare the intended use, ingredients and reported drawbacks, then check the exact product on Amazon.</p></div>'+button('/external-washes/','Compare body washes')+'</section>'
def home():
 picks=shortlist()
 showcase=''.join(f'<a href="/washes/{p["id"]}/" class="hero-item"><img src="/assets/{p["image"]}" alt="{E(p["name"])}"><span>{E(p["short_name"])}</span></a>' for p in picks[:3])
 return f'''<div class="wrap"><section class="hero commerce-hero"><div class="hero-copy"><span class="eyebrow">Body washes · Real Reddit discussions</span><h1>Body odor during menopause</h1><blockquote class="hero-dek">“{Q['need']['text']}”</blockquote>{credit('need')}<p class="hero-explainer">Deodorizing soaps are body cleansers marketed to help with body odor. Compare persimmon soaps and acidified body washes discussed on Reddit, including their ingredients, reported drawbacks and Amazon options.</p><div class="actions">{button('#shortlist','Compare body washes')}{a('/body-odor/','Find the guide for your concern','text-link')}</div></div><div class="product-showcase"><div class="showcase-title">Body washes for odor</div><div class="showcase-products">{showcase}</div><div class="showcase-footer">For body skin. {a('/odor-and-menopause/','Vaginal odor has a separate guide.')}<br>Read the product notes before choosing a wash.</div></div></section><nav class="shop-jumps" aria-label="Browse by concern">{a('/external-washes/','Body washes')}{a('/underarm-products/','Underarm products')}{a('/gentle-care/','Vulva care')}{a('/probiotics/','Oral probiotics')}</nav><section class="section" id="shortlist"><div class="section-heading"><div><span class="eyebrow">Wash comparison</span><h2>Persimmon soap or acidified body wash?</h2></div>{a('/reddit-recommendations/','See why these products are included','text-link')}</div><p class="section-intro">Compare two brands in three formats: Mirai liquid, Lume liquid and a Mirai bar. Reddit comments discuss these product families, but do not always identify the exact scent or formula.</p>{disclosure()}{grid(picks)}<p class="note-small">These comparisons use labels and published discussions. We have not tested the products or established that they treat menopause-related odor.</p></section><section class="split section concern-split"><div><span class="eyebrow">Vaginal odor and outside skin</span>{quote('intimate','h2')}<p>The vulva is the genital skin on the outside; the vagina is internal. Start with the care guide to understand the distinction before choosing a cleanser.</p>{button('/odor-and-menopause/','Read the vaginal-odor guide',True)}</div><div class="quote-panel">{quote('comfort')}<p>For washing outside skin, read the gentle-care guide. New or persistent vaginal odor, especially with discharge, burning, itching or pain, needs medical advice.</p><div class="actions">{a('/gentle-care/','Gentle vulva care')}{a('/when-to-get-checked/','When to get checked')}</div></div></section><section class="section supplement-feature"><img src="/assets/uro-capsules.webp" alt="URO oral probiotic capsules packaging" loading="lazy"><div><span class="eyebrow">Oral supplements</span><h2>URO capsules and gummies: compare the formulas</h2><p>These are swallowed supplements marketed for vaginal health. The capsule and gummy formulas differ. Our review did not establish that either treats menopause-related odor.</p><div class="actions">{button('/probiotics/uro-capsules/','Compare URO capsules')}{a('/gummies-vs-capsules/','Gummies vs. capsules','text-link')}</div></div></section></div>'''
def comparison():
 return f'''<div class="wrap"><header class="article-head"><span class="eyebrow">Body-wash comparison</span><h1>Soaps and body washes for body odor</h1><p class="dek">Deodorizing washes are marketed for odor on body skin. Compare the persimmon and acidified washes discussed on Reddit by format, ingredients and reported drawbacks.</p></header><div class="comparison-question">{quote('home')}</div><div class="shopping-note"><strong>For body skin, not inside the vagina.</strong> If your concern is the vulva, the genital skin on the outside, start with {a('/gentle-care/','gentle vulva care')}. This list is not a treatment guide for vaginal odor.</div>{disclosure()}<div class="filters" role="group" aria-label="Filter wash comparison"><button class="filter" data-filter="all" aria-pressed="true">All washes</button><button class="filter" data-filter="liquid" aria-pressed="false">Liquid washes</button><button class="filter" data-filter="bar" aria-pressed="false">Soap bars</button></div><p class="filter-status" id="filter-status" aria-live="polite">{len([p for p in PRODUCTS if p['category']!='supplement'])} products shown</p>{grid([p for p in PRODUCTS if p['category']!='supplement'])}<section class="section"><h2>Other cleansers: compare the intended use</h2><p>These are additional label comparisons. The reviewed Reddit discussions do not establish these exact formulas as community favorites.</p><div class="link-grid"><div class="link-card"><h3>Fragrance-free body washes</h3><p>Vanicream and Dove Ultra Sensitive are general body cleansers. Compare their ingredients if avoiding fragrance is your priority.</p>{a('/washes/vanicream-gentle-body-wash/','Vanicream Gentle Body Wash')}<br>{a('/washes/dove-ultra-sensitive/','Dove Ultra Sensitive')}</div><div class="link-card"><h3>A cleanser labeled for the vulva</h3><p>Love Wellness is labeled for outside genital skin. That is a different intended area from the body-wash comparison above.</p>{a('/washes/love-wellness-ph-balanced-cleanser/','Love Wellness external cleanser')}<br>{a('/gentle-care/','Read about gentle care first')}</div></div></section></div>'''
def product_page(p):
 discussions=''.join('<li>'+a(s['url'],E(s['title']))+'</li>' for s in p.get('sources',[]))
 return f'''<div class="wrap"><div class="breadcrumbs">{a('/','Home')} / {a('/external-washes/','Washes')}</div><section class="product-detail"><div class="detail-photo"><img src="/assets/{p['image']}" alt="{E(p['name'])} packaging"></div><div><span class="eyebrow">{E(p['badge'])}</span><h1>{E(p.get('display_name',p['name']))}</h1><p class="dek">{E(p['summary'])}</p><div class="detail-facts"><p><strong>Intended area:</strong> {E(p['area'])}</p><p><strong>Before buying:</strong> {E(p['check'])}</p></div>{disclosure()}<div class="actions">{amazon(p['id'],'product_top')}{button('/external-washes/','Compare washes',True)}</div></div></section><div class="article-layout"><article class="article-body"><h2>What people said on Reddit</h2><p>{E(p['social'])}</p><h2>Reported drawbacks</h2><p>{E(p['tradeoff'])}</p><h2>Ingredients, scent and format</h2><p>{E(p['label'])}</p><p>{a(p['official_url'],'Manufacturer label and directions')} · Checked November 12, 2026.</p>{('<p>'+a('https://help.lumedeodorant.com/en-US/what-is-the-ph-of-your-products-8675646','Lume’s explanation of product pH')+'</p>') if p['id']=='lume-unscented-wash' else ''}<h2>Read the discussions</h2><ul class="source-list">{discussions}</ul><p>These are personal experiences, not clinical tests. We have not tested this product or established that it treats menopause-related odor.</p><h2>Check this exact product on Amazon</h2><p><strong>{E(p["name"])}</strong></p><p>Check the variant, seller, quantity and one-time purchase or subscription terms. Prices and availability appear on Amazon.</p>{amazon(p['id'],'product_bottom')}</article><aside class="side-note"><h3>Compare by body area</h3><p>Do not transfer underarm routines to genital skin. Stop using a cleanser that irritates.</p>{a('/gentle-care/','External-care guide')}{a('/underarm-products/','Underarm product notes')}</aside></div></div>'''
def research_page():
 ledger=json.loads((DATA/'social-shortlist.json').read_text()) if (DATA/'social-shortlist.json').exists() else {}
 cards='<div class="table-wrap"><table><thead><tr><th>Product family or category</th><th>Threads with positive mentions</th><th>What the count means</th></tr></thead><tbody>'+''.join('<tr><td>'+E(c['label'])+'</td><td>'+str(c['count'])+'/8</td><td>'+E(RESEARCH_LIMITS.get(c['label'],c.get('exact_sku_limit','See discussion notes')))+'</td></tr>' for c in ledger.get('counts',[]))+'</tbody></table></div>'
 for p in PRODUCTS:
  cards+=f'<section id="{p["id"]}" class="research-row"><img src="/assets/{p["image"]}" alt="{E(p["name"])}"><div><h2>{E(p["name"])}</h2><p>{E(p["social"])}</p><p>{E(p["tradeoff"])}</p><ul>'+''.join('<li>'+a(s['url'],E(s['title']))+'</li>' for s in p.get('sources',[]))+'</ul>'+a('/washes/'+p['id']+'/' if p['category']!='supplement' else '/probiotics/uro-capsules/','Read the comparison')+'</div></section>'
 return f'<div class="wrap"><header class="article-head"><span class="eyebrow">Product selection</span><h1>Products mentioned on Reddit</h1><p class="dek">See which products came up in eight body-odor threads, what readers liked or disliked, and which exact versions were identified.</p></header><div class="callout"><strong>How to read the counts</strong><p>We counted positive mentions or suggestions in eight selected body-odor threads. Each thread counts once for a product family, even when several people mention it. A thread can include both praise and criticism. These counts show what appeared in this small sample, not the best products across Reddit. Two earlier reader-supplied threads provide extra context and are outside the eight-thread count.</p></div>{cards}<section class="section"><h2>YouTube and X</h2><p>Accessible YouTube titles, descriptions and selected transcript material were used as context. We have not established an independent cross-platform product ranking. No reliable X consumer-post sample was available. Creator promotions and manufacturer content do not count as independent customer recommendations.</p><h2>Other products mentioned in the original research</h2><p>PanOxyl, The Ordinary 7% glycolic acid, hypochlorous sprays, witch hazel, Hibiclens and chlorophyll also came up in the discussions. Their roles, body-area limits and evidence differ. They do not form one routine and should not be combined from social-media anecdotes.</p>{button('/underarm-products/','Review underarm product claims')}</section></div>'
def revise_page(path,title,description,content):
 if path=='/': return 'Menopause body odor | Reddit-discussed washes on Amazon','Compare washes and body-care products discussed in menopause communities, with Amazon shopping links.',home()
 if path=='/external-washes/': return 'Compare Reddit-discussed washes on Amazon','Body wash comparisons, community reports and exact-label checks.',comparison()
 heads={'/odor-and-menopause/':('intimate','Intimate odor and menopause'),'/gentle-care/':('gentle','Gentle external care'),'/ingredient-labels/':('comfort','Ingredients and irritation')}
 if path in heads:
  q,seo=heads[path]; title=seo
  content=re.sub(r'<h1>.*?</h1>',f'<h1>“{E(Q[q]["text"])}”</h1>{credit(q)}',content,count=1,flags=re.S)
  content=re.sub(r'<p class="dek">.*?</p>','<p class="dek">Label facts and care guidance for the question above.</p>',content,count=1,flags=re.S)
  content=re.sub(r'<figure class="article-figure">.*?</figure>','',content,count=1,flags=re.S)
 # Existing product pages remain available, without invented social proof.
 if path.startswith('/washes/') and path.strip('/').split('/')[-1] not in PRODUCT_MAP:
  pid=path.strip('/').split('/')[-1]
  content=content.replace('<article class="article-body">','<article class="article-body"><p class="notice">Additional label comparison. This exact product is not established as a community favorite in our reviewed sample.</p>'+disclosure()+amazon(pid,'legacy_top'),1)
  content=re.sub(r'<a class="btn" href="https://[^\"]+">View at [^<]+</a>',amazon(pid,'legacy_bottom'),content)
 # Replace former manufacturer shopping actions with Amazon, retain source links.
 for p in json.loads((DATA/'products-research.json').read_text())['oral_supplements']:
  if p['id'] in LINKS['products']:
   target=a(p['official_url'],'Read the manufacturer label')
   content=content.replace(target,amazon(p['id'],'supplement_card')+' '+a(p['official_url'],'Manufacturer label'))
 if path=='/probiotics/':
  content=re.sub(r'<h1>.*?</h1>','<h1>Probiotics: compare capsules & gummies</h1>',content,count=1,flags=re.S)
  content=content.replace('<article class="article-body">','<article class="article-body">'+quote('supplements')+'<p class="note-small">This question comes from an adjacent health community, not a menopause-specific account.</p><div class="actions">'+button('/probiotics/uro-capsules/','URO capsule comparison')+a('#products','Jump to other label comparisons')+'</div>',1)
  content=content.replace('<h2>Label examples, not an efficacy ranking</h2>','<h2 id="products">Other labels to compare</h2>')
  content=content.replace('These examples show what can be checked on a label. They are not recommendations to buy a supplement for odor.','The original research included URO capsule reviews. The gummies below are a separate formula; repHresh and Good Girl remain secondary label examples. None is ranked as the best menopause-odor treatment.')
 if path=='/gummies-vs-capsules/':
  content=content.replace('<h2>Labels behind the comparison</h2>',disclosure()+amazon('uro-gummies','gummy_comparison')+' '+button('/probiotics/uro-capsules/','Compare URO capsules',True)+'<h2>Labels behind the comparison</h2>')
 if path=='/our-method/':
  content=content.replace('The initial wash shortlist favors verified fragrance-free labeling.','The featured shortlist now starts with repeated social recommendations, then checks the exact formula and intended area. A brand or ingredient count is not transferred to a specific scent, size or format.')
  content=content.replace('retailer and brand affiliate commissions','Amazon affiliate commissions')
  content=content.replace('<h2>How products enter the comparison</h2>','<h2>Recovered historical research</h2><p>The July research supplied by the site owner focused on whole-body odor, including persimmon, PanOxyl, glycolic acid, Lume and other approaches. The original URO material concerns oral capsules, not gummies. We retained those distinctions in the updated comparisons.</p><h2>How products enter the comparison</h2>')
 if path=='/affiliate-disclosure/':
  content=content.replace('This private concept uses ordinary manufacturer links.','This private preview uses Amazon product-search links. Four previously supplied Amazon short links are retained in the developer handoff but are not assigned to products without confirming their destinations.')
  content=content.replace('After enrollment, selected product links may earn a commission when a reader buys.','The site is intended to earn through Amazon Associates. Once enrollment and exact listing destinations are verified, approved Special Links will replace the search fallbacks.')
 if path=='/sources/':
  content=content.replace('<article class="article-body">','<article class="article-body"><p>'+a('/reddit-recommendations/','Open the product-by-product Reddit source ledger')+'</p>',1)
 no_strip=path in ['/not-found/','/body-odor/','/underarm-products/'] or path.startswith('/washes/')
 if not no_strip:
  care=path in ['/when-to-get-checked/','/appointment-checklist/','/gentle-care/','/odor-and-menopause/']
  context='care' if care else ('supplement' if path.startswith('/probiotics/') or path=='/gummies-vs-capsules/' else 'wash')
  content+='<div class="wrap">'+shop_strip(context,path in ['/privacy/','/affiliate-disclosure/'])+'</div>'
 return title,description,content

def extra_pages():
 pages=[]
 for p in PRODUCTS:
  if p['category']!='supplement': pages.append(('/washes/'+p['id']+'/',p['name']+' comparison',p['summary'],product_page(p)))
 pages.append(('/reddit-recommendations/','Reddit product recommendations and sources','How the community shortlist was selected.',research_page()))
 pages.append(('/body-odor/','Menopause body odor: washes and underarm products','Compare body-odor product options from menopause discussions.',f'<div class="wrap"><header class="article-head"><span class="eyebrow">Menopause body odor</span><h1>Body odor, underarms or vaginal odor?</h1><p class="dek">Choose the area you are concerned about to find the relevant product comparison or care guide.</p></header><div class="article-layout"><article class="article-body">{quote("body")}<p>Start with where you notice the odor. The comparisons below cover different areas and product types.</p><h2>Body washes</h2><p>These are rinse-off cleansers for body skin. Persimmon soap and Lume wash came up repeatedly in the reviewed discussions, with both positive and negative experiences.</p>{button("/external-washes/","Compare body washes")}<h2>Underarm products</h2><p>Reddit users also discuss acne cleansers and exfoliating acids for underarm odor. Those uses differ from the labels. Read the differences and precautions before considering a product.</p>{button("/underarm-products/","Read the underarm comparison",True)}<h2>Intimate odor</h2><p>The vulva is the outside genital skin; the vagina is internal. A change in vaginal odor or discharge belongs in the care guide, not a stronger body-wash routine.</p>{a("/odor-and-menopause/","Read the intimate-odor guide")}</article></div></div>'))
 if (DATA/'extra-commerce-pages.json').exists():
  for p in json.loads((DATA/'extra-commerce-pages.json').read_text()): pages.append((p['path'],p['title'],p['description'],p['content']))
 (DATA/'reddit-copy.json').write_text(json.dumps(Q,indent=2,ensure_ascii=False))
 return pages
