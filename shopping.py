"""Preference-led shopping guidance, with customer reports kept separate from label facts."""
from pathlib import Path
import html,json,re
from quote_visual import visual_quote
E=html.escape
ROOT=Path(__file__).parent

WASH_FACTS={
 'mirai-unscented-bar':[
  ('Format','Soap bar · 3.5 oz'),('Scent','Unscented; no added fragrance listed'),
  ('Key ingredients','Persimmon tannin, green tea, glycerin'),('Use on','Body skin; rinse off'),
  ('Main tradeoff','A bar may leave some skin dry or irritated.'),('Feedback','Mirai family: 3 rated Reddit threads; formats mixed.')],
 'lume-unscented-wash':[
  ('Format','Liquid body wash'),('Scent','Unscented; no fragrance on reviewed label'),
  ('Key ingredients','Mandelic acid, citric acid, glycerin'),('Use on','Body skin; rinse off'),
  ('Main tradeoff','Acids can irritate; follow label sun precautions.'),('Feedback','Lume cleanser family: 7 rated Reddit threads; formulas mixed.')],
 'mirai-persimmon-body-wash':[
  ('Format','Liquid · reviewed bottle 9.3 fl oz'),('Scent','Contains aromatic botanicals'),
  ('Key ingredients','Persimmon extract, grapefruit peel oil'),('Use on','Body skin; rinse off'),
  ('Main tradeoff','Not our first fit if you avoid scented ingredients.'),('Feedback','Mirai family: 3 rated Reddit threads; formats mixed.')],
}

def facts(rows):
 return '<dl class="shopping-facts">'+''.join(f'<div><dt>{E(k)}</dt><dd>{E(v)}</dd></div>' for k,v in rows)+'</dl>'

def wash_facts(pid):
 return facts(WASH_FACTS.get(pid,[]))

SUPPLEMENTS={
 'uro-capsules':dict(name='URO Vaginal Probiotic Capsules',image='uro-capsules.webp',fit='The formula in our capsule review',reason='Choose capsules if you want to compare the URO formula discussed in our capsule review and are comfortable swallowing pills.',rows=[('Format','60 oral capsules · 30 label servings'),('Daily label serving','2 capsules'),('What is in it','4 Lactobacillus species · 5 billion CFU'),('Also contains','XOS prebiotic · 400 mg'),('Taste','Unflavored'),('Main tradeoff','Two capsules daily; customer results vary.')]),
 'uro-gummies':dict(name='URO Vaginal Probiotic Gummies',image='uro-gummy.webp',fit='Prefer a chewable?',reason='Choose this format if swallowing pills puts you off. It has a different formula, so capsule reviews do not describe the gummies.',rows=[('Format','60 Pink Pineapple gummies · 30 label servings'),('Daily label serving','2 gummies'),('What is in it','B. coagulans SNZ 1969 · 1 billion CFU'),('Also contains','Vitamins C and D3; fruit ingredients'),('Taste','Pink Pineapple · contains added sugar'),('Main tradeoff','Different bacteria from capsules; check other vitamin intake.')]),
}

def supplement_card(pid,compact=False):
 from commerce import amazon
 p=SUPPLEMENTS[pid]
 link='/probiotics/uro-capsules/' if pid=='uro-capsules' else '/gummies-vs-capsules/'
 return f'''<article class="supplement-choice" id="{pid}"><div class="supplement-choice-top"><a href="{link}"><img src="/assets/{p['image']}" alt="{p['name']} packaging" width="160" height="200"></a><div><span class="eyebrow">{p['fit']}</span><h2>{p['name']}</h2></div></div><p>{p['reason']}</p>{facts(p['rows'])}<div class="supplement-actions">{amazon(pid,'supplement_choice')}<a href="{link}">{'Full capsule review' if pid=='uro-capsules' else 'Compare the two formulas'}</a></div></article>'''

def reviews():
 from commerce import amazon
 data=json.loads((ROOT/'data/customer-review-research.json').read_text())
 cards=''
 for q in data['selected_quotes']:
  attribution=E(q['author'])+' · '+E(q['source_label'])+'<span class="review-date">'+E(q['date_label'])+'</span>'
  cards+='<article class="review-example"><span class="eyebrow">'+E(q['heading'])+'</span>'+visual_quote(q['text'],attribution,q['photo'],cite=q['url']).replace('quoted Reddit commenter','quoted reviewer')+'</article>'
 return '''<section class="customer-reviews" id="customer-reviews"><div class="section-heading"><div><span class="eyebrow">URO capsules</span><h2>What customers actually noticed</h2></div></div><p>Some customers describe less odor and feeling fresher. Others question the value or say it did not suit them.</p><div class="review-examples">'''+cards+'''</div><p class="review-balance">On O Positiv’s website, reviewers who describe themselves as menopausal also report improvements in odor or comfort. In a separate r/Menopause thread, users reported burning or itching while taking URO. These reports cannot tell us whether the supplement caused either change.</p><p class="note-small">Selected examples, not a representative survey or a star rating. Amazon reviews were accessed through Woot’s indexed republication; menopause testimonials are hosted by the brand. <a href="/sources/#customer-reviews">Review sources</a>.</p><div class="review-actions">'''+amazon('uro-capsules','after_customer_reviews')+'''<a href="/gummies-vs-capsules/">Compare with gummies</a></div></section>'''

def supplement_care():
 return '''<aside class="supplement-care"><strong>Keep the next step simple.</strong> These are optional oral supplements, never products to insert. A new or persistent vaginal odor, unusual discharge, itching or pain needs medical advice. Reviews do not establish a treatment for menopause-related odor. Check with your clinician before use if you take medicines or have a medical condition.</aside>'''

def secondary_supplements():
 from commerce import amazon
 return f'''<details class="other-discussed"><summary>Already comparing repHresh or Good Girl?<small>Two other capsule labels, with different formulas.</small></summary><div class="secondary-supplements"><article><img src="/assets/rephresh.webp" alt="repHresh Pro-B capsules" width="85" height="110" loading="lazy"><h3>repHresh Pro-B</h3><p>A capsule option if named strain identifiers matter to you: L. rhamnosus GR-1 and L. reuteri RC-14. The label lists 5 billion CFU per serving.</p>{amazon('rephresh-pro-b','secondary_supplement')}</article><article><img src="/assets/love-probiotic.webp" alt="Love Wellness Good Girl Probiotics" width="85" height="110" loading="lazy"><h3>Love Wellness Good Girl</h3><p>A different capsule blend with 1 billion CFU per serving. More species on a label does not by itself mean better results.</p>{amazon('love-good-girl','secondary_supplement')}</article></div><p class="note-small">Additional label comparisons. The URO reviews above do not apply to these products.</p></details>'''

def supplements_page(old):
 from commerce import disclosure
 evidence=re.search(r'<details class="label-details research-details">.*?</details>',old,re.S)
 detail=evidence.group(0) if evidence else ''
 return '''<div class="wrap shopping-page"><header class="shopping-head"><span class="eyebrow">Customer experiences · Capsule and gummy comparison</span><h1>Considering probiotics for vaginal odor?</h1><p class="dek">See what customers noticed, then compare the formula and format that fit your routine.</p></header><nav class="supplement-jumps" aria-label="Choose your probiotic format"><a href="#uro-capsules"><img src="/assets/uro-capsules.webp" alt="URO capsule bottle" width="95" height="120"><strong>Prefer capsules?</strong><span>The formula in the reviews</span></a><a href="#uro-gummies"><img src="/assets/uro-gummy.webp" alt="URO Pink Pineapple gummy bottle" width="95" height="120"><strong>Prefer a chewable?</strong><span>Different formula, added vitamins</span></a></nav><p class="reviews-jump"><a href="#customer-reviews">Read what customers noticed</a></p>'''+disclosure()+'<div class="supplement-choices">'+supplement_card('uro-capsules')+supplement_card('uro-gummies')+'</div>'+reviews()+supplement_care()+secondary_supplements()+detail+'</div>'

def capsule_page():
 from commerce import amazon,disclosure
 p=SUPPLEMENTS['uro-capsules']
 return f'''<div class="wrap shopping-page"><div class="breadcrumbs"><a href="/probiotics/">Probiotic comparison</a> / URO capsules</div><section class="capsule-hero"><img src="/assets/uro-capsules.webp" alt="URO Vaginal Probiotic Capsules, 60 count" width="320" height="400"><div><span class="eyebrow">For readers who prefer capsules</span><h1>URO capsules: what customers say</h1><p class="dek">Customers describe changes in odor and freshness, alongside mixed results. Here is the exact formula behind those reviews.</p><p><strong>Best fit if:</strong> you want an unflavored oral capsule and are comfortable with two capsules per label serving.</p>{disclosure()}{amazon('uro-capsules','capsule_hero')}</div></section><section class="capsule-facts"><h2>What you are buying</h2>{facts(p['rows'])}<p class="note-small">CFU measures live microorganisms. A bigger number does not establish a better result. Label facts checked November 13, 2026.</p></section>{reviews()}{supplement_care()}<section class="capsule-next"><div><h2>Would you rather chew a gummy?</h2><p>URO gummies are Pink Pineapple flavored and use a different probiotic, with vitamins C and D3. Choose based on the format and ingredients you want.</p><a class="btn secondary" href="/gummies-vs-capsules/">Compare capsules and gummies</a></div><img src="/assets/uro-gummy.webp" alt="URO Pink Pineapple gummies" width="140" height="180" loading="lazy"></section></div>'''

def gummy_page():
 from commerce import disclosure
 return '''<div class="wrap shopping-page"><header class="shopping-head"><span class="eyebrow">One brand · Two different formulas</span><h1>URO gummies or capsules?</h1><p class="dek">Choose capsules for an unflavored Lactobacillus blend, or gummies if you prefer a flavored chewable. Here is what changes besides the format.</p></header>'''+disclosure()+'<div class="supplement-choices">'+supplement_card('uro-capsules')+supplement_card('uro-gummies')+'''</div><section class="shopping-short-answer"><h2>Which would I start with?</h2><p><strong>For the formula discussed in our customer-review section:</strong> capsules. <strong>For avoiding pills:</strong> gummies. Neither the CFU count nor the format tells us which will work better for you.</p><a href="/probiotics/uro-capsules/#customer-reviews">Read the capsule experiences</a></section>'''+supplement_care()+'''<details class="label-details"><summary>Full ingredient differences</summary><p>Capsules: four Lactobacillus species in a 50 mg blend, 5 billion CFU, plus 400 mg XOS. Other ingredients include maltodextrin, a vegetarian cellulose capsule and natural color.</p><p>Gummies: B. coagulans SNZ 1969 in a 135 mg blend with pineapple and sea-buckthorn powders, 1 billion CFU, vitamin C 45 mg and vitamin D3 50 mcg. Other ingredients include tapioca syrup, sugar, pectin and natural flavor.</p><p>Both labels list two units per serving and 30 servings per 60-count bottle. Follow the current label; these facts are for comparison.</p></details></div>'''

def refine(path,title,description,content):
 if path=='/probiotics/':
  return 'Probiotics for vaginal odor: customer reviews and options','Compare URO capsules and gummies by customer experiences, format, ingredients and tradeoffs.',supplements_page(content)
 if path=='/probiotics/uro-capsules/':
  return 'URO capsules: customer reviews, ingredients and buying guide','Read positive and mixed customer experiences, check the capsule formula and compare Amazon options.',capsule_page()
 if path=='/gummies-vs-capsules/':
  return 'URO gummies vs capsules: which format fits you?','Compare URO capsules and Pink Pineapple gummies by formula, format, serving and tradeoff.',gummy_page()
 if path=='/sources/':
  content+='''<div class="wrap"><section class="customer-source-list" id="customer-reviews"><h2>Customer-review sources</h2><p>Checked November 13, 2026. Selected examples, not a complete or representative review sample.</p><ul><li>Amazon customer reviews republished by Woot for ASIN B0D5FZGY8W: Brianna Whittington, October 14, 2026, and Vinerrr, August 16, 2026. Accessed in indexed Woot text; the live Amazon page was unavailable.</li><li>O Positiv, Vaginal Health Aid: brand-hosted testimonials from reviewers identifying themselves as menopausal. These are not independent clinical evidence.</li><li>r/Menopause, “URO probiotics side effects,” January 19, 2025, with later replies: self-reported symptoms, not verified causation.</li><li>O Positiv official capsule and Pink Pineapple gummy labels: format, serving size and ingredient comparisons.</li></ul><p>Illustrative portraits do not depict the reviewers. Original URLs and excerpts are kept in our research records.</p></section></div>'''
 return title,description,content
