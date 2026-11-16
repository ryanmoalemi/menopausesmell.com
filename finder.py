"""Build the isolated, memory-only product finder. Publication and product eligibility are explicit settings."""
from pathlib import Path
import hashlib
import json
import re
import shutil
from finder_reviews import public_corpus

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
        for product in products:
            asset = (root / product['image'].lstrip('/')).resolve()
            if not asset.is_relative_to(root.resolve()) or not asset.is_file():
                raise ValueError('Finder product image file is missing or outside the site')
            # Launch approval permits reusing existing user-provided site assets.
            # It does not certify a third-party license. Keep that status separate.
            same_existing_asset = (
                settings.get('reuse_existing_site_images')
                and product.get('existingAssetSha256') == hashlib.sha256(asset.read_bytes()).hexdigest()
            )
            # Exact manufacturer photos requested for product identification.
            # Provenance is recorded separately from a verified commercial license.
            photo = settings.get('source_product_photos', {}).get(product['id'], {})
            same_source_photo = (
                photo.get('source') == product.get('imageSource')
                and photo.get('sha256') == hashlib.sha256(asset.read_bytes()).hexdigest()
                and product.get('sourcePhotoSha256') == photo.get('sha256')
            )
            if not product.get('imageRightsVerified') and not same_existing_asset and not same_source_photo:
                raise ValueError('Finder image needs verified rights or approved existing site asset provenance')
        if any((p.get('candidate') or p.get('browseEligible')) and (not p.get('labelVerified') or not p.get('publishEligible')) for p in products):
            raise ValueError('Finder recommendation eligibility remains unverified')
    shutil.copytree(root / 'finder_src', target)
    corpus=json.loads((root / 'data/finder-reviews.json').read_text())
    (target / 'reviews.json').write_text(json.dumps(public_corpus(corpus,products),indent=2,ensure_ascii=False)+'\n')
    (target / 'catalog.json').write_text(json.dumps(products, indent=2) + '\n')
    measurement_id='' if preview else json.loads((root/'data/search-services.json').read_text()).get('ga4_measurement_id','')
    if measurement_id and not re.fullmatch(r'G-[A-Z0-9]+',measurement_id):
        raise ValueError('Invalid finder measurement ID')
    (target / 'config.json').write_text(json.dumps({'preview': preview, 'tracking_id': settings['tracking_id'], 'measurement_id': measurement_id}) + '\n')
    metrics=target/'metrics-frame.js'
    metrics.write_text(metrics.read_text().replace('__MEASUREMENT_ID__',measurement_id))
    engine_version = hashlib.sha256((target / 'engine.mjs').read_bytes()).hexdigest()[:12]
    app = target / 'app.mjs'
    app.write_text(app.read_text().replace("'./engine.mjs'", f"'./engine.mjs?v={engine_version}'"))
    metrics_version=hashlib.sha256((target/'metrics.mjs').read_bytes()).hexdigest()[:12]
    app.write_text(app.read_text().replace("'./metrics.mjs'",f"'./metrics.mjs?v={metrics_version}'"))
    review_version=hashlib.sha256((target/'reviews.mjs').read_bytes()).hexdigest()[:12]
    app.write_text(app.read_text().replace("'./reviews.mjs'",f"'./reviews.mjs?v={review_version}'"))
    page = (target / 'index.html').read_text()
    for name in ['finder.css', 'app.mjs']:
        version = hashlib.sha256((target / name).read_bytes()).hexdigest()[:12]
        page = page.replace(f'./{name}"', f'./{name}?v={version}"')
    if not preview:
        page = page.replace('noindex,nofollow', 'index,follow')
        base = json.loads((root / 'data/site-settings.json').read_text())['public_base_url'].rstrip('/')
        page = page.replace('</head>', f'<link rel="canonical" href="{base}/product-finder/"><meta property="og:url" content="{base}/product-finder/"></head>')
    (target / 'index.html').write_text(page)
    if preview:
        review = out / '__review'
        review.mkdir(exist_ok=True)
        shutil.copy2(root / 'tests/fixtures/finder-responsive-review.html', review / 'index.html')
    for site_page in out.rglob('index.html'):
        if site_page.is_relative_to(target) or '__review' in site_page.parts:
            continue
        page = site_page.read_text()
        page = page.replace('<a class="nav-cta" href="/external-washes/">Compare washes</a>', '<a class="nav-cta" href="/product-finder/">Product finder</a>')
        page = page.replace('<h4>Find your next step</h4>', '<h4>Find your next step</h4><a href="/product-finder/">Find a starting point for you</a>')
        if site_page == out / 'index.html':
            anchor = '<p class="journey-dek">Understand odor changes, explore care options, and compare products.</p>'
            page = page.replace(anchor, anchor + '<div class="actions"><a class="btn" href="/product-finder/">Find my next step</a></div><p class="note-small">Answer a few questions to get care tips and product options for your situation.</p>', 1)
        site_page.write_text(page)
    return True
