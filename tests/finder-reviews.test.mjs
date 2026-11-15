import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {freshAnswers} from '../finder_src/engine.mjs';
import {reviewsForProduct,featuredReviews} from '../finder_src/reviews.mjs';
const now=Date.parse('2026-11-15T12:00:00Z');
const base={...freshAnswers(),area:'body_folds',concerns:['clothes'],sensitivities:['none']};
const product={id:'soap'};
const review=(id,tags,sentiment='positive')=>({id,source:'reddit',productIds:['soap'],productScope:'family',productScopeNote:'Variant not specified.',quote:'This helped me.',sourceUrl:`https://www.reddit.com/r/Menopause/comments/abc/comment/${id}/`,checkedAt:'2026-11-15',tags,sentiment});
const data=reviews=>({version:1,maxAgeDays:56,reviews});
test('clothes concern matches body odor and clothes experiences before unrelated topics',()=>{
 const matches=reviewsForProduct(base,product,data([review('a',['reactive']),review('b',['odor']),review('c',['odor','clothes'])]),now);
 assert.deepEqual(matches.map(r=>r.id),['c','b','a']);assert.deepEqual(matches[0].matchedTags,['odor','clothes']);
});
test('changing sensitivity changes the top experience without modifying the quote',()=>{
 const d=data([review('a',['odor']),review('b',['reactive'])]);
 assert.equal(featuredReviews(reviewsForProduct(base,product,d,now))[0].id,'a');
 const match=featuredReviews(reviewsForProduct({...base,sensitivities:['reactive']},product,d,now))[0];
 assert.equal(match.id,'b');assert.equal(match.quote,'This helped me.');
});
test('only one positive experience appears, never negative or mixed feedback',()=>{
 assert.deepEqual(featuredReviews([review('a',[],'negative'),review('b',[],'mixed')]),[]);
 assert.deepEqual(featuredReviews([review('a',[],'negative'),review('b',[]),review('c',[])]).map(r=>r.id),['b']);
});
test('stale, future, unrelated, unauthorized and variant-ambiguous records cannot display',()=>{
 const good=review('good',['odor']);
 const cases=[{...good,id:'old',checkedAt:'2026-08-01'},{...good,id:'future',checkedAt:'2026-11-16'},{...good,id:'product',productIds:['other']},{...good,id:'amazon',source:'amazon'},{...good,id:'scope',productScopeNote:''},{...good,id:'url',sourceUrl:'javascript:alert(1)'}];
 assert.deepEqual(reviewsForProduct(base,product,data(cases),now),[]);
});
test('zero topic overlap is not described as a personal match',()=>{const r=reviewsForProduct(base,product,data([review('a',['dryness'])]),now)[0];assert.equal(r.score,0);assert.deepEqual(r.matchedTags,[]);});
test('unknown allergies do not become review-match claims',()=>{const r=reviewsForProduct({...base,concerns:[],sensitivities:['allergy'],allergies:['other']},product,data([review('a',['reactive','fragrance'])]),now)[0];assert.equal(r.score,0);});
test('failed or malformed review fetch leaves shopping usable',()=>{for(const d of [null,{},[],{version:2,reviews:[]}])assert.deepEqual(reviewsForProduct(base,product,d,now),[]);});
test('the shipped corpus preserves verified excerpts, positive selection and no invented ratings',()=>{
 const corpus=JSON.parse(fs.readFileSync(new URL('../data/finder-reviews.json',import.meta.url)));
 assert.ok(corpus.reviews.length>0);assert.equal(corpus.providers.amazon.enabled,false);
 for(const r of corpus.reviews){if(r.status==='verified')assert.ok(r.sourceText.includes(r.quote));assert.ok(['verified','candidate','withdrawn'].includes(r.status));assert.equal(r.rating,undefined);assert.equal(r.avatar,undefined);}
});
