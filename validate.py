"""Check generated routes, links, product assets and page structure."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json

ROOT = Path(__file__).resolve().parent
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.h1 = 0
        self.links = []
        self.ids = set()
        self.images = []
        self.feed(text)
    def handle_starttag(self, tag, pairs):
        a = dict(pairs)
        self.h1 += tag == 'h1'
        if a.get('id'): self.ids.add(a['id'])
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
        if tag == 'img': self.images.append(a)

routes = json.loads((ROOT / 'data/routes.json').read_text())
pages = {r['path']: Page((ROOT/r['path'].strip('/')/'index.html').read_text()) for r in routes}
errors = []
for path, page in pages.items():
    if page.h1 != 1: errors.append(f'{path}: {page.h1} H1 elements')
    for image in page.images:
        if not image.get('alt'): errors.append(f'{path}: missing image alt')
        if image.get('src','').startswith('/') and not (ROOT/image['src'].lstrip('/')).is_file():
            errors.append(f'{path}: missing image {image["src"]}')
    for href in page.links:
        url = urlsplit(href)
        if url.scheme or url.netloc: continue
        target = url.path or path
        if target in pages:
            if url.fragment and unquote(url.fragment) not in pages[target].ids:
                errors.append(f'{path}: missing anchor {href}')
        elif not (ROOT/target.lstrip('/')).is_file():
            errors.append(f'{path}: missing route {href}')
    if not any('amazon.com' in x or 'amzn.to' in x or x in ['/external-washes/','/probiotics/'] for x in page.links):
        errors.append(f'{path}: no relevant comparison/shopping route')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages, one H1 each, valid internal links and anchors, image files and alt text, comparison paths.')
