// Topic matching runs only in the shopper's tab. No health answers leave the page.
export const REVIEW_TAG_LABELS={underarms:'Underarms',body_folds:'Body or skin folds',outer_groin:'Outside groin skin',vaginal_change:'Intimate care',urine_leakage:'Bladder leaks',odor:'Body odor',wetness:'Sweating',damp:'Damp skin',clothes:'Odor in clothes',chafe:'Chafing',rash:'Skin irritation',outside:'Outside skin',change:'Changes in odor or discharge',urine:'Bladder leaks',dryness:'Vaginal dryness',friction:'Friction during sex',symptoms:'Intimate discomfort',fragrance:'Fragrance sensitivity',reactive:'Sensitive skin',irritated:'Irritated skin','tried:soap':'Tried soap','tried:body_wash':'Tried body wash','tried:deodorant':'Tried deodorant','tried:antiperspirant':'Tried antiperspirant','tried:antibacterial':'Tried antibacterial wash','tried:laundry':'Tried laundry changes','tried:pads':'Tried pads or liners','tried:leak_underwear':'Tried absorbent underwear','tried:vaginal_moisturizer':'Tried moisturizer','tried:lubricant':'Tried lubricant','tried:barrier':'Tried barrier ointment','tried:underwear':'Tried different underwear','tried:powder':'Tried powder','tried:probiotics':'Tried probiotics','tried:rinse':'Tried water rinsing','tried:routine':'Tried home remedies'};
export function reviewTopics(a){
 const tags=new Map();
 if(REVIEW_TAG_LABELS[a.area])tags.set(a.area,3);
 for(const c of a.concerns){
  if(c==='both'){tags.set('odor',5);tags.set('wetness',5);}
  else if(REVIEW_TAG_LABELS[c])tags.set(c,5);
 }
 // The body-area question already asks where odor is noticed; clothes is an additional concern.
 if(a.concerns.includes('clothes'))tags.set('odor',5);
 if(a.area==='urine_leakage')tags.set('urine',5);
 for(const s of a.sensitivities)if(REVIEW_TAG_LABELS[s])tags.set(s,6);
 for(const t of a.triedCategories||[])if(REVIEW_TAG_LABELS['tried:'+t])tags.set('tried:'+t,4);
 return tags;
}
export function reviewsForProduct(a,product,data,now=Date.now()){
 if(data?.version!==1||!Array.isArray(data.reviews))return [];
 const topics=reviewTopics(a),seen=new Set();
 const candidates=data.reviews.filter(r=>{
  if(r.source!=='reddit'||!Array.isArray(r.productIds)||!r.productIds.includes(product.id)||!['exact','family'].includes(r.productScope)||!r.quote||!Array.isArray(r.tags))return false;
  let u;try{u=new URL(r.sourceUrl);}catch{return false;}
  if(u.protocol!=='https:'||u.hostname!=='www.reddit.com')return false;
  const age=now-Date.parse(r.checkedAt+'T00:00:00Z');
  if(!Number.isFinite(age)||age<0||age>Math.min(data.maxAgeDays||56,56)*86400000)return false;
  if(r.productScope==='family'&&!r.productScopeNote)return false;
  const key=r.sourceUrl+'|'+r.quote.trim().toLowerCase();if(seen.has(key))return false;seen.add(key);return true;
 }).map(r=>{
  const matchedTags=[...new Set(r.tags)].filter(t=>topics.has(t));
  const score=matchedTags.reduce((sum,t)=>sum+topics.get(t),0);
  return {...r,matchedTags,score};
 }).sort((x,y)=>y.score-x.score||Number(y.productScope==='exact')-Number(x.productScope==='exact')||String(y.postedAt||'').localeCompare(x.postedAt||'')||x.id.localeCompare(y.id));
 return candidates;
}
export function featuredReviews(matches,limit=1){
 // This is an explicitly selected positive-experience display, not a review summary.
 // Mixed and negative records remain in the editorial corpus for product assessment.
 return matches.filter(r=>r.sentiment==='positive').slice(0,Math.max(0,limit));
}
