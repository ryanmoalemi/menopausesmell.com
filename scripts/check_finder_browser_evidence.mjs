import fs from 'node:fs';
import assert from 'node:assert/strict';
import {freshAnswers,resultFor,amazonURL} from '../finder_src/engine.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../docs/finder-review/100-journey-retest.json',import.meta.url)));
const catalog=JSON.parse(fs.readFileSync(new URL('../data/finder-products.json',import.meta.url)));
assert.equal(data.runs.length,100);
assert.equal(new Set(data.runs.map(x=>x.id)).size,100);
for(const x of data.runs){
 const a={...freshAnswers(),area:x.area,concerns:x.concerns,sensitivities:[x.skin],allergies:x.allergen?[x.allergen]:[],triedCategories:[x.tried]};
 const r=resultFor(a,catalog);
 assert.equal(r.kind,'product',`case ${x.id}`);
 const ordered=[...r.recommendations.filter(x=>x.section!=='optional'),...r.recommendations.filter(x=>x.section==='optional')];
 assert.deepEqual(x.products,ordered.map(x=>x.product.id),`case ${x.id}: product order`);
 assert.deepEqual(x.links.map(x=>x.href),r.allergyReview?[]:ordered.map(x=>amazonURL(x.product)),`case ${x.id}: shopping links`);
 assert.equal(x.overflow,false,`case ${x.id}: overflow`);
 assert.deepEqual(x.broken,[],`case ${x.id}: images`);
 assert.ok(x.benefits.every(n=>n>=2&&n<=3),`case ${x.id}: benefits`);
}
console.log('PASS: all 100 observed browser journeys agree with the current engine, shopping eligibility and destinations; no observed overflow or broken images.');
