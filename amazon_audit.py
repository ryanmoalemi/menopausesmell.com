"""Fail a build if any shopping link is a search, shortlink, wrong tag or wrong product."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
import json
import re

TAG='menopausewash-20'
def direct_asin(url):
    parts=urlsplit(url)
    match=re.fullmatch(r'/dp/(B[A-Z0-9]{9})',parts.path)
    if parts.scheme!='https' or parts.netloc!='www.amazon.com' or not match or parts.fragment or parse_qs(parts.query)!= {'tag':[TAG]}:
        raise ValueError(f'Expected a tagged direct Amazon product URL: {url}')
    return match[1]

def audit_site(directory,ledger=None):
    directory=Path(directory)
    ledger=ledger or json.loads((Path(__file__).parent/'data/amazon-commerce.json').read_text())
    links=[]
    class ShoppingLinks(HTMLParser):
        def handle_starttag(self,tag,attrs):
            if tag!='a':return
            a=dict(attrs);url=a.get('href','');host=urlsplit(url).hostname or ''
            if host in {'www.amazon.com','amazon.com','amzn.to'}:
                asin=direct_asin(url);pid=a.get('data-product-id')
                if pid:
                    expected=ledger['products'][pid]
                    if asin!=expected['asin']:raise ValueError(f'{pid}: wrong product on {page}')
                links.append({'page':str(page.relative_to(directory)),'product':pid,'asin':asin,'url':url})
    for page in sorted(directory.rglob('*.html')):
        if '__review' in page.parts:continue
        ShoppingLinks().feed(page.read_text())
    catalog=json.loads((directory/'product-finder/catalog.json').read_text())
    active=[p for p in catalog if (p.get('candidate') or p.get('browseEligible')) and p.get('publishEligible')]
    for p in active:
        if not p.get('exactListingVerified'):raise ValueError(f"{p['id']}: unverified listing")
        direct_asin(f"https://www.amazon.com/dp/{p.get('asin','')}?tag={TAG}")
        if p['id'] in ledger['products'] and ledger['products'][p['id']]['asin']!=p['asin']:
            raise ValueError(f"{p['id']}: finder and comparison disagree")
    result={'static_shopping_links':len(links),'static_pages':len({x['page'] for x in links}),'active_finder_products':len(active),'search_links':0,'unique_active_destinations':len({x['asin'] for x in links}|{p['asin'] for p in active}),'links':links}
    return result

if __name__=='__main__':
    import sys
    result=audit_site(sys.argv[1] if len(sys.argv)>1 else 'dist')
    print(json.dumps(result,indent=2))
