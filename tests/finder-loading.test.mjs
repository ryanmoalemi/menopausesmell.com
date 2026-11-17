import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {freshAnswers,resultFor} from '../finder_src/engine.mjs';
import {loadingSteps,canCelebrate,timeline,createRecommendationReveal,loadingMarkup,matchedExperiences} from '../finder_src/loading.mjs';
import {loadFinderData} from '../finder_src/finder-data.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/finder-products.json',import.meta.url)));
const a=patch=>({...freshAnswers(),area:'underarms',concerns:['odor'],sensitivities:['none'],triedCategories:['nothing'],...patch});
const result=answers=>resultFor(answers,catalog,false);
test('the primary product controls the Amazon category copy',()=>{
 for(const [category,copy] of Object.entries({cleanser:'body washes and cleansers',deodorant:'odor-control products',antiperspirant:'sweat-control products',moisture:'moisture-control products',laundry:'laundry products for odor',bladder:'bladder-leak products',underwear:'underwear options',cloth:'soft washcloths',rinse:'rinsing options',barrier:'skin-protection products',vaginal_moisturizer:'vaginal moisturizers',lubricant:'personal lubricants',probiotic:'supplement options'})){
  const r={primary:{id:'fixture',category},recommendations:[]};assert.equal(loadingSteps(a(),r,null)[1].text,`Comparing ${copy} in our researched shortlist.`);
 }
});
test('underarm sweat, odor and both use the actual recommendation and concern',()=>{
 for(const [concern,category,phrase] of [['odor','odor-control','underarm odor'],['wetness','sweat-control','underarm sweating'],['both','sweat-control','underarm odor and sweating']]){
  const answers=a({concerns:[concern]}),steps=loadingSteps(answers,result(answers),null);
  assert.match(steps[1].text,new RegExp(category));assert.ok(steps[3].text.includes(phrase));
 }
});
test('source absence never invents a Reddit check',()=>{
 const steps=loadingSteps(a(),result(a()),null);assert.equal(steps[0].label,'YOUR STARTING POINT');assert.doesNotMatch(steps[0].text,/Reddit/);
});
test('only a fresh, positive, product- and topic-matched quote enables experiences',()=>{
 const answers=a(),r=result(answers),now=Date.parse('2026-11-16T12:00:00Z');
 const row={id:'fixture',source:'reddit',sourceUrl:'https://www.reddit.com/r/example/comments/abc123/example/def456/',productIds:[r.primary.id],productScope:'exact',quote:'Synthetic test text, never a public testimonial.',tags:['odor'],sentiment:'positive',checkedAt:'2026-11-15'};
 const data={version:1,maxAgeDays:56,reviews:[row]};assert.equal(matchedExperiences(answers,r,data,now).length,1);
 assert.match(loadingSteps(answers,r,data,now)[0].text,/Reddit/);
 for(const patch of [{sentiment:'negative'},{checkedAt:'2025-01-01'},{checkedAt:'2027-01-01'},{tags:['dryness']},{productIds:['another-product']},{productScope:'family',productScopeNote:''}]){
  assert.equal(matchedExperiences(answers,r,{...data,reviews:[{...row,...patch}]},now).length,0);
 }
});
test('known preferences and exclusions produce honest step 3 text',()=>{
 const cases=[
  [{sensitivities:['fragrance']},/fragrance preferences/],
  [{sensitivities:['reactive']},/sensitive-skin preferences/],
  [{sensitivities:['allergy'],allergies:['lanolin']},/ingredient restrictions/],
  [{tried:['lume-unscented-wash']},/exact products/],
  [{triedCategories:['body_wash']},/approaches/],
  [{},/main concern/]
 ];
 for(const [patch,expected] of cases){const answers=a(patch);assert.match(loadingSteps(answers,result(answers),null)[2].text,expected);}
});
test('care, unresolved allergy and no-match results bypass the celebration',()=>{
 for(const answers of [a({area:'vaginal_change',concerns:['change']}),a({concerns:['rash']}),a({sensitivities:['allergy'],allergies:['other']}),a({tried:catalog.filter(p=>p.candidate).map(p=>p.id)})])assert.equal(canCelebrate(result(answers)),false);
 assert.equal(canCelebrate(result(a())),true);assert.equal(canCelebrate(null),false);
});
test('four full stages last 12.8 seconds and expose each boundary',()=>{
 for(let i=0;i<4;i++){assert.equal(timeline(i*3200).index,i);assert.equal(timeline(i*3200).progress,0);}
 assert.equal(timeline(12799).done,false);assert.equal(timeline(12800).done,true);assert.equal(timeline(999999).progress,1);assert.throws(()=>timeline(0,0));
});
test('rendering escapes dynamic text',()=>{
 const steps=loadingSteps(a(),result(a()),null);steps[0].text='<img onerror="attack">';assert.ok(loadingMarkup(steps).includes('&lt;img'));assert.ok(!loadingMarkup(steps).includes('<img onerror'));
});
function fakeView(options={}){
 let time=0,id=0;const frames=new Map(),listeners=new Map();
 const element=()=>({style:{},classList:{toggle(){},remove(){}},setAttribute(){},removeAttribute(){},focus(){}});
 const rows=Array.from({length:4},()=>{const e=element(),bar=element();e.querySelector=()=>bar;return e;});
 const status={textContent:''},root={...element(),innerHTML:'',querySelectorAll:()=>rows,querySelector:s=>s==='.mw-loading-status'?status:element()};
 const documentRef={hidden:false,addEventListener:(key,cb)=>listeners.set(key,cb),removeEventListener:key=>listeners.delete(key)};
 const controller=createRecommendationReveal({root,clock:()=>time,requestFrame:cb=>{frames.set(++id,cb);return id;},cancelFrame:id=>frames.delete(id),documentRef,windowRef:{scrollTo(){}},...options});
 return {controller,root,status,documentRef,advance(ms){time+=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(cb=>cb());},visibility(hidden){documentRef.hidden=hidden;listeners.get('visibilitychange')?.();},pending:()=>frames.size};
}
test('controller advances, announces the finale and completes exactly once',()=>{
 const v=fakeView();let completed=0;v.controller.start({steps:loadingSteps(a(),result(a()),null),onReady:()=>completed++});
 v.advance(9600);assert.match(v.status.textContent,/4 of 4/);assert.equal(completed,0);v.advance(3200);assert.equal(completed,1);v.advance(10000);assert.equal(completed,1);assert.equal(v.pending(),0);
});
test('back or reset cancels stale result callbacks',()=>{
 const v=fakeView();let completed=0;v.controller.start({steps:loadingSteps(a(),result(a()),null),onReady:()=>completed++});v.advance(3200);v.controller.cancel();v.advance(20000);assert.equal(completed,0);assert.equal(v.controller.active,false);
});
test('a new run replaces the previous run and hidden tabs do not skip the reveal',()=>{
 const v=fakeView();let first=0,second=0;const steps=loadingSteps(a(),result(a()),null);
 v.controller.start({steps,onReady:()=>first++});v.controller.start({steps,onReady:()=>second++});v.visibility(true);v.advance(20000);v.visibility(false);v.advance(3200);assert.equal(second,0);v.advance(9600);assert.equal(first,0);assert.equal(second,1);
});
test('loader requests only three public files and tolerates missing reviews',async()=>{
 const calls=[];const data=await loadFinderData({baseURL:'https://example.test/product-finder/',fetchImpl:async(url,opts)=>{calls.push({url:String(url),opts});return{ok:!String(url).endsWith('reviews.json'),json:async()=>String(url).endsWith('catalog.json')?[]:{tracking_id:'menopausewash-20'}};}});
 assert.equal(data.reviews,null);assert.equal(calls.length,3);assert.ok(calls.every(x=>x.opts.credentials==='omit'&&new URL(x.url).search===''));
});
test('failed required data rejects and can be retried by the existing UI',async()=>{
 await assert.rejects(loadFinderData({baseURL:'https://example.test/',fetchImpl:async()=>({ok:false})}),/unavailable/);
});
test('review timeout does not block recommendations',async()=>{
 const data=await loadFinderData({baseURL:'https://example.test/',reviewsTimeoutMs:1,fetchImpl:async(url,{signal})=>{
  if(String(url).endsWith('reviews.json'))return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('timeout'))));
  return{ok:true,json:async()=>({})};
 }});assert.equal(data.reviews,null);
});

test('an open dialog pauses the presentation until dismissed',()=>{
 let paused=false,completed=0;const v=fakeView({isPaused:()=>paused});
 v.controller.start({steps:loadingSteps(a(),result(a()),null),onReady:()=>completed++});
 v.advance(3200);paused=true;v.advance(20000);assert.equal(completed,0);paused=false;v.advance(9600);assert.equal(completed,1);
});
test('public data still times out when AbortController is unavailable',async()=>{
 const payload=await loadFinderData({baseURL:'https://example.test/',Controller:null,reviewsTimeoutMs:5,fetchImpl:async url=>String(url).endsWith('reviews.json')?new Promise(()=>{}):{ok:true,json:async()=>[]}});
 assert.equal(payload.reviews,null);
});
test('loading only describes recorded research and does not introduce remote searches',()=>{
 const source=fs.readFileSync(new URL('../finder_src/loading.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(source,/fetch\(|localStorage|sessionStorage|https:\/\/|on Amazon\./);
 assert.match(source,/researched shortlist/);
});
