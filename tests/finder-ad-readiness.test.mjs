import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {freshAnswers,resultFor,validateCatalog} from '../finder_src/engine.mjs';
import {countEvent} from '../finder_src/metrics.mjs';
const catalog=validateCatalog(JSON.parse(fs.readFileSync(new URL('../data/finder-products.json',import.meta.url))));
const result=patch=>resultFor({...freshAnswers(),sensitivities:['none'],triedCategories:['nothing'],...patch},catalog);
test('failed antiperspirant leaves an honest no-match for wetness alone',()=>{
 const r=result({area:'underarms',concerns:['wetness'],tried:['vanicream-antiperspirant']});
 assert.deepEqual(r,{kind:'no-match',reason:'sweat'});
});

test('damp folds and chafing never combine InterDry and ointment, including history changes',()=>{
 for(const tried of [[],['interdry-fabric'],['vaseline-original']]){
  const r=result({area:'body_folds',concerns:['damp','chafe'],tried});
  const ids=r.recommendations.map(x=>x.product.id);
  assert.ok(!(ids.includes('interdry-fabric')&&ids.includes('vaseline-original')));
  for(const id of tried)assert.ok(!ids.includes(id));
 }
});
test('underarm shopping starts with one product, one alternative and collapsed accessories',()=>{
 const r=result({area:'underarms',concerns:['both']});
 assert.equal(r.recommendations[0].section,'primary');
 assert.equal(r.recommendations.filter(x=>x.section==='alternative').length,1);
 assert.ok(r.recommendations.filter(x=>['cleanser','cloth'].includes(x.product.category||'cleanser')).every(x=>x.section==='optional'));
});
test('independent dryness and friction needs stay visible together',()=>{
 const r=result({area:'vaginal_change',concerns:['dryness','friction']});
 assert.equal(r.recommendations.find(x=>x.product.id==='uberlube').section,'additional');
 assert.equal(r.recommendations.find(x=>x.product.id==='replens-moisturizer').section,'alternative');
});
test('every purchasable recommendation has two or three sourced benefits',()=>{
 for(const p of catalog.filter(p=>p.candidate)){
  assert.ok(p.benefits.length>=2&&p.benefits.length<=3,p.id);
  assert.ok(p.benefitsSource&&p.benefitsChecked,p.id);
 }
});
test('funnel messages reject unapproved names and never contain passed health or product details',()=>{
 assert.equal(countEvent('allergy_silver'),null);
 assert.equal(countEvent('finder_step','underarms'),null);
 assert.equal(countEvent('finder_step',0),null);
 assert.deepEqual(countEvent('finder_complete',{allergies:['silver']}),{type:'finder-count',name:'finder_complete'});
 assert.deepEqual(countEvent('finder_step',2),{type:'finder-count',name:'finder_step',step:2});
});
test('measurement frame discards extra payload fields and rejects other senders',()=>{
 const parent={},head={append(){}},listeners={};
 const window={parent,addEventListener:(name,fn)=>listeners[name]=fn};parent.postMessage=()=>{};
 const code=fs.readFileSync(new URL('../finder_src/metrics-frame.js',import.meta.url),'utf8').replace('__MEASUREMENT_ID__','G-TEST123');
 vm.runInNewContext(code,{window,document:{createElement:()=>({}),head},Date});
 const before=window.dataLayer.length;
 listeners.message({source:{},data:{type:'finder-count',name:'finder_complete'}});
 assert.equal(window.dataLayer.length,before);
 listeners.message({source:parent,data:{type:'finder-count',name:'finder_complete',answers:{allergies:['silver']},link_url:'https://sensitive.invalid',product:'private'}});
 const event=Array.from(window.dataLayer.at(-1));
 assert.equal(event[0],'event');assert.equal(event[1],'finder_complete');
 assert.deepEqual(Object.keys(event[2]).sort(),['allow_ad_personalization_signals','allow_google_signals','page_location','page_referrer','page_title','send_page_view','send_to'].sort());
 assert.equal(event[2].page_location,'https://menopausewash.com/product-finder/');
 assert.equal(event[2].page_referrer,'');
});
