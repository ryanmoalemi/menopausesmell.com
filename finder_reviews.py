"""Validate a curated, attributed review corpus and emit only display fields.

No scraping, diagnosis, anonymous reviewer invention, or Amazon text ingestion.
Source and tag evidence remain in the repository review record, not the UI payload.
"""
from datetime import date,datetime,timezone
from hashlib import sha256
from urllib.parse import urlsplit
import re

TAGS = {
 'underarms','body_folds','outer_groin','vaginal_change','urine_leakage',
 'odor','wetness','damp','clothes','chafe','rash','outside','change','urine','dryness','friction','symptoms',
 'fragrance','reactive','irritated',
 'tried:soap','tried:body_wash','tried:deodorant','tried:antiperspirant','tried:antibacterial','tried:laundry',
 'tried:pads','tried:leak_underwear','tried:vaginal_moisturizer','tried:lubricant','tried:barrier','tried:underwear','tried:powder','tried:probiotics','tried:rinse','tried:routine'
}
def normalized(text): return ' '.join(str(text).split())
def canonical_source(url):
    u=urlsplit(url)
    if u.scheme!='https' or u.hostname not in {'www.reddit.com','reddit.com','old.reddit.com'} or not re.match(r'^/r/[^/]+/comments/[a-z0-9]+/',u.path):
        raise ValueError('Review needs an HTTPS Reddit thread or comment source')
    parts=u.path.strip('/').split('/')
    base='https://www.reddit.com/'+ '/'.join(parts[:4])+'/'
    # Both /comment/id and /title/id identify the same Reddit comment.
    if len(parts)>=6 and re.fullmatch(r'[a-z0-9]+',parts[5]): return base+'comment/'+parts[5]+'/'
    return base
def fingerprint(row):
    return sha256((canonical_source(row['sourceUrl'])+'|'+normalized(row['quote']).casefold()).encode()).hexdigest()
def validate_corpus(corpus, products, today=None):
    today=today or datetime.now(timezone.utc).date()
    if corpus.get('version')!=1 or not isinstance(corpus.get('reviews'),list): raise ValueError('Invalid review corpus')
    if corpus.get('providers',{}).get('amazon',{}).get('enabled') is not False:
        raise ValueError('Amazon review text requires a separately authorized provider; it is disabled')
    ids=set(); fingerprints=set(); product_ids={p['id'] for p in products}
    for r in corpus['reviews']:
        if not re.fullmatch(r'[a-z0-9-]+',r.get('id','')) or r['id'] in ids: raise ValueError('Duplicate or invalid review id')
        ids.add(r['id'])
        if r.get('source')!='reddit': raise ValueError('Only attributed Reddit excerpts are enabled')
        if not r.get('productIds') or not set(r['productIds'])<=product_ids: raise ValueError('Unknown review product')
        if r.get('status') not in {'verified','candidate','withdrawn'}: raise ValueError('Invalid review status')
        if r.get('status')!='verified': continue
        if r.get('productScope') not in {'exact','family'}: raise ValueError('Unknown product scope')
        if r['productScope']=='family' and not r.get('productScopeNote'): raise ValueError('Family feedback must disclose the variant gap')
        if r.get('sentiment') not in {'positive','mixed','negative','neutral'}: raise ValueError('Invalid sentiment')
        if r.get('reportType') not in {'experience','recommendation'}: raise ValueError('Review type required')
        if r.get('sourceKind') not in {'comment','post'}: raise ValueError('Source type required')
        if r.get('sourceVerified') is not True: raise ValueError('Quote has not been verified')
        q=normalized(r.get('quote','')); evidence=normalized(r.get('sourceText',''))
        if not q or len(q.split())>55 or len(q)>600 or q not in evidence: raise ValueError('Quote must be a short verbatim source excerpt')
        if re.search(r'(?i)(https?://|<script|<iframe)',q): raise ValueError('Quote cannot carry links or markup')
        checked=date.fromisoformat(r['checkedAt'])
        if checked>today: raise ValueError('Future review check date')
        if r.get('postedAt') and date.fromisoformat(r['postedAt'])>today: raise ValueError('Future post date')
        if r.get('sourceLocator') not in {'comment_permalink','thread_excerpt'}: raise ValueError('Source locator required')
        canonical_source(r['sourceUrl'])
        tags=r.get('tags',[])
        if not isinstance(tags,list) or len(tags)!=len(set(tags)) or not set(tags)<=TAGS: raise ValueError('Invalid review tags')
        for tag in tags:
            proof=normalized(r.get('tagEvidence',{}).get(tag,''))
            if not proof or proof not in evidence: raise ValueError('Each review tag requires verbatim source support: '+tag)
        f=fingerprint(r)
        if f in fingerprints: raise ValueError('Duplicate source excerpt')
        fingerprints.add(f)
    return corpus

def public_corpus(corpus,products,today=None):
    today=today or datetime.now(timezone.utc).date();validate_corpus(corpus,products,today)
    fields=['id','source','sourceUrl','sourceKind','sourceLocator','productIds','productScope','productScopeNote','quote','context','community','author','postedAt','checkedAt','sentiment','reportType','tags']
    # Recheck weekly. A prolonged access outage must not imply fresh verification.
    reviews=[{k:r[k] for k in fields if k in r} for r in corpus['reviews'] if r['status']=='verified' and r['sentiment']=='positive' and 0<=(today-date.fromisoformat(r['checkedAt'])).days<=56]
    return {'version':1,'updatedAt':corpus['updatedAt'],'maxAgeDays':56,'reviews':reviews}
