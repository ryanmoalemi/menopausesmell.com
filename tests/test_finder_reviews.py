import copy,json,unittest
from datetime import date
from pathlib import Path
from finder_reviews import validate_corpus,public_corpus
from scripts.import_finder_reviews import merge_reviews
ROOT=Path(__file__).resolve().parents[1]
TODAY=date(2026,11,15)
class Reviews(unittest.TestCase):
 def setUp(self):
  self.products=json.loads((ROOT/'data/finder-products.json').read_text())
  self.corpus=json.loads((ROOT/'data/finder-reviews.json').read_text())
  self.today=max(TODAY,max(date.fromisoformat(r['checkedAt']) for r in self.corpus['reviews']))
 def test_import_is_idempotent(self):
  _,s=merge_reviews(self.corpus,{'reviews':self.corpus['reviews']},self.products,self.today)
  self.assertEqual((s['added'],s['updated']),(0,0))
 def test_quote_and_topic_evidence_required(self):
  for field,value in [('quote','A fabricated testimonial'),('tagEvidence',{}),('sourceVerified',False)]:
   c=copy.deepcopy(self.corpus);c['reviews'][0][field]=value
   with self.assertRaises(ValueError):validate_corpus(c,self.products,self.today)
 def test_amazon_text_import_is_disabled(self):
  c=copy.deepcopy(self.corpus);c['reviews'][0]['source']='amazon'
  with self.assertRaises(ValueError):validate_corpus(c,self.products,self.today)
  c=copy.deepcopy(self.corpus);c['providers']['amazon']['enabled']=True
  with self.assertRaises(ValueError):validate_corpus(c,self.products,self.today)
 def test_same_excerpt_cannot_be_duplicated_by_new_id(self):
  r=copy.deepcopy(self.corpus['reviews'][0]);r['id']='new-id'
  _,s=merge_reviews(self.corpus,{'reviews':[r]},self.products,self.today)
  self.assertEqual(s['duplicates'],1);self.assertEqual(s['added'],0)
 def test_review_id_cannot_silently_switch_source(self):
  r=copy.deepcopy(self.corpus['reviews'][0]);r['sourceUrl']='https://www.reddit.com/r/Menopause/comments/other/'
  with self.assertRaisesRegex(ValueError,'change its source'):merge_reviews(self.corpus,{'reviews':[r]},self.products,self.today)
 def test_public_payload_contains_only_selected_positive_excerpts(self):
  public=public_corpus(self.corpus,self.products,self.today)
  self.assertTrue(public['reviews'])
  for r in public['reviews']:
   self.assertEqual(r['sentiment'],'positive')
   for field in ['sourceText','tagEvidence','retrievalRefs','sourceContextTexts']:self.assertNotIn(field,r)
 def test_withdrawn_and_stale_records_do_not_publish(self):
  c=copy.deepcopy(self.corpus)
  for r in c['reviews']:r['status']='withdrawn'
  self.assertEqual(public_corpus(c,self.products,self.today)['reviews'],[])
  self.assertEqual(public_corpus(self.corpus,self.products,date(2099,1,1))['reviews'],[])
