import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {freshAnswers, changeArea, toggleExclusive, careReason, routeAfterConcern, routeAfterSensitivity, eligibleProducts, resultFor, amazonURL, validateCatalog, finderPath, ALLERGENS, CONCERNS, triedOptions, TRIED_CATEGORIES} from '../finder_src/engine.mjs';
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
test('clothes and dampness get products for the correct job',()=>{for(const [c,category] of [['clothes','laundry'],['damp','moisture']])assert.equal(result({area:'body_folds',concerns:[c]}).primary.category,category);});
test('uncertain underarm answer has its own explanation and an odor product',()=>{const r=result({concerns:['unsure']});assert.equal(r.route,'odor-unsure');assert.equal(r.primary.category,'deodorant');});
test('Amazon parameters contain fixed product and affiliate tag only',()=>{const p=catalog[2],u=new URL(amazonURL(p));assert.equal(u.hostname,'www.amazon.com');assert.deepEqual([...u.searchParams.keys()],['k','tag']);assert.equal(u.searchParams.get('tag'),'menopausewash-20');assert.equal(u.searchParams.get('k'),p.amazonQuery);});
test('invalid catalog fails separately from no-match',()=>{assert.throws(()=>validateCatalog([]));assert.throws(()=>validateCatalog([catalog[0],catalog[0]]));assert.throws(()=>validateCatalog([{...catalog[2],ingredients:null}]));});
test('finder shell and application contain no health persistence, external tracker, or simulated delay',()=>{const app=fs.readFileSync(new URL('../finder_src/app.mjs',import.meta.url),'utf8'),html=fs.readFileSync(new URL('../finder_src/index.html',import.meta.url),'utf8');assert.doesNotMatch(app,/localStorage|sessionStorage|setTimeout|setInterval|gtag\(|pushState|replaceState/);assert.doesNotMatch(html,/googletagmanager|fonts.googleapis|analytics/);assert.match(html,/no-referrer/);assert.match(html,/connect-src 'self'/);});

test('known ingredients stay excluded in every category and fallback',()=>{for(const [allergen] of ALLERGENS.filter(x=>x[0]!=='other'))for(const area of ['underarms','body_folds','outer_groin','urine_leakage','vaginal_change']){const x=a({area,sensitivities:['allergy'],allergies:[allergen]});const r=resultFor(x,catalog);assert.equal(r.kind,'product');assert.ok(r.primary.excludesIngredients.includes(allergen));for(const p of r.alternatives)assert.ok(p.excludesIngredients.includes(allergen));}});
test('tried antiperspirant stays excluded while another routine part is offered',()=>{const x=a({concerns:['both'],sensitivities:['none'],tried:['vanicream-antiperspirant']});const r=resultFor(x,catalog,true);assert.equal(r.kind,'product');assert.notEqual(r.primary.id,'vanicream-antiperspirant');assert.deepEqual(eligibleProducts(x,catalog,true,'antiperspirant'),[]);});
test('care flags cannot be bypassed with category browsing',()=>{for(const category of ['cleanser','antiperspirant','deodorant','probiotic','moisture'])assert.deepEqual(eligibleProducts(a({concerns:['rash']}),catalog,true,category),[]);});
test('underarm antiperspirant never appears for outer groin or folds',()=>{for(const area of ['outer_groin','body_folds'])assert.deepEqual(eligibleProducts(a({area}),catalog,true,'antiperspirant'),[]);});
test('probiotic is optional only, never an automatic odor or sweat match',()=>{for(const area of ['underarms','body_folds','outer_groin'])assert.notEqual(result({area}).primary?.category,'probiotic');});
test('verified Amazon listing uses exact ASIN and fixed tag only',()=>{const p=catalog.find(p=>p.id==='vanicream-antiperspirant'),u=new URL(amazonURL(p));assert.equal(u.pathname,'/dp/B01M7ZAQNN');assert.deepEqual([...u.searchParams.keys()],['tag']);assert.equal(u.searchParams.get('tag'),'menopausewash-20');});
test('unverified Amazon listing stays an explicit product search',()=>{const p=catalog.find(p=>p.id==='vanicream-deodorant'),u=new URL(amazonURL(p));assert.equal(u.pathname,'/s');assert.equal(u.searchParams.get('k'),p.amazonQuery);});
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
