"""Build the isolated, memory-only product finder. Disabled for public builds by default."""
from pathlib import Path
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parent
ROUTE = {"path": "/product-finder/", "title": "Find your next step", "description": "A few questions to find a useful next step."}

def build_finder(out, preview=False, *, root=ROOT, settings=None, products=None):
    settings = settings if settings is not None else json.loads((root / 'data/finder-settings.json').read_text())
    products = products if products is not None else json.loads((root / 'data/finder-products.json').read_text())
    target = out / 'product-finder'
    if target.exists():
        shutil.rmtree(target)
    if not preview and not settings.get('enabled'):
        return False
    if not preview:
        if not settings.get('release_approved'):
            raise ValueError('Finder release has not been approved')
        if any(not p.get('imageRightsVerified') for p in products):
            raise ValueError('Finder product image permissions remain unverified')
        if any(p.get('candidate') and (not p.get('labelVerified') or not p.get('publishEligible')) for p in products):
            raise ValueError('Finder recommendation eligibility remains unverified')
    shutil.copytree(root / 'finder_src', target)
    (target / 'catalog.json').write_text(json.dumps(products, indent=2) + '\n')
    (target / 'config.json').write_text(json.dumps({'preview': preview, 'tracking_id': settings['tracking_id']}) + '\n')
    engine_version = hashlib.sha256((target / 'engine.mjs').read_bytes()).hexdigest()[:12]
    app = target / 'app.mjs'
    app.write_text(app.read_text().replace("'./engine.mjs'", f"'./engine.mjs?v={engine_version}'"))
    page = (target / 'index.html').read_text()
    for name in ['finder.css', 'app.mjs']:
        version = hashlib.sha256((target / name).read_bytes()).hexdigest()[:12]
        page = page.replace(f'./{name}"', f'./{name}?v={version}"')
    if not preview:
        page = page.replace('noindex,nofollow', 'index,follow')
    (target / 'index.html').write_text(page)
    if preview:
        review = out / '__review'
        review.mkdir(exist_ok=True)
        shutil.copy2(root / 'tests/fixtures/finder-responsive-review.html', review / 'index.html')
    home = out / 'index.html'
    if home.exists():
        page = home.read_text().replace('</h1>', '</h1><p><a class="button" href="/product-finder/">Find my next step</a></p>', 1)
        home.write_text(page)
    return True
