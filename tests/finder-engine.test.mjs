import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {freshAnswers, changeArea, toggleExclusive, careReason, routeAfterConcern, routeAfterSensitivity, eligibleProducts, resultFor, amazonURL, validateCatalog, finderPath, ALLERGENS, CONCERNS, triedOptions, TRIED_CATEGORIES,resultIntro,careMessage,historyMessage,hasSkinWarning,hasIntimateWarning} from '../finder_src/engine.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/finder-products.json',import.meta.url)));
const a=(patch={})=>({...freshAnswers(),area:'underarms',concerns:['odor'],sensitivities:['reactive'],tried:['lume-unscented-wash'],...patch});
const result=patch=>resultFor(a(patch),catalog,true);
test('reactive underarm odor gets an odor product and no filler alternatives',()=>{const r=result();assert.equal(r.primary.id,'vanicream-deodorant');assert.equal(r.alternatives.length,0);});
test('odor gets a specific deodorant',()=>assert.equal(result({sensitivities:['none']}).primary.category,'deodorant'));
test('wetness and both do not receive a cleanser',()=>{for(const c of ['wetness','both'])assert.equal(result({concerns:[c]}).primary.category,'antiperspirant');});
test('rash continues to preferences and a gentle comfort product',()=>{const x=a({area:'body_folds',concerns:['rash']});assert.equal(routeAfterConcern(x),'sensitivity');const r=resultFor(x,catalog);assert.equal(r.care,'skin');assert.equal(r.primary.category,'cloth');});
test('irritated skin keeps the photo picker in the flow',()=>assert.equal(routeAfterSensitivity(a({sensitivities:['irritated']})),'tried'));
test('no suitable bar uses a non-cleanser comfort option without relaxing skin preferences',()=>{const r=result({area:'body_folds',format:'bar'});assert.equal(r.kind,'product');assert.notEqual(r.primary.category,'cleanser');assert.equal(r.primary.gentle,true);});
test('unknown or scented fragrance status cannot pass fragrance restriction',()=>{const p=catalog.find(x=>x.candidate);for(const status of [null,false,undefined])assert.equal(eligibleProducts(a({sensitivities:['fragrance'],tried:[]}),[{...p,fragranceFree:status}],true).length,0);});
test('previous deodorant is excluded and a different routine step is offered',()=>{const r=result({tried:['vanicream-deodorant']});assert.equal(r.kind,'product');assert.notEqual(r.primary.id,'vanicream-deodorant');assert.equal(r.fallback,true);});
test('a deodorant identifier does not exclude same-brand wash',()=>{const p={...catalog[0],candidate:true,labelVerified:true,gentle:true};assert.equal(eligibleProducts(a({tried:['lume-deodorant']}),[p],true).length,1);});
test('new vaginal change gets a comfort product with a care note',()=>{const r=result({area:'vaginal_change',concerns:['change']});assert.equal(r.care,'vaginal');assert.equal(r.primary.category,'underwear');});
test('outside skin gets an optional external cleanser, distinct from vaginal symptoms',()=>{const r=result({area:'vaginal_change',concerns:['outside']});assert.equal(r.route,'external');assert.equal(r.primary.id,'vanicream-gentle-body-wash');});
test('every candidate excluded produces no match',()=>assert.equal(result({area:'body_folds',sensitivities:['none'],tried:catalog.filter(x=>x.candidate).map(x=>x.id)}).kind,'no-match'));
test('selecting an area starts fresh even when reselecting the previous area',()=>{
 const before=a({format:'bar',aluminumFree:true,allergies:['silver'],triedCategories:['soap'],unknownProduct:'old brand',routine:'old routine',reasons:{'lume-unscented-wash':['odor']}});
 for(const area of ['underarms','body_folds'])assert.deepEqual(changeArea(before,area),{...freshAnswers(),area});
 assert.deepEqual(before.allergies,['silver']);assert.deepEqual(before.triedCategories,['soap']);
});
test('None and Not sure remain exclusive',()=>{assert.deepEqual(toggleExclusive(['fragrance'],'none'),['none']);assert.deepEqual(toggleExclusive(['none'],'reactive'),['reactive']);assert.deepEqual(toggleExclusive(['none'],'none'),[]);});
test('Nothing yet excludes previously tried selections',()=>assert.deepEqual(toggleExclusive(['lume-unscented-wash'],'nothing',['nothing','unknown']),['nothing']));
test('unknown ingredient gets explicit label review without a fake safety claim',()=>{const r=result({sensitivities:['allergy'],allergies:['other']});assert.equal(r.kind,'product');assert.equal(r.allergyReview,true);});
test('vaginal symptoms select comfort care even when outside skin is also checked',()=>{const r=result({area:'vaginal_change',concerns:['outside','symptoms']});assert.equal(r.care,'vaginal');assert.equal(r.primary.category,'underwear');});
test('urine route recommends bladder pads with a care note',()=>{const r=result({area:'urine_leakage'});assert.equal(r.care,'urine');assert.equal(r.primary.category,'bladder');});
test('aluminum-free preference offers odor care without calling it sweat control',()=>{const r=result({concerns:['wetness'],aluminumFree:true});assert.equal(r.route,'odor-only');assert.equal(r.primary.category,'deodorant');assert.equal(r.primary.aluminumFree,true);});
test('capsules and gummies remain distinct exact products',()=>{const cap=catalog.find(x=>x.id==='uro-capsules'),gum=catalog.find(x=>x.id==='uro-gummies');assert.notEqual(cap.amazonQuery,gum.amazonQuery);assert.notEqual(cap.image,gum.image);});
test('uncleared preview records cannot qualify for production',()=>assert.equal(eligibleProducts(a(),catalog.map(p=>({...p,publishEligible:false})),false).length,0));
test('clothes and dampness get products for the correct job',()=>{for(const [c,category] of [['clothes','cleanser'],['damp','moisture']])assert.equal((result({area:'body_folds',concerns:[c]}).primary.category||'cleanser'),category);});
test('uncertain underarm answer has its own explanation and an odor product',()=>{const r=result({concerns:['unsure']});assert.equal(r.route,'odor-unsure');assert.equal(r.primary.category,'deodorant');});
test('Amazon parameters contain fixed product and affiliate tag only',()=>{const p={...catalog[2],exactListingVerified:false},u=new URL(amazonURL(p));assert.equal(u.hostname,'www.amazon.com');assert.deepEqual([...u.searchParams.keys()],['k','tag']);assert.equal(u.searchParams.get('tag'),'menopausewash-20');assert.equal(u.searchParams.get('k'),p.amazonQuery);});
test('invalid catalog fails separately from no-match',()=>{assert.throws(()=>validateCatalog([]));assert.throws(()=>validateCatalog([catalog[0],catalog[0]]));assert.throws(()=>validateCatalog([{...catalog[2],ingredients:null}]));});
test('finder shell and application contain no health persistence, external tracker, or simulated delay',()=>{const app=fs.readFileSync(new URL('../finder_src/app.mjs',import.meta.url),'utf8'),html=fs.readFileSync(new URL('../finder_src/index.html',import.meta.url),'utf8');assert.doesNotMatch(app,/localStorage|sessionStorage|setTimeout|setInterval|gtag\(|pushState|replaceState/);assert.doesNotMatch(html,/googletagmanager|fonts.googleapis|analytics/);assert.match(html,/no-referrer/);assert.match(html,/connect-src 'self'/);});

test('known ingredients stay excluded in every category and fallback',()=>{for(const [allergen] of ALLERGENS.filter(x=>x[0]!=='other'))for(const area of ['underarms','body_folds','outer_groin','urine_leakage','vaginal_change']){const x=a({area,sensitivities:['allergy'],allergies:[allergen]});const r=resultFor(x,catalog);assert.equal(r.kind,'product');assert.ok(r.primary.excludesIngredients.includes(allergen));for(const p of r.alternatives)assert.ok(p.excludesIngredients.includes(allergen));}});
test('tried antiperspirant stays excluded while another routine part is offered',()=>{const x=a({concerns:['both'],sensitivities:['none'],tried:['vanicream-antiperspirant']});const r=resultFor(x,catalog,true);assert.equal(r.kind,'product');assert.notEqual(r.primary.id,'vanicream-antiperspirant');assert.deepEqual(eligibleProducts(x,catalog,true,'antiperspirant'),[]);});
test('care flags cannot be bypassed with category browsing',()=>{for(const category of ['cleanser','antiperspirant','deodorant','probiotic','moisture'])assert.deepEqual(eligibleProducts(a({concerns:['rash']}),catalog,true,category),[]);});
test('underarm antiperspirant never appears for outer groin or folds',()=>{for(const area of ['outer_groin','body_folds'])assert.deepEqual(eligibleProducts(a({area}),catalog,true,'antiperspirant'),[]);});
test('probiotic is optional only, never an automatic odor or sweat match',()=>{for(const area of ['underarms','body_folds','outer_groin'])assert.notEqual(result({area}).primary?.category,'probiotic');});
test('verified Amazon listing uses exact ASIN and fixed tag only',()=>{const p=catalog.find(p=>p.id==='vanicream-antiperspirant'),u=new URL(amazonURL(p));assert.equal(u.pathname,'/dp/B01M7ZAQNN');assert.deepEqual([...u.searchParams.keys()],['tag']);assert.equal(u.searchParams.get('tag'),'menopausewash-20');});
test('unverified Amazon listing stays an explicit product search',()=>{const p={...catalog.find(p=>p.id==='vanicream-deodorant'),exactListingVerified:false},u=new URL(amazonURL(p));assert.equal(u.pathname,'/s');assert.equal(u.searchParams.get('k'),p.amazonQuery);});
test('finder has no guide or comparison exit links',()=>{for(const path of ['../finder_src/app.mjs','../finder_src/index.html']){const text=fs.readFileSync(new URL(path,import.meta.url),'utf8');assert.doesNotMatch(text,/href=["']\/(?:body-odor|underarm-products|external-washes|gentle-care|appointment-checklist|odor-and-menopause|probiotics|ingredient-labels|when-to-get-checked)/);}});

test('ordinary progress follows the four questions actually asked',()=>assert.deepEqual(finderPath(a()),['area','concern','sensitivity','tried']));
test('allergy uses the same four steps including the photo picker',()=>assert.deepEqual(finderPath(a({sensitivities:['allergy']})),['area','concern','sensitivity','tried']));
test('leakage has three real steps and other care routes have four',()=>{
 assert.deepEqual(finderPath(a({area:'urine_leakage'})),['area','sensitivity','tried']);
 assert.deepEqual(finderPath(a({area:'vaginal_change',concerns:['change']})),['area','concern','sensitivity','tried']);
 assert.deepEqual(finderPath(a({sensitivities:['irritated']})),['area','concern','sensitivity','tried']);
});
test('every ordinary area/concern and single allergy combination has a product',()=>{
 for(const area of ['underarms','body_folds','outer_groin','vaginal_change','urine_leakage','unsure']){
  const kind=area==='underarms'?'underarms':['vaginal_change','unsure'].includes(area)?'intimate':'body';
  for(const [c] of CONCERNS[kind])for(const allergy of [null,...ALLERGENS.map(x=>x[0])]){
   const x=a({area,concerns:area==='urine_leakage'?[]:[c],sensitivities:allergy?['allergy']:['none'],allergies:allergy?[allergy]:[],tried:['nothing']});
   const r=resultFor(x,catalog);assert.equal(r.kind,'product',JSON.stringify(x));assert.ok(r.primary.image);assert.equal(new URL(amazonURL(r.primary)).searchParams.get('tag'),'menopausewash-20');
  }
 }
});
test('silver and aluminum exclusions select different useful categories',()=>{
 const silver=result({area:'body_folds',concerns:['damp'],sensitivities:['allergy'],allergies:['silver']});assert.notEqual(silver.primary.id,'interdry-fabric');
 const aluminum=result({concerns:['both'],sensitivities:['allergy'],allergies:['aluminum']});assert.equal(aluminum.route,'odor-only');assert.equal(aluminum.primary.aluminumFree,true);
});
test('unverified allergy coverage never passes a specific restriction',()=>{
 const r=result({area:'urine_leakage',sensitivities:['allergy'],allergies:['adhesive']});assert.notEqual(r.primary.category,'bladder');
 assert.deepEqual(eligibleProducts(a({area:'body_folds',sensitivities:['allergy'],allergies:['lanolin']}),catalog,false,'laundry'),[]);
});
test('fresh start clears every answer and does not share mutable arrays',()=>{
 const old=a({allergies:['silver'],unknownProduct:'old brand',routine:'old routine',aluminumFree:true,format:'bar',reasons:{old:['irritated']}}),fresh=freshAnswers();
 assert.equal(fresh.area,null);for(const key of ['concerns','sensitivities','allergies','triedCategories','tried'])assert.deepEqual(fresh[key],[]);
 assert.deepEqual(fresh.reasons,{});assert.equal(fresh.unknownProduct,'');assert.equal(fresh.routine,'');assert.equal(fresh.aluminumFree,false);assert.equal(fresh.format,'any');
 fresh.concerns.push('odor');assert.deepEqual(freshAnswers().concerns,[]);assert.deepEqual(old.allergies,['silver']);
});

test('trying bar soap prioritizes a different cleanser format',()=>{const r=result({area:'body_folds',sensitivities:['none'],triedCategories:['soap']});assert.equal(r.primary.id,'vanicream-gentle-body-wash');assert.equal(r.revisitsCategory,false);});
test('broad prior history never masquerades as exact product exclusion',()=>{const r=result({concerns:['both'],triedCategories:['antiperspirant']});assert.equal(r.primary.category,'antiperspirant');assert.equal(r.revisitsCategory,true);assert.equal(r.triedCategory,'antiperspirant');});
test('category history never overrides a skin restriction',()=>{const r=result({area:'body_folds',sensitivities:['reactive'],triedCategories:['body_wash']});assert.equal(r.primary.gentle,true);assert.equal(r.revisitsCategory,true);});
test('category cards are relevant to the selected concern',()=>{assert.ok(triedOptions(a()).includes('antiperspirant'));assert.ok(!triedOptions(a()).includes('probiotics'));assert.ok(triedOptions(a({area:'vaginal_change',concerns:['change']})).includes('probiotics'));assert.ok(triedOptions(a({area:'urine_leakage'})).includes('pads'));assert.ok(triedOptions(a({area:'body_folds',concerns:['clothes']})).includes('laundry'));});
test('all combinations of visible category history retain a supported result',()=>{
 for(const x of [a(),a({area:'body_folds'}),a({area:'vaginal_change',concerns:['change']}),a({area:'urine_leakage'})]){
  const options=triedOptions(x).filter(x=>x!=='nothing');
  for(let mask=0;mask<2**options.length;mask++){
   const history=options.filter((_,i)=>mask&(1<<i)),r=resultFor({...x,triedCategories:history},catalog);
   assert.equal(r.kind,'product');assert.ok(!x.tried.includes(r.primary.id));assert.equal(r.revisitsCategory,history.includes(r.triedCategory));
  }
 }
});
test('odor and wetness can offer five distinct useful picks with the primary first',()=>{
 const r=result({concerns:['both'],sensitivities:['none'],tried:[]});
 assert.equal(r.recommendations.length,5);assert.equal(r.recommendations[0].product.id,r.primary.id);
 assert.equal(new Set(r.recommendations.map(x=>x.product.id)).size,5);
 assert.deepEqual(r.recommendations.map(x=>x.rank),[1,2,3,4,5]);
 assert.match(r.recommendations.find(x=>x.product.category==='deodorant').reason,/does not reduce sweating/);
});
test('the sore-skin example shows cloth and laundry care without a harsh wash',()=>{
 const r=result({area:'body_folds',concerns:['rash'],sensitivities:['none'],triedCategories:['soap','body_wash','deodorant'],tried:[]});
 assert.deepEqual(r.recommendations.map(x=>x.product.id),['utopia-washcloths','tide-free-gentle']);
 assert.match(r.recommendations[1].reason,/not a rash treatment/);
});
test('every shortlisted item respects allergies, exact failures, and body area',()=>{
 for(const area of ['underarms','body_folds','outer_groin','vaginal_change','urine_leakage','unsure']){
  const kind=area==='underarms'?'underarms':['vaginal_change','unsure'].includes(area)?'intimate':'body';
  for(const [concern] of CONCERNS[kind])for(const allergy of [null,...ALLERGENS.map(x=>x[0])]){
   const x=a({area,concerns:area==='urine_leakage'?[]:[concern],sensitivities:allergy?['allergy']:['reactive'],allergies:allergy?[allergy]:[],tried:['mirai-unscented-bar'],triedCategories:['soap','body_wash']});
   const r=resultFor(x,catalog);assert.ok(r.recommendations.length>=1&&r.recommendations.length<=5);
   assert.equal(new Set(r.recommendations.map(i=>i.product.id)).size,r.recommendations.length);
   for(const item of r.recommendations){
    const p=item.product;assert.ok(eligibleProducts(x,catalog,false,p.category||'cleanser').some(y=>y.id===p.id));
    assert.ok(p.candidate&&p.publishEligible&&p.labelVerified);assert.ok(item.reason&&item.role);assert.ok(!x.tried.includes(p.id));
    if(allergy&&allergy!=='other')assert.ok(p.excludesIngredients.includes(allergy));
    assert.notEqual(p.category,'probiotic');
   }
  }
 }
});
test('warning routes add only applicable comfort products, not active treatment fillers',()=>{
 for(const x of [a({concerns:['rash']}),a({area:'vaginal_change',concerns:['change']}),a({area:'vaginal_change',concerns:['symptoms','urine']})]){
  const r=resultFor(x,catalog);assert.ok(r.recommendations.length<=5);
  for(const item of r.recommendations)assert.ok(['cloth','laundry','underwear','bladder','rinse'].includes(item.product.category));
 }
});
test('aluminum-free applies to every recommendation',()=>{
 const r=result({concerns:['both'],aluminumFree:true,tried:[],sensitivities:['none']});
 assert.ok(r.recommendations.every(x=>x.product.aluminumFree!==false));
 assert.ok(r.recommendations.every(x=>x.product.category!=='antiperspirant'));
});

test('the reported mixed intimate route keeps leak protection and five distinct useful picks',()=>{
 const x=a({area:'vaginal_change',concerns:['outside','urine','symptoms'],sensitivities:['none'],tried:[],triedCategories:['nothing']});
 const r=resultFor(x,catalog);assert.equal(r.route,'leaks');assert.equal(r.care,'vaginal');
 assert.deepEqual(r.recommendations.map(x=>x.product.id),['poise-light-pads','frida-peri-bottle','depend-silhouette','hanes-cotton-briefs','utopia-washcloths']);
 const intro=resultIntro(x,r);assert.match(intro.description,/outside skin/);assert.match(intro.description,/bladder leaks/);assert.match(intro.description,/intimate symptoms/);
 assert.match(careMessage(x),/Bleeding after menopause/);assert.match(careMessage(x),/pelvic floor/);
});
test('unsuccessful pads prioritize absorbent underwear without suppressing leak protection',()=>{
 const x=a({area:'urine_leakage',concerns:[],sensitivities:['none'],triedCategories:['pads']});const r=resultFor(x,catalog);
 assert.equal(r.primary.id,'depend-silhouette');assert.match(r.recommendations[0].reason,/Pads or liners have not worked/);
 assert.ok(triedOptions({...x,concerns:['dryness','friction','outside']}).includes('vaginal_moisturizer'));
 assert.ok(triedOptions({...x,concerns:['dryness','friction','outside']}).includes('lubricant'));
});
test('dryness and friction have different jobs and no filler underwear or cleansers',()=>{
 const x=a({area:'vaginal_change',concerns:['dryness','friction'],sensitivities:['none'],tried:[]});const r=resultFor(x,catalog);
 assert.deepEqual(r.recommendations.map(x=>x.product.id),['revaree-original','uberlube','replens-moisturizer']);
 assert.equal(result({...x,concerns:['friction']}).primary.id,'uberlube');
 assert.deepEqual(result({...x,concerns:['dryness']}).recommendations.map(x=>x.product.category),['vaginal_moisturizer','vaginal_moisturizer']);
});
test('new vaginal symptoms block inserts and lubricant but do not erase independent leaks',()=>{
 for(const warning of ['change','symptoms']){
  const x=a({area:'vaginal_change',concerns:['dryness','friction','urine',warning],sensitivities:['none']});const r=resultFor(x,catalog);
  assert.ok(r.recommendations.some(x=>x.product.category==='bladder'));
  assert.ok(r.recommendations.every(x=>!['vaginal_moisturizer','lubricant','barrier','cleanser','probiotic'].includes(x.product.category||'cleanser')));
 }
});
test('irritated or broken skin excludes pads, barriers, washes and inserts in every path',()=>{
 for(const area of ['vaginal_change','urine_leakage','body_folds']){
  const x=a({area,concerns:['urine','dryness','friction','symptoms'],sensitivities:['irritated']});
  for(const c of ['bladder','barrier','vaginal_moisturizer','lubricant','cleanser'])assert.deepEqual(eligibleProducts(x,catalog,false,c),[]);
 }
});
test('chafing gets plain external skin protection, not a harsh bar or internal moisturizer',()=>{
 const x=a({area:'outer_groin',concerns:['chafe'],sensitivities:['none']});const r=resultFor(x,catalog);
 assert.equal(r.primary.id,'vaseline-original');assert.ok(r.recommendations.every(x=>x.product.id!=='mirai-unscented-bar'));
 assert.match(r.recommendations[0].reason,/unbroken skin/);
});
test('specific allergy and failed products are enforced across all multi-concern combinations',()=>{
 const options=CONCERNS.intimate.map(x=>x[0]).filter(x=>x!=='unsure');
 for(let mask=1;mask<(1<<options.length);mask++)for(const allergy of [null,...ALLERGENS.map(x=>x[0])]){
  const concerns=options.filter((_,i)=>mask&(1<<i));const x=a({area:'vaginal_change',concerns,sensitivities:allergy?['allergy']:['none'],allergies:allergy?[allergy]:[],tried:['replens-moisturizer']});
  const r=resultFor(x,catalog);assert.equal(r.kind,'product',JSON.stringify(x));assert.ok(r.recommendations.length<=5);
  assert.equal(new Set(r.recommendations.map(x=>x.product.id)).size,r.recommendations.length);
  for(const item of r.recommendations){
   assert.notEqual(item.product.id,'replens-moisturizer');assert.ok(item.reason&&item.role);assert.ok(item.product.candidate&&item.product.labelVerified&&item.product.publishEligible);
   if(allergy&&allergy!=='other')assert.ok(item.product.excludesIngredients.includes(allergy));
   if(hasIntimateWarning(x))assert.ok(!['vaginal_moisturizer','lubricant','barrier','cleanser','probiotic'].includes(item.product.category||'cleanser'));
  }
  const copy=resultIntro(x,r);assert.ok(copy.title&&copy.description);assert.doesNotMatch(copy.description,/undefined|null/);
 }
});
test('copy follows selected needs without claiming that every person wants odor treatment',()=>{
 const x=a({area:'vaginal_change',concerns:['dryness'],sensitivities:['none']});const r=resultFor(x,catalog);assert.match(resultIntro(x,r).description,/vaginal dryness during the day/);
 assert.doesNotMatch(resultIntro(x,r).description,/smell comes back|odor that returns/);
 const b=a({area:'body_folds',concerns:['odor','clothes'],sensitivities:['fragrance'],triedCategories:['soap']});const rb=resultFor(b,catalog);assert.match(resultIntro(b,rb).description,/clothes/);assert.match(resultIntro(b,rb).description,/returns after washing/);
 assert.ok(rb.recommendations.some(x=>x.product.id==='tide-free-gentle'));
 for(const p of rb.recommendations)assert.doesNotMatch(p.reason,/washing step on body skin|layer washes/);
});
test('products with different jobs never claim compatibility with all condoms',()=>{
 const rev=catalog.find(x=>x.id==='revaree-original'),rep=catalog.find(x=>x.id==='replens-moisturizer'),uber=catalog.find(x=>x.id==='uberlube');
 assert.match(rev.caveat,/Not compatible with condoms/);assert.match(rep.caveat,/polyurethane/);assert.match(uber.caveat,/polyurethane/);
});
test('dampness-only and uncertain answers do not become recurring odor claims',()=>{
 for(const concern of ['damp','unsure']){
  const x=a({area:'body_folds',concerns:[concern],sensitivities:['none'],tried:[]});const r=resultFor(x,catalog);
  for(const item of r.recommendations)assert.doesNotMatch(item.reason,/smell comes back|odor that comes back/);
  assert.doesNotMatch(resultIntro(x,r).description,/odor that returns/);
 }
});
test('pad alternative is labeled accurately when absorbent underwear comes first',()=>{
 const r=result({area:'urine_leakage',concerns:[],sensitivities:['none'],triedCategories:['pads']});
 const pad=r.recommendations.find(x=>x.product.id==='poise-light-pads');
 assert.equal(pad.role,'Prefer a light pad?');
});

test('clothing odor never pushes laundry ahead of applicable body care',()=>{
 for(const concerns of [['clothes'],['odor','clothes'],['damp','clothes'],['chafe','clothes']]){
  const x=a({area:'body_folds',concerns,sensitivities:['none'],tried:[]});const r=resultFor(x,catalog);
  assert.notEqual(r.primary.category,'laundry');
  const laundry=r.recommendations.findIndex(i=>i.product.category==='laundry');
  assert.ok(laundry>0);
  assert.ok(r.recommendations.slice(laundry+1).every(i=>!['cleanser','moisture','barrier'].includes(i.product.category||'cleanser')));
 }
 const x=a({area:'body_folds',concerns:['clothes'],sensitivities:['none'],tried:[]});
 assert.match(resultIntro(x,resultFor(x,catalog)).title,/Body-odor care first/);
});

// Every currently shoppable product must reach its own listing with the fixed tag.
test('all publishable recommendations and browse items have direct Amazon destinations',()=>{
 const active=catalog.filter(p=>p.publishEligible&&(p.candidate||p.browseEligible));
 assert.equal(active.length,16);
 assert.equal(new Set(active.map(p=>p.asin)).size,active.length);
 for(const p of active){
  assert.equal(p.exactListingVerified,true,p.id);
  assert.match(p.asin,/^B[A-Z0-9]{9}$/,p.id);
  const u=new URL(amazonURL(p));
  assert.equal(u.origin,'https://www.amazon.com');
  assert.equal(u.pathname,`/dp/${p.asin}`,p.id);
  assert.deepEqual([...u.searchParams],[['tag','menopausewash-20']],p.id);
 }
});
