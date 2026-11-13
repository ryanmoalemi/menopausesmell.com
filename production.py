"""Build the complete static site, then export it for GitHub Pages at repo root.

Python 3.11+, standard library only. No secrets or Amazon API keys required.
"""
from pathlib import Path
from urllib.parse import urlsplit
import html
import json
import re
import runpy
import shutil

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'dist'
settings = json.loads((ROOT / 'data/site-settings.json').read_text())
commerce = json.loads((ROOT / 'data/amazon-commerce.json').read_text())
live = settings.get('public_launch', False)
base = settings['public_base_url'].rstrip('/')
parsed = urlsplit(base)
if parsed.scheme != 'https' or not parsed.netloc or parsed.path or parsed.query or parsed.fragment:
    raise ValueError('public_base_url must be an HTTPS origin without a path')
if live:
    for key in ['site_owner', 'contact_email']:
        if not settings.get(key):
            raise ValueError(f'Set {key} before public_launch')
    if (ROOT / 'CNAME').read_text().strip() != parsed.netloc:
        raise ValueError('CNAME must match public_base_url before public_launch')

active_count = 0
for pid, product in commerce['products'].items():
    if product.get('exact_listing_verified') and product.get('special_link'):
        dest = urlsplit(product['special_link'])
        if dest.scheme != 'https' or dest.hostname not in {'www.amazon.com', 'amazon.com', 'amzn.to'}:
            raise ValueError(f'{pid}: expected an HTTPS US Amazon Special Link')
        active_count += 1
active = bool(commerce.get('enrollment_verified') and active_count)

OUT.mkdir(exist_ok=True)
shutil.copytree(ROOT / 'assets', OUT / 'assets', dirs_exist_ok=True)
runpy.run_path(str(ROOT / 'build.py'), run_name='__main__')
routes = json.loads((ROOT / 'data/routes.json').read_text())

def replace_article(page, title, dek, body):
    page = re.sub(r'<h1>.*?</h1>', f'<h1>{title}</h1>', page, count=1, flags=re.S)
    page = re.sub(r'<p class="dek">.*?</p>', f'<p class="dek">{dek}</p>', page, count=1, flags=re.S)
    return re.sub(r'<article class="article-body">.*?</article>', '<article class="article-body">'+body+'</article>', page, count=1, flags=re.S)

for route in routes:
    path = route['path']
    file = OUT / path.strip('/') / 'index.html'
    page = file.read_text()
    canonical = base + path
    tags = '<link rel="canonical" href="'+html.escape(canonical, quote=True)+'">'
    tags += '<meta property="og:url" content="'+html.escape(canonical, quote=True)+'">'
    tags += '<meta property="og:type" content="website"><meta property="og:site_name" content="Menopause Wash">'
    tags += '<meta name="twitter:card" content="summary">'
    page = page.replace('</head>', tags+'</head>')
    if live and path != '/not-found/':
        page = page.replace('noindex,nofollow', 'index,follow')
        page = page.replace('Private editorial concept', 'Independent product comparisons')
        page = page.replace('private editorial concept for an independent information and product-comparison site', 'independent information and product-comparison site')
        page = page.replace('This preview does not earn commissions.', 'These search links do not earn commissions.')
        page = page.replace('This preview has no health questionnaire', 'This site has no health questionnaire')
        page = page.replace('Affiliate links inactive', 'Amazon search links')
        page = page.replace('The current draft was developed with AI-assisted research', 'These guides were developed with AI-assisted research')
        page = page.replace('They are included in this private concept for reference; public commercial reuse rights have not been confirmed.', 'They identify the products discussed and do not imply endorsement by the manufacturer.')
        page = page.replace('The current concept has no active affiliate tracking or verified program enrollment.', 'The current Amazon search links do not earn commissions.')
        page = page.replace('This concept reflects a targeted check', 'This site reflects a targeted check')
    if active:
        page = page.replace('Affiliate links inactive', 'Includes affiliate links').replace('Amazon search links</span>', 'Includes affiliate links</span>')
        page = page.replace('This preview uses Amazon search links. They do not currently earn a commission.', 'Some product links earn us a commission from qualifying purchases.')
        page = page.replace('The current concept has no active affiliate tracking or verified program enrollment.', 'Some product links earn a commission from qualifying purchases. See our affiliate disclosure for details.')
    if path == '/affiliate-disclosure/':
        status = '<p>As an Amazon Associate I earn from qualifying purchases.</p><p>Some product links are affiliate links. If you buy through one of those links, we may receive a commission. The disclosure appears near shopping links as well as on this page.</p>' if active else '<p>The current buttons open ordinary Amazon searches. They do not currently earn a commission. Exact product affiliate links have not yet been connected.</p>'
        body = '<h2>How this site is funded</h2>'+status
        body += '<h2>How we choose products</h2><p>We use published product labels and source-linked community discussions. Commission rates do not determine our comparisons. We have not personally tested these products, and community experiences do not establish that a product treats menopause-related odor.</p>'
        body += '<h2>Before you buy</h2><p>Confirm the exact formula, size, seller and one-time purchase or subscription terms on Amazon. Search results can include different products and sponsored listings. Prices, availability, shipping and returns are set by the seller.</p>'
        body += '<h2>Your choices</h2><p>You can use the guides without buying anything. A product comparison does not replace medical care for a new or persistent symptom.</p>'
        dek = 'Some links may earn us a commission from qualifying purchases.' if active else 'The current Amazon search links do not earn a commission.'
        page = replace_article(page, 'Amazon links and affiliate disclosure', dek, body)
        page = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="'+dek+'">', page)
        page = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="'+dek+'">', page)
    if live and path == '/privacy/':
        owner = html.escape(settings['site_owner'])
        email = html.escape(settings['contact_email'], quote=True)
        body = '<h2>Who operates this site</h2><p>'+owner+' operates Menopause Wash. For privacy questions, contact <a href="mailto:'+email+'">'+email+'</a>.</p>'
        body += '<h2>What these pages collect</h2><p>This site has no health questionnaire, email signup, account system, advertising pixels or analytics scripts. Checklist selections stay in the current browser tab and are not submitted to us. Reloading clears them.</p>'
        body += '<h2>Hosting and fonts</h2><p>GitHub Pages serves these static pages and may process standard request information such as IP addresses. See <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub’s privacy statement</a>. Google Fonts receives requests when your browser loads the fonts. See <a href="https://policies.google.com/privacy">Google’s privacy policy</a>.</p>'
        body += '<h2>Amazon and other links</h2><p>Product and research links take you to external sites with their own privacy practices. Amazon may use information from your visit and purchase under its privacy notice. Our affiliate links identify qualifying referrals. We do not receive your payment details or medical information.</p>'
        body += '<h2>Updates</h2><p>This notice describes the current site. We will update it if we add data collection or change how the site operates.</p>'
        page = replace_article(page, 'Privacy and your information', 'How these pages, the checklist and external links handle information.', body)
    social = []
    for key, label in [('pinterest_url','Pinterest'), ('reddit_url','Our Reddit community')]:
        if settings.get(key):
            url = settings[key]
            if urlsplit(url).scheme != 'https':
                raise ValueError('Social profile links must use HTTPS')
            social.append('<a href="'+html.escape(url,quote=True)+'">'+label+'</a>')
    if social:
        page = page.replace('<h4>Behind the guides</h4>', '<h4>Behind the guides</h4>'+''.join(social))
    file.write_text(page)

(OUT / '404.html').write_text((OUT / 'not-found/index.html').read_text())
indexed = [x for x in routes if x['path'] != '/not-found/']
if live:
    sitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+html.escape(base+x['path'])+'</loc></url>' for x in indexed)+'</urlset>'
    (OUT / 'sitemap.xml').write_text(sitemap)
    (OUT / 'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+base+'/sitemap.xml\n')
else:
    (OUT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>')
    (OUT / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
(OUT / '.nojekyll').touch()
shutil.copy2(ROOT / 'CNAME', OUT / 'CNAME')
for file in OUT.rglob('*'):
    if file.is_file():
        dest = ROOT / file.relative_to(OUT)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(file, dest)
print(f'Exported {len(routes)} pages at repository root. Public: {live}. Affiliate links active: {active}.')
