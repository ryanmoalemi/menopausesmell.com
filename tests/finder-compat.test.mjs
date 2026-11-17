import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchJSON} from '../finder_src/compat.mjs';
test('startup fetch works without AbortSignal.timeout or AbortController',async()=>{
 const result=await fetchJSON('/catalog.json',{Controller:null,fetcher:async(url,options)=>{assert.equal(url,'/catalog.json');assert.equal(options.signal,undefined);return {ok:true,json:async()=>({products:1})}}});
 assert.deepEqual(result,{products:1});
});
test('hung requests and stalled JSON bodies time out even without abort support',async()=>{
 for(const fetcher of [()=>new Promise(()=>{}),async()=>({ok:true,json:()=>new Promise(()=>{})})]){
  await assert.rejects(fetchJSON('/catalog.json',{timeout:10,Controller:null,fetcher}),/timed out/);
 }
});
test('HTTP and invalid JSON failures reject for the caller to handle',async()=>{
 await assert.rejects(fetchJSON('/catalog.json',{fetcher:async()=>({ok:false})}),/unavailable/);
 await assert.rejects(fetchJSON('/catalog.json',{fetcher:async()=>({ok:true,json:async()=>{throw Error('Invalid JSON')}})}),/Invalid JSON/);
});
test('optional review failure does not prevent catalog and configuration from loading',async()=>{
 const values=await Promise.all([fetchJSON('/catalog.json',{fetcher:async()=>({ok:true,json:async()=>['product']})}),fetchJSON('/reviews.json',{timeout:10,fetcher:()=>new Promise(()=>{})}).catch(()=>null)]);
 assert.deepEqual(values,[['product'],null]);
});
