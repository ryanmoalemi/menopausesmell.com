#!/usr/bin/env python3
"""Import a source-checked JSON batch, with dry-run default and atomic write.

Example: python scripts/import_finder_reviews.py /tmp/batch.json --write
Amazon text is intentionally unsupported. Do not pipe search snippets into this tool.
"""
import argparse,json,sys,os,tempfile
from datetime import date,datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from finder_reviews import validate_corpus,fingerprint

def merge_reviews(current,batch,products,today=None):
    today=today or datetime.now(timezone.utc).date()
    validate_corpus(current,products,today)
    incoming=batch.get('reviews')
    if not isinstance(incoming,list):raise ValueError('Import needs a reviews array')
    # Validate the complete incoming batch before changing a byte.
    validate_corpus({**current,'reviews':incoming},products,today)
    rows={r['id']:r for r in current['reviews']};added=updated=duplicates=0
    seen={fingerprint(r):r['id'] for r in current['reviews'] if r.get('status')=='verified'}
    for r in incoming:
        if r['id'] in rows:
            if rows[r['id']]['sourceUrl']!=r['sourceUrl']:raise ValueError('A review ID cannot change its source')
            if rows[r['id']]!=r:rows[r['id']]=r;updated+=1
        elif r.get('status')=='verified' and fingerprint(r) in seen:duplicates+=1
        else:
            rows[r['id']]=r;added+=1
            if r.get('status')=='verified':seen[fingerprint(r)]=r['id']
    merged={**current,'updatedAt':today.isoformat(),'reviews':list(rows.values())}
    validate_corpus(merged,products,today)
    return merged,{'added':added,'updated':updated,'duplicates':duplicates,'total':len(rows)}

def main():
    p=argparse.ArgumentParser();p.add_argument('batch',type=Path);p.add_argument('--write',action='store_true');a=p.parse_args()
    path=ROOT/'data/finder-reviews.json'
    current=json.loads(path.read_text());batch=json.loads(a.batch.read_text());products=json.loads((ROOT/'data/finder-products.json').read_text())
    merged,summary=merge_reviews(current,batch,products)
    if a.write and (summary['added'] or summary['updated']):
        fd,tmp=tempfile.mkstemp(prefix='.reviews-',dir=path.parent,text=True)
        try:
            with os.fdopen(fd,'w') as f:json.dump(merged,f,indent=2,ensure_ascii=False);f.write('\n')
            os.replace(tmp,path)
        finally:
            if os.path.exists(tmp):os.unlink(tmp)
    print(json.dumps({**summary,'written':bool(a.write and (summary['added'] or summary['updated']))}))
if __name__=='__main__':main()
